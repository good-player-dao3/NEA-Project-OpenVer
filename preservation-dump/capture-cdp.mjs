import { appendFile, mkdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, extname, resolve } from "node:path";

const options = parseArguments(process.argv.slice(2));
const targets = new Map();
const activeTasks = new Set();
const writtenBlobs = new Set();
const startedAt = new Date().toISOString();
const counts = {
  targets: 0, requests: 0, responses: 0, responseBodies: 0, requestBodies: 0,
  websocketFramesSent: 0, websocketFramesReceived: 0, scripts: 0,
  consoleMessages: 0, exceptions: 0, snapshots: 0, errors: 0,
};
let stopping = false;

async function runCapture() {
  await mkdir(options.output, { recursive: true });
  process.once("SIGINT", () => { stopping = true; });
  process.once("SIGTERM", () => { stopping = true; });
  await writeJson("session.json", {
    format: "nea-live-cdp-capture",
    version: 1,
    startedAt,
    editorUrl: sanitizeUrl(options.editorUrl),
    playUrl: sanitizeUrl(options.playUrl),
    browserProfile: options.browserProfile,
    privacy: {
      cookiesExported: false,
      authorizationHeaderValuesExported: false,
      browserProfileContainsPrivateState: true,
    },
  });
  await pollTargets();
  await writeJson("ready.json", { readyAt: new Date().toISOString(), pid: process.pid });
  let lastSnapshot = 0;
  while (!stopping && !(await exists(options.stopFile))) {
    await pollTargets();
    if (Date.now() - lastSnapshot >= options.snapshotIntervalMs) {
      await snapshotPages(false);
      lastSnapshot = Date.now();
    }
    await delay(500);
  }
  stopping = true;
  await pollTargets();
  await snapshotPages(true);
  await Promise.allSettled([...activeTasks]);
  for (const target of targets.values()) target.client.close();
  await writeJson("manifest.json", {
    format: "nea-live-cdp-capture-manifest",
    version: 1,
    startedAt,
    finishedAt: new Date().toISOString(),
    complete: true,
    counts,
    targets: [...targets.values()].map(target => selectTarget(target.info)),
  });
}

async function pollTargets() {
  let list;
  try {
    const response = await fetch(`http://127.0.0.1:${options.port}/json/list`);
    if (!response.ok) throw new Error(`DevTools target list returned HTTP ${response.status}`);
    list = await response.json();
  } catch (error) {
    await recordError("target-list", error);
    return;
  }
  for (const info of list) {
    if (!info.webSocketDebuggerUrl || targets.has(info.id)) continue;
    try {
      await attachTarget(info);
    } catch (error) {
      await recordError(`attach:${info.id}`, error);
    }
  }
}

async function attachTarget(info) {
  const state = { info, requests: new Map(), client: null };
  const client = new CdpClient(info.webSocketDebuggerUrl, event => schedule(() => processEvent(state, event)));
  state.client = client;
  await client.connect();
  targets.set(info.id, state);
  counts.targets += 1;
  await appendJsonl("targets.jsonl", { capturedAt: now(), ...selectTarget(info) });
  await Promise.allSettled([
    client.send("Network.enable", { maxTotalBufferSize: 512 * 1024 * 1024, maxResourceBufferSize: 128 * 1024 * 1024, maxPostDataSize: 128 * 1024 * 1024 }),
    client.send("Runtime.enable"),
    client.send("Debugger.enable", { maxScriptsCacheSize: 512 * 1024 * 1024 }),
    info.type === "page" ? client.send("Page.enable") : Promise.resolve(),
    info.type === "page" ? client.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: resolve(options.output, "downloads") }) : Promise.resolve(),
  ]);
}

