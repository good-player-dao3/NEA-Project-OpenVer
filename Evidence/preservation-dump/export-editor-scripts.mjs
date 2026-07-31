import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

class CdpClient {
  constructor(url, eventHandler) {
    this.url = url;
    this.eventHandler = eventHandler;
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolveConnect, rejectConnect) => {
      const timeout = setTimeout(() => rejectConnect(new Error("CDP connection timed out.")), 15_000);
      this.socket.addEventListener("open", () => { clearTimeout(timeout); resolveConnect(); }, { once: true });
      this.socket.addEventListener("error", () => { clearTimeout(timeout); rejectConnect(new Error("CDP connection failed.")); }, { once: true });
    });
    this.socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const pending = this.pending.get(message.id);
        this.pending.delete(message.id);
        clearTimeout(pending.timeout);
        if (message.error) pending.reject(new Error(`${pending.method}: ${JSON.stringify(message.error)}`));
        else pending.resolve(message.result);
      } else if (message.method) this.eventHandler(message);
    });
  }

  send(method, params = {}, timeoutMs = 30_000) {
    const id = this.nextId++;
    return new Promise((resolveRequest, rejectRequest) => {
      const timeout = setTimeout(() => { this.pending.delete(id); rejectRequest(new Error(`${method} timed out.`)); }, timeoutMs);
      this.pending.set(id, { resolve: resolveRequest, reject: rejectRequest, timeout, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.socket?.readyState < WebSocket.CLOSING) this.socket.close();
  }
}

const options = await parseOptions(process.argv.slice(2));
const targets = await fetchJson(`http://127.0.0.1:${options.port}/json/list`);
const target = targets.find(item => {
  if (item.type !== "page") return false;
  try { return new URL(item.url).pathname === options.editorPath; } catch { return false; }
});
if (!target?.webSocketDebuggerUrl) throw new Error(`Editor target not found for ${options.editorPath}`);

const contexts = [];
const client = new CdpClient(target.webSocketDebuggerUrl, event => {
  if (event.method === "Runtime.executionContextCreated") contexts.push(event.params.context);
});
await client.connect();
await client.send("Runtime.enable");
await client.send("Page.enable");
await client.send("Page.bringToFront");
await delay(750);

const context = contexts.find(item => item.auxData?.isDefault === true && String(item.origin).includes("view.dao3.fun"));
if (!context) throw new Error("The editor iframe execution context was not found.");

const directFiles = await evaluate(client, context.id, `(() => {
  const start = document.querySelector('[id^=script-item-]');
  const fiberKey = start && Object.keys(start).find(key => key.startsWith('__reactFiber$'));
  let fiber = fiberKey ? start[fiberKey] : null;
  let game = globalThis.__neaGame ?? null;
  while (fiber && !game) {
    let hook = fiber.memoizedState;
    while (hook) {
      const value = hook.memoizedState;
      if (value && typeof value === 'object' && value.codeEditorController && value.replica) {
        game = value;
        break;
      }
      hook = hook.next;
    }
    fiber = fiber.return;
  }
  const controller = game?.codeEditorController;
  if (!controller?.getFileList) return null;
  return controller.getFileList().map(file => ({
    id: String(file.fileId),
    name: String(file.name),
    isClient: Boolean(file.isClient),
    order: Number(file.order),
    declaredSize: Number(file.size),
    text: String(file.text ?? ''),
  }));
})()`);

if (Array.isArray(directFiles) && directFiles.length > 0) {
  const directManifest = {
    format: "nea-editor-script-export",
    version: 2,
    strategy: "react-controller-state",
    capturedAt: new Date().toISOString(),
    editorPath: options.editorPath,
    targetId: target.id,
    sections: [],
  };
  for (const side of ["server", "client"]) {
    const outputDirectory = resolve(options.output, "manual-cdp", "source", side);
    await mkdir(outputDirectory, { recursive: true });
    const sectionResult = { title: side, side, files: [] };
    directManifest.sections.push(sectionResult);
    const files = directFiles
      .filter(file => file.isClient === (side === "client"))
      .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));
    for (const file of files) {
      const fileName = safeFileName(file.name || `${file.id}.js`);
      const outputPath = resolve(outputDirectory, fileName);
      const bytes = Buffer.from(file.text, "utf8");
      if (bytes.length > 0 || !(await exists(outputPath))) await writeFile(outputPath, bytes);
      const savedBytes = await readFile(outputPath);
      sectionResult.files.push({
        id: file.id,
        name: file.name,
        order: file.order,
        file: `manual-cdp/source/${side}/${fileName}`,
        bytes: savedBytes.length,
        characters: savedBytes.toString("utf8").length,
        declaredSize: file.declaredSize,
        sha256: sha256(savedBytes),
        empty: savedBytes.length === 0,
      });
      console.log(`[${side}] ${file.name}: ${savedBytes.length} bytes`);
    }
  }
  const directResults = directManifest.sections.flatMap(section => section.files);
  directManifest.counts = {
    server: directManifest.sections.find(section => section.side === "server")?.files.length ?? 0,
    client: directManifest.sections.find(section => section.side === "client")?.files.length ?? 0,
    empty: directResults.filter(file => file.empty).length,
    bytes: directResults.reduce((sum, file) => sum + file.bytes, 0),
  };
  directManifest.finishedAt = new Date().toISOString();
  const directManifestPath = resolve(options.output, "manual-cdp", "editor-scripts.json");
  await mkdir(resolve(options.output, "manual-cdp"), { recursive: true });
  await writeFile(directManifestPath, `${JSON.stringify(directManifest, null, 2)}\n`);
  client.close();
  console.log(`Exported ${directManifest.counts.server} server and ${directManifest.counts.client} client scripts (${directManifest.counts.bytes} bytes, ${directManifest.counts.empty} empty).`);
  process.exit(0);
}

