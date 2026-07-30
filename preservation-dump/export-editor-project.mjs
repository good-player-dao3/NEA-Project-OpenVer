import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.contexts = [];
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await Promise.race([
      new Promise((resolveConnect, rejectConnect) => {
        this.socket.addEventListener("open", resolveConnect, { once: true });
        this.socket.addEventListener("error", () => rejectConnect(new Error("CDP connection failed.")), { once: true });
      }),
      delay(3_000).then(() => { throw new Error("CDP connection timed out."); }),
    ]);
    this.socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const pending = this.pending.get(message.id);
        this.pending.delete(message.id);
        clearTimeout(pending.timeout);
        if (message.error) pending.reject(new Error(`${pending.method}: ${JSON.stringify(message.error)}`));
        else pending.resolve(message.result);
      } else if (message.method === "Runtime.executionContextCreated") {
        this.contexts.push(message.params.context);
      }
    });
  }

  send(method, params = {}, timeoutMs = 10_000) {
    const id = this.nextId++;
    return new Promise((resolveRequest, rejectRequest) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        rejectRequest(new Error(`${method} timed out.`));
      }, timeoutMs);
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

const client = new CdpClient(target.webSocketDebuggerUrl);
await client.connect();
await client.send("Runtime.enable");
await delay(250);
const context = client.contexts.find(item => item.auxData?.isDefault === true && String(item.origin).includes("view.dao3.fun"));
if (!context) throw new Error("The editor iframe execution context was not found.");

const response = await client.send("Runtime.evaluate", {
  contextId: context.id,
  awaitPromise: true,
  returnByValue: true,
  expression: `(() => {
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
    if (!game) return null;
    const replica = game.state?.replica;
    const engine = game._game;
    const describe = value => {
      if (!value || (typeof value !== 'object' && typeof value !== 'function')) return null;
      const own = Reflect.ownKeys(value).map(String);
      const prototypes = [];
      let prototype = Object.getPrototypeOf(value);
      for (let depth = 0; prototype && depth < 4; depth += 1, prototype = Object.getPrototypeOf(prototype)) {
        prototypes.push({
          name: prototype.constructor?.name ?? null,
          properties: Reflect.ownKeys(prototype).map(String),
        });
      }
      return { constructor: value.constructor?.name ?? null, own, prototypes };
    };
    const bridge = engine?.clientScript;
    return {
      project: JSON.stringify(replica?.project ?? null),
      extraProjectInfo: JSON.stringify(replica?.extraProjectInfo ?? null),
      permissions: JSON.stringify(replica?.permissions ?? null),
      localPermissions: JSON.stringify(replica?.localPermissions ?? null),
      projectInfo: JSON.stringify(game.state?.projectInfo ?? null),
      publish: JSON.stringify(game.state?.publish ?? null),
      serverDeclarations: String(game.codeEditorController?.serverDeclarations ?? ''),
      runtimeBridge: {
        engine: describe(engine),
        clientScript: describe(bridge),
        scriptRemoteChannel: describe(bridge?.scriptRemoteChannel),
        guiClient: describe(bridge?.guiClient),
        inputController: describe(bridge?.inputController),
        soundClient: describe(bridge?.soundClient),
        worldController: describe(bridge?.worldController),
        remoteChannel: describe(engine?.remoteChannel),
        gameUI: describe(engine?.gameUI),
        client: describe(engine?.client),
        net: describe(engine?.net),
        codeEditorController: describe(game.codeEditorController),
      },
    };
  })()`,
}, 15_000);
if (response.exceptionDetails) throw new Error(response.exceptionDetails.text ?? "Runtime.evaluate failed.");
const snapshot = response.result?.value;
if (!snapshot) throw new Error("Editor game state was not found.");

const outputDirectory = resolve(options.output, "manual-cdp", "project");
await mkdir(outputDirectory, { recursive: true });
const outputs = [
  ["project.json", snapshot.project],
  ["extra-project-info.json", snapshot.extraProjectInfo],
  ["permissions.json", snapshot.permissions],
  ["local-permissions.json", snapshot.localPermissions],
  ["project-info.json", snapshot.projectInfo],
  ["publish.json", snapshot.publish],
];
const files = [];
for (const [name, serialized] of outputs) {
  const parsed = JSON.parse(serialized);
  const bytes = Buffer.from(`${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  await writeFile(resolve(outputDirectory, name), bytes);
  files.push({ name, bytes: bytes.length, sha256: sha256(bytes) });
}
const bridgeBytes = Buffer.from(`${JSON.stringify(snapshot.runtimeBridge, null, 2)}\n`, "utf8");
await writeFile(resolve(outputDirectory, "runtime-bridge.json"), bridgeBytes);
files.push({ name: "runtime-bridge.json", bytes: bridgeBytes.length, sha256: sha256(bridgeBytes) });
const declarationsBytes = Buffer.from(snapshot.serverDeclarations, "utf8");
await writeFile(resolve(outputDirectory, "server-declarations.d.ts"), declarationsBytes);
files.push({ name: "server-declarations.d.ts", bytes: declarationsBytes.length, sha256: sha256(declarationsBytes) });

const manifest = {
  format: "nea-editor-project-snapshot",
  version: 1,
  capturedAt: new Date().toISOString(),
  editorPath: options.editorPath,
  targetId: target.id,
  files,
  bytes: files.reduce((sum, file) => sum + file.bytes, 0),
};
await writeFile(resolve(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
client.close();
console.log(`Exported project snapshot: ${files.length} files, ${manifest.bytes} bytes.`);

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
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function delay(milliseconds) {
  return new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds));
}