async function processEvent(target, event) {
  try {
    const { method, params = {} } = event;
    if (method === "Network.requestWillBeSent") {
      counts.requests += 1;
      const request = params.request ?? {};
      target.requests.set(params.requestId, { url: request.url, method: request.method, type: params.type });
      let postDataFile = null;
      if (typeof request.postData === "string" && request.postData.length > 0) {
        postDataFile = await saveBlob(Buffer.from(request.postData), "request-bodies", extensionFor(request.url, request.headers?.["Content-Type"]));
        counts.requestBodies += 1;
      }
      await appendJsonl("network/requests.jsonl", {
        capturedAt: now(), targetId: target.info.id, requestId: params.requestId,
        documentUrl: sanitizeUrl(params.documentURL), type: params.type, initiator: params.initiator,
        request: { url: sanitizeUrl(request.url), method: request.method, headers: redactHeaders(request.headers), hasPostData: request.hasPostData === true, postDataFile },
      });
      return;
    }
    if (method === "Network.responseReceived") {
      counts.responses += 1;
      const response = params.response ?? {};
      Object.assign(target.requests.get(params.requestId) ?? {}, { url: response.url, status: response.status, mimeType: response.mimeType });
      target.requests.set(params.requestId, target.requests.get(params.requestId) ?? { url: response.url, status: response.status, mimeType: response.mimeType });
      await appendJsonl("network/responses.jsonl", {
        capturedAt: now(), targetId: target.info.id, requestId: params.requestId, type: params.type,
        response: {
          url: sanitizeUrl(response.url), status: response.status, statusText: response.statusText, mimeType: response.mimeType,
          protocol: response.protocol, fromDiskCache: response.fromDiskCache, fromServiceWorker: response.fromServiceWorker,
          headers: redactHeaders(response.headers), securityDetails: response.securityDetails,
        },
      });
      return;
    }
    if (method === "Network.loadingFinished") {
      const request = target.requests.get(params.requestId);
      if (!request) return;
      try {
        const response = await target.client.send("Network.getResponseBody", { requestId: params.requestId });
        const bytes = Buffer.from(response.body ?? "", response.base64Encoded ? "base64" : "utf8");
        const file = await saveBlob(bytes, "response-bodies", extensionFor(request.url, request.mimeType));
        counts.responseBodies += 1;
        await appendJsonl("network/response-bodies.jsonl", { capturedAt: now(), targetId: target.info.id, requestId: params.requestId, ...request, url: sanitizeUrl(request.url), file, bytes: bytes.length });
      } catch (error) {
        await appendJsonl("network/response-body-errors.jsonl", { capturedAt: now(), targetId: target.info.id, requestId: params.requestId, url: sanitizeUrl(request.url), error: errorMessage(error) });
      }
      return;
    }
    if (method === "Network.loadingFailed") {
      await appendJsonl("network/failures.jsonl", { capturedAt: now(), targetId: target.info.id, ...params });
      return;
    }
    if (method.startsWith("Network.webSocket") && !method.includes("FrameSent") && !method.includes("FrameReceived")) {
      await appendJsonl("network/websocket-events.jsonl", { capturedAt: now(), targetId: target.info.id, method, ...sanitizeWebSocketEvent(params) });
      return;
    }
    if (method === "Network.webSocketFrameSent" || method === "Network.webSocketFrameReceived") {
      const direction = method.endsWith("Sent") ? "sent" : "received";
      const frame = params.response ?? {};
      const bytes = frame.opcode === 2 ? Buffer.from(frame.payloadData ?? "", "base64") : Buffer.from(frame.payloadData ?? "", "utf8");
      const file = await saveBlob(bytes, "websocket-frames", frame.opcode === 2 ? ".bin" : ".txt");
      if (direction === "sent") counts.websocketFramesSent += 1;
      else counts.websocketFramesReceived += 1;
      await appendJsonl("network/websocket-frames.jsonl", { capturedAt: now(), targetId: target.info.id, requestId: params.requestId, timestamp: params.timestamp, direction, opcode: frame.opcode, mask: frame.mask, file, bytes: bytes.length });
      return;
    }
    if (method === "Debugger.scriptParsed") {
      try {
        const source = await target.client.send("Debugger.getScriptSource", { scriptId: params.scriptId });
        const bytes = Buffer.from(source.scriptSource ?? "", "utf8");
        const file = await saveBlob(bytes, "scripts/files", scriptExtension(params.url));
        counts.scripts += 1;
        await appendJsonl("scripts/index.jsonl", { capturedAt: now(), targetId: target.info.id, scriptId: params.scriptId, url: sanitizeUrl(params.url), hash: params.hash, sourceMapURL: sanitizeUrl(params.sourceMapURL), scriptLanguage: params.scriptLanguage, file, bytes: bytes.length });
      } catch (error) {
        await appendJsonl("scripts/errors.jsonl", { capturedAt: now(), targetId: target.info.id, scriptId: params.scriptId, url: sanitizeUrl(params.url), error: errorMessage(error) });
      }
      return;
    }
    if (method === "Runtime.consoleAPICalled") {
      counts.consoleMessages += 1;
      await appendJsonl("runtime/console.jsonl", { capturedAt: now(), targetId: target.info.id, type: params.type, timestamp: params.timestamp, args: params.args?.map(remoteValueSummary), stackTrace: params.stackTrace });
      return;
    }
    if (method === "Runtime.exceptionThrown") {
      counts.exceptions += 1;
      await appendJsonl("runtime/exceptions.jsonl", { capturedAt: now(), targetId: target.info.id, ...params });
    }
  } catch (error) {
    await recordError(`${target.info.id}:${event.method}`, error);
  }
}