const sections = await evaluate(client, context.id, `(() => [...document.querySelectorAll('[class*=script-manager_scriptTab]')].map((tab, sectionIndex) => {
  const list = tab.nextElementSibling;
  return {
    sectionIndex,
    title: tab.textContent?.trim() ?? '',
    items: [...(list?.querySelectorAll('[id^=script-item-]') ?? [])].map((element, itemIndex) => ({ id: element.id, name: element.textContent?.trim() ?? '', itemIndex })),
  };
}))()`);

const manifest = {
  format: "nea-editor-script-export",
  version: 1,
  capturedAt: new Date().toISOString(),
  editorPath: options.editorPath,
  targetId: target.id,
  sections: [],
};
const manifestPath = resolve(options.output, "manual-cdp", "editor-scripts.json");

for (const section of sections) {
  const side = section.sectionIndex === 1 ? "client" : "server";
  const outputDirectory = resolve(options.output, "manual-cdp", "source", side);
  await mkdir(outputDirectory, { recursive: true });
  const sectionResult = { title: section.title, side, files: [] };
  manifest.sections.push(sectionResult);

  for (const item of section.items) {
    const fileName = safeFileName(item.name || `${item.id}.js`);
    const outputPath = resolve(outputDirectory, fileName);
    if (await exists(outputPath)) {
      const bytes = await readFile(outputPath);
      sectionResult.files.push({
        id: item.id,
        name: item.name,
        file: `manual-cdp/source/${side}/${fileName}`,
        bytes: bytes.length,
        characters: bytes.toString("utf8").length,
        sha256: sha256(bytes),
        empty: bytes.length === 0,
        resumed: true,
      });
      await checkpointManifest();
      console.log(`[${side}] ${item.name}: resumed ${bytes.length} bytes`);
      continue;
    }

    const started = Date.now();
    const clicked = await evaluate(client, context.id, `(() => {
      const element = document.getElementById(${JSON.stringify(item.id)});
      if (!element) return false;
      element.scrollIntoView({ block: 'center', inline: 'nearest' });
      element.click();
      return true;
    })()`);
    if (!clicked) throw new Error(`Script item disappeared: ${item.id}`);

    let state = null;
    let stableCount = 0;
    let previousSignature = null;
    let lastRetryAt = started;
    while (Date.now() - started < options.timeoutMs) {
      await delay(options.pollMs);
      state = await evaluate(client, context.id, `(() => {
        const selected = document.querySelector('[id^=script-item-][class*=script-manager_selected]');
        const header = document.querySelector('[class*=script-editor_header__]');
        const models = globalThis.monaco?.editor?.getModels?.() ?? [];
        const model = models[0] ?? null;
        return {
          selectedId: selected?.id ?? null,
          header: header?.textContent?.trim() ?? null,
          modelCount: models.length,
          uri: model ? String(model.uri) : null,
          languageId: model?.getLanguageId?.() ?? null,
          versionId: model?.getVersionId?.() ?? null,
          value: model?.getValue?.() ?? null,
        };
      })()`);
      const ready = state?.selectedId === item.id && state?.header === item.name && typeof state?.value === "string";
      const signature = ready ? `${state.versionId}:${state.value.length}:${sha256(Buffer.from(state.value))}` : null;
      if (ready && signature === previousSignature && Date.now() - started >= options.minimumWaitMs) stableCount += 1;
      else stableCount = ready ? 1 : 0;
      previousSignature = signature;
      if (stableCount >= options.stablePolls) break;

      if (!ready && Date.now() - lastRetryAt >= options.retryMs) {
        const retry = await evaluate(client, context.id, `(() => {
          const visible = element => { const rect = element.getBoundingClientRect(); const style = getComputedStyle(element); return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'; };
          const errorModal = [...document.querySelectorAll('[class*=modal_modalContainer]')].find(element => visible(element) && element.textContent?.includes('\u68c0\u6d4b\u5230\u811a\u672c\u9519\u8bef'));
          const ignoreButton = errorModal ? [...errorModal.querySelectorAll('button')].find(button => button.textContent?.replace(/\\s+/g, '') === '\u5ffd\u7565') : null;
          if (ignoreButton) ignoreButton.click();
          const target = document.getElementById(${JSON.stringify(item.id)});
          if (target && document.querySelector('[id^=script-item-][class*=script-manager_selected]')?.id !== target.id) {
            target.scrollIntoView({ block: 'center', inline: 'nearest' });
            target.click();
          }
          return { ignoredError: Boolean(ignoreButton), retried: Boolean(target) };
        })()`);
        if (retry?.ignoredError) console.log(`[${side}] ${item.name}: ignored existing script validation dialog`);
        lastRetryAt = Date.now();
      }
    }

    if (!state || state.selectedId !== item.id || state.header !== item.name || typeof state.value !== "string") {
      await delay(options.graceMs);
      state = await evaluate(client, context.id, `(() => {
        const selected = document.querySelector('[id^=script-item-][class*=script-manager_selected]');
        const header = document.querySelector('[class*=script-editor_header__]');
        const model = (globalThis.monaco?.editor?.getModels?.() ?? [])[0] ?? null;
        return {
          selectedId: selected?.id ?? null,
          header: header?.textContent?.trim() ?? null,
          uri: model ? String(model.uri) : null,
          languageId: model?.getLanguageId?.() ?? null,
          versionId: model?.getVersionId?.() ?? null,
          value: model?.getValue?.() ?? null,
        };
      })()`);
    }

    if (!state || state.selectedId !== item.id || state.header !== item.name || typeof state.value !== "string") {
      throw new Error(`Timed out loading ${side}/${item.name} (${item.id}); selected=${state?.selectedId}, header=${state?.header}`);
    }

    const bytes = Buffer.from(state.value, "utf8");
    await writeFile(outputPath, bytes);
    const fileResult = {
      id: item.id,
      name: item.name,
      file: `manual-cdp/source/${side}/${fileName}`,
      bytes: bytes.length,
      characters: state.value.length,
      sha256: sha256(bytes),
      empty: bytes.length === 0,
      languageId: state.languageId,
      modelUri: state.uri,
      versionId: state.versionId,
      waitMs: Date.now() - started,
    };
    sectionResult.files.push(fileResult);
    await checkpointManifest();
    console.log(`[${side}] ${item.name}: ${bytes.length} bytes`);
  }
}

manifest.finishedAt = new Date().toISOString();
await checkpointManifest();
client.close();
console.log(`Exported ${manifest.counts.server} server and ${manifest.counts.client} client scripts (${manifest.counts.bytes} bytes, ${manifest.counts.empty} empty).`);

async function checkpointManifest() {
  const files = manifest.sections.flatMap(section => section.files);
  manifest.counts = {
    server: manifest.sections.find(section => section.side === "server")?.files.length ?? 0,
    client: manifest.sections.find(section => section.side === "client")?.files.length ?? 0,
    empty: files.filter(file => file.empty).length,
    bytes: files.reduce((sum, file) => sum + file.bytes, 0),
  };
  await mkdir(resolve(options.output, "manual-cdp"), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function parseOptions(argumentsList) {
  const values = {};
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument.startsWith("--")) values[argument.slice(2)] = argumentsList[++index];
  }
  let activeSession = null;
  if (!values.output) {
    activeSession = JSON.parse((await readFile(resolve("dump/private/live-capture-active.json"), "utf8")).replace(/^\uFEFF/, ""));
  }
  const editorUrl = values["editor-url"] ?? activeSession?.editorUrl;
  if (!editorUrl) throw new Error("Pass --editor-url or start a background live capture first.");
  return {
    port: Number(values.port ?? activeSession?.port ?? 9333),
    output: resolve(values.output ?? activeSession.output),
    editorPath: new URL(editorUrl).pathname,
    timeoutMs: Number(values["timeout-ms"] ?? 120_000),
    pollMs: Number(values["poll-ms"] ?? 250),
    minimumWaitMs: Number(values["minimum-wait-ms"] ?? 1_500),
    stablePolls: Number(values["stable-polls"] ?? 6),
    retryMs: Number(values["retry-ms"] ?? 5_000),
    graceMs: Number(values["grace-ms"] ?? 30_000),
  };
}

async function evaluate(client, contextId, expression) {
  const response = await client.send("Runtime.evaluate", { contextId, expression, awaitPromise: true, returnByValue: true }, 30_000);
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text ?? "Runtime.evaluate failed.");
  return response.result?.value;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

function safeFileName(value) {
  const sanitized = basename(String(value ?? "script.js")).replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim();
  return sanitized || "script.js";
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function delay(milliseconds) {
  return new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds));
}

async function exists(path) {
  try { await stat(path); return true; } catch { return false; }
}