async function snapshotPages(full) {
  for (const target of targets.values()) {
    if (target.info.type !== "page") continue;
    if (!/^https?:\/\//i.test(target.info.url ?? "")) continue;
    let snapshotError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const snapshot = sanitizeSnapshot(await evaluate(target.client, `(${PAGE_SNAPSHOT_SOURCE})(${full ? "true" : "false"})`, full ? 180_000 : 30_000));
        await writeJson(`pages/${safeName(target.info.id)}/snapshots/${fileTimestamp()}${full ? "-final" : ""}.json`, snapshot);
        counts.snapshots += 1;
        snapshotError = null;
        break;
      } catch (error) {
        snapshotError = error;
        if (attempt < 2 && /execution context was destroyed|cannot find context|target navigated/i.test(errorMessage(error))) {
          await delay(750);
          continue;
        }
        break;
      }
    }
    if (snapshotError) await recordError(`snapshot:${target.info.id}`, snapshotError);
  }
}

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
      const timeout = setTimeout(() => rejectConnect(new Error(`Timed out connecting to ${this.url}`)), 15_000);
      this.socket.addEventListener("open", () => { clearTimeout(timeout); resolveConnect(); }, { once: true });
      this.socket.addEventListener("error", () => { clearTimeout(timeout); rejectConnect(new Error(`WebSocket error connecting to ${this.url}`)); }, { once: true });
    });
    this.socket.addEventListener("message", event => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timeout);
        if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
        else pending.resolve(message.result ?? {});
      } else if (message.method) this.eventHandler(message);
    });
    this.socket.addEventListener("close", () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeout);
        pending.reject(new Error(`CDP socket closed while waiting for ${pending.method}`));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}, timeoutMs = 30_000) {
    if (this.socket?.readyState !== WebSocket.OPEN) return Promise.reject(new Error(`CDP socket is not open for ${method}`));
    const id = this.nextId++;
    return new Promise((resolveRequest, rejectRequest) => {
      const timeout = setTimeout(() => { this.pending.delete(id); rejectRequest(new Error(`${method} timed out`)); }, timeoutMs);
      this.pending.set(id, { resolve: resolveRequest, reject: rejectRequest, timeout, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.socket && this.socket.readyState < WebSocket.CLOSING) this.socket.close();
  }
}

const PAGE_SNAPSHOT_SOURCE = async full => {
  const safeRead = callback => { try { return callback(); } catch (error) { return { __error: String(error) }; } };
  const safeAwait = async callback => { try { return await callback(); } catch (error) { return { __error: String(error) }; } };
  const surface = value => {
    if (value === null || value === undefined) return null;
    const chain = [];
    const seen = new Set();
    let current = value;
    for (let depth = 0; current && depth < 8 && !seen.has(current); depth += 1) {
      seen.add(current);
      chain.push({
        constructor: safeRead(() => current.constructor?.name ?? null),
        properties: safeRead(() => Object.getOwnPropertyNames(current).sort().map(name => {
          const descriptor = Object.getOwnPropertyDescriptor(current, name);
          return { name, kind: descriptor?.get || descriptor?.set ? "accessor" : typeof descriptor?.value, writable: descriptor?.writable ?? null, enumerable: descriptor?.enumerable ?? null, configurable: descriptor?.configurable ?? null, functionLength: typeof descriptor?.value === "function" ? descriptor.value.length : null };
        })),
      });
      current = safeRead(() => Object.getPrototypeOf(current));
    }
    return chain;
  };
  const storageEntries = storage => safeRead(() => Object.fromEntries(Array.from({ length: storage.length }, (_, index) => {
    const key = storage.key(index);
    return [key, storage.getItem(key)];
  })));
  const knownObjects = {};
  for (const name of ["world", "remoteChannel", "resources", "storage", "voxels", "rtc", "http", "game", "editor", "monaco", "ace", "input", "camera", "ui", "gameUI"]) {
    if (name in globalThis) knownObjects[name] = surface(globalThis[name]);
  }
  const indexedDb = await safeAwait(async () => {
    const output = [];
    for (const metadata of await indexedDB.databases()) {
      if (!metadata.name) continue;
      const database = await new Promise((resolveOpen, rejectOpen) => {
        const request = indexedDB.open(metadata.name);
        request.onsuccess = () => resolveOpen(request.result);
        request.onerror = () => rejectOpen(request.error);
      });
      output.push({ name: metadata.name, version: database.version, stores: [...database.objectStoreNames] });
      database.close();
    }
    return output;
  });
  const cacheStorage = await safeAwait(async () => {
    const output = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      output.push({ name, requests: (await cache.keys()).map(request => request.url) });
    }
    return output;
  });
  const serviceWorkers = await safeAwait(async () => (await navigator.serviceWorker?.getRegistrations?.() ?? []).map(registration => ({ scope: registration.scope, active: registration.active?.scriptURL ?? null, waiting: registration.waiting?.scriptURL ?? null, installing: registration.installing?.scriptURL ?? null })));
  return {
    capturedAt: new Date().toISOString(), location: location.href, origin: location.origin, title: document.title,
    readyState: document.readyState, userAgent: navigator.userAgent, languages: navigator.languages,
    globalNames: Object.getOwnPropertyNames(globalThis).sort(), knownObjects,
    nextData: safeRead(() => globalThis.__NEXT_DATA__ ?? null),
    localStorage: storageEntries(localStorage), sessionStorage: storageEntries(sessionStorage),
    indexedDb: await indexedDb, cacheStorage: await cacheStorage, serviceWorkers: await serviceWorkers,
    performanceEntries: safeRead(() => performance.getEntries().slice(-2500).map(entry => entry.toJSON?.() ?? { name: entry.name, entryType: entry.entryType, startTime: entry.startTime, duration: entry.duration })),
    monacoModels: safeRead(() => globalThis.monaco?.editor?.getModels?.().map(model => ({ uri: String(model.uri), languageId: model.getLanguageId?.(), versionId: model.getVersionId?.(), value: model.getValue?.() })) ?? []),
    textareas: safeRead(() => [...document.querySelectorAll("textarea")].filter(element => element.type !== "password").map(element => ({ name: element.name, id: element.id, className: element.className, value: element.value }))),
    dom: full ? document.documentElement?.outerHTML ?? null : null,
  };
};

async function evaluate(client, expression, timeoutMs) {
  const response = await client.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, timeoutMs);
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text ?? "Runtime.evaluate failed");
  return response.result?.value;
}

function schedule(task) {
  const promise = Promise.resolve().then(task).finally(() => activeTasks.delete(promise));
  activeTasks.add(promise);
}

async function appendJsonl(relative, value) {
  const path = resolve(options.output, relative);
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, `${JSON.stringify(value)}\n`);
}

async function writeJson(relative, value) {
  const path = resolve(options.output, relative);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function saveBlob(bytes, category, extension) {
  const hash = sha256(bytes);
  const relative = `${category}/${hash}${extension}`;
  if (!writtenBlobs.has(relative)) {
    writtenBlobs.add(relative);
    const path = resolve(options.output, relative);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, bytes);
  }
  return relative;
}

async function recordError(scope, error) {
  counts.errors += 1;
  await appendJsonl("errors.jsonl", { capturedAt: now(), scope, error: errorMessage(error) });
}

function parseArguments(argumentsList) {
  const values = {};
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--self-test") values.selfTest = true;
    else if (argument.startsWith("--")) values[argument.slice(2)] = argumentsList[++index];
  }
  return {
    selfTest: values.selfTest === true,
    port: Number(values.port ?? 9333),
    output: resolve(values.output ?? "dump/private/live-capture"),
    stopFile: resolve(values["stop-file"] ?? "dump/private/live-capture.stop"),
    editorUrl: values["editor-url"] ?? null,
    playUrl: values["play-url"] ?? null,
    browserProfile: values["browser-profile"] ?? null,
    snapshotIntervalMs: Number(values["snapshot-interval-ms"] ?? 15_000),
  };
}

function redactHeaders(headers = {}) {
  const output = {};
  for (const [name, value] of Object.entries(headers)) {
    const normalized = name.toLowerCase();
    if (["authorization", "proxy-authorization", "cookie", "set-cookie"].includes(normalized) || normalized.includes("token") || normalized.includes("secret") || normalized.includes("csrf")) {
      const text = String(value ?? "");
      output[name] = { redacted: true, length: text.length, sha256: sha256(Buffer.from(text)) };
    } else output[name] = value;
  }
  return output;
}

function sanitizeWebSocketEvent(params) {
  const output = { ...params };
  if (output.request) output.request = { ...output.request, url: sanitizeUrl(output.request.url), headers: redactHeaders(output.request.headers) };
  if (output.response) output.response = { ...output.response, url: sanitizeUrl(output.response.url), headers: redactHeaders(output.response.headers) };
  if (output.url) output.url = sanitizeUrl(output.url);
  return output;
}

function selectTarget(info) {
  return { id: info.id, type: info.type, title: info.title, url: sanitizeUrl(info.url), faviconUrl: sanitizeUrl(info.faviconUrl), parentId: info.parentId };
}

function sanitizeUrl(value) {
  if (typeof value !== "string" || value.length === 0) return value;
  try {
    const parsed = new URL(value);
    for (const name of [...parsed.searchParams.keys()]) {
      if (isSensitiveName(name)) parsed.searchParams.set(name, "__REDACTED__");
    }
    return parsed.toString();
  } catch {
    return redactSensitiveText(value);
  }
}

function sanitizeSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return snapshot;
  const output = { ...snapshot, location: sanitizeUrl(snapshot.location) };
  output.localStorage = redactStorage(snapshot.localStorage);
  output.sessionStorage = redactStorage(snapshot.sessionStorage);
  output.nextData = redactSensitiveObject(snapshot.nextData);
  output.cacheStorage = Array.isArray(snapshot.cacheStorage)
    ? snapshot.cacheStorage.map(cache => ({ ...cache, requests: Array.isArray(cache.requests) ? cache.requests.map(sanitizeUrl) : cache.requests }))
    : snapshot.cacheStorage;
  output.serviceWorkers = Array.isArray(snapshot.serviceWorkers)
    ? snapshot.serviceWorkers.map(worker => ({ ...worker, scope: sanitizeUrl(worker.scope), active: sanitizeUrl(worker.active), waiting: sanitizeUrl(worker.waiting), installing: sanitizeUrl(worker.installing) }))
    : snapshot.serviceWorkers;
  output.performanceEntries = Array.isArray(snapshot.performanceEntries)
    ? snapshot.performanceEntries.map(entry => ({ ...entry, name: sanitizeUrl(entry.name) }))
    : snapshot.performanceEntries;
  output.dom = typeof snapshot.dom === "string" ? redactSensitiveText(snapshot.dom) : snapshot.dom;
  return output;
}

function redactStorage(storage) {
  if (!storage || typeof storage !== "object" || Array.isArray(storage)) return storage;
  return Object.fromEntries(Object.entries(storage).map(([name, value]) => [name, isSensitiveName(name) ? redactedValue(value) : value]));
}

function redactSensitiveObject(value, key = "", depth = 0) {
  if (depth > 12 || value === null || value === undefined) return value;
  if (isSensitiveName(key)) return redactedValue(value);
  if (Array.isArray(value)) return value.map(item => redactSensitiveObject(item, key, depth + 1));
  if (typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, redactSensitiveObject(item, name, depth + 1)]));
  return typeof value === "string" ? redactSensitiveText(value) : value;
}

function redactSensitiveText(value) {
  return String(value ?? "").replace(/([?&](?:access_token|auth|authorization|code|csrf|secret|session|token)=)[^&#\s"']+/gi, "$1__REDACTED__");
}

function redactedValue(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return { redacted: true, length: text?.length ?? 0, sha256: sha256(Buffer.from(text ?? "")) };
}

function isSensitiveName(name) {
  return /(?:access.?token|authorization|auth|cookie|csrf|secret|session|token)/i.test(String(name ?? ""));
}

function remoteValueSummary(value) {
  return { type: value.type, subtype: value.subtype, className: value.className, description: value.description, value: value.value, unserializableValue: value.unserializableValue };
}

function extensionFor(url = "", mimeType = "") {
  const mime = String(mimeType ?? "").split(";")[0].trim().toLowerCase();
  const byMime = { "application/javascript": ".js", "text/javascript": ".js", "application/json": ".json", "text/html": ".html", "text/css": ".css", "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/svg+xml": ".svg", "audio/mpeg": ".mp3", "video/mp4": ".mp4", "application/wasm": ".wasm", "application/zip": ".zip", "application/octet-stream": ".bin" };
  if (byMime[mime]) return byMime[mime];
  try {
    const extension = extname(new URL(url).pathname);
    return /^\.[a-z0-9]{1,8}$/i.test(extension) ? extension.toLowerCase() : ".bin";
  } catch { return ".bin"; }
}

function scriptExtension(url = "") {
  const extension = extensionFor(url, "application/javascript");
  return [".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".wasm"].includes(extension) ? extension : ".js";
}

function safeName(value) { return String(value ?? "unknown").replace(/[^a-z0-9._-]+/gi, "_").slice(0, 160) || "unknown"; }
function sha256(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
function errorMessage(error) { return error instanceof Error ? `${error.name}: ${error.message}` : String(error); }
function now() { return new Date().toISOString(); }
function fileTimestamp() { return new Date().toISOString().replace(/[:.]/g, "-"); }
function delay(milliseconds) { return new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds)); }
async function exists(path) { try { await stat(path); return true; } catch { return false; } }

function selfTest() {
  const headers = redactHeaders({ Authorization: "Bearer private", Accept: "application/json", Cookie: "sid=private" });
  if (headers.Accept !== "application/json" || headers.Authorization.redacted !== true || headers.Cookie.redacted !== true) throw new Error("Header redaction self-test failed");
  if (extensionFor("https://example.com/a.js") !== ".js") throw new Error("Extension self-test failed");
  if (safeName("a/b:c") !== "a_b_c") throw new Error("Path self-test failed");
  if (!sanitizeUrl("https://example.com/edit/x?token=private&mode=edit").includes("token=__REDACTED__")) throw new Error("URL redaction self-test failed");
  console.log("capture-cdp self-test passed");
}

if (options.selfTest) selfTest();
else await runCapture();
