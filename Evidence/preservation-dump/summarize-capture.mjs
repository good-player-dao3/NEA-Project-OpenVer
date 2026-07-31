import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const values = {};
for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (argument.startsWith("--")) values[argument.slice(2)] = process.argv[++index];
}

const capture = resolve(values.capture ?? "dump/private/live-capture");

async function readJson(relative) {
  return JSON.parse(await readFile(join(capture, relative), "utf8"));
}

async function readJsonl(relative) {
  try {
    return (await readFile(join(capture, relative), "utf8"))
      .split(/\r?\n/)
      .filter(Boolean)
      .flatMap(line => {
        try { return [JSON.parse(line)]; } catch { return []; }
      });
  } catch { return []; }
}

async function inventory(relative) {
  const root = join(capture, relative);
  const output = { files: 0, bytes: 0 };
  async function visit(directory) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) {
        output.files += 1;
        output.bytes += (await stat(path)).size;
      }
    }
  }
  await visit(root);
  return output;
}

function normalizedUrl(raw) {
  try {
    const url = new URL(raw);
    url.hash = "";
    return url.href;
  } catch { return String(raw ?? ""); }
}

function catalogUrl(raw) {
  const text = String(raw ?? "");
  if (text.startsWith("data:")) return `data:<omitted:${text.length}-characters>`;
  try {
    const url = new URL(text);
    for (const name of [...url.searchParams.keys()]) {
      if (/token|auth|secret|password|cookie|session|sid/i.test(name)) url.searchParams.set(name, "<redacted>");
    }
    return url.href;
  } catch { return text.slice(0, 500); }
}

const manifest = await readJson("manifest.json");
const responseBodies = await readJsonl("network/response-bodies.jsonl");
const responseBodyErrors = await readJsonl("network/response-body-errors.jsonl");
const websocketEvents = await readJsonl("network/websocket-events.jsonl");
const websocketFrames = await readJsonl("network/websocket-frames.jsonl");
const scripts = await readJsonl("scripts/index.jsonl");
const savedUrls = new Set(responseBodies.map(row => normalizedUrl(row.url)));
const unresolvedResponses = responseBodyErrors.filter(row => !savedUrls.has(normalizedUrl(row.url)));

const sockets = new Map();
for (const event of websocketEvents) {
  const socket = sockets.get(event.requestId) ?? {
    requestId: event.requestId,
    targetId: event.targetId,
    url: null,
    events: [],
    sentFrames: 0,
    sentBytes: 0,
    receivedFrames: 0,
    receivedBytes: 0,
  };
  if (event.url) socket.url = event.url;
  socket.events.push(event.method);
  sockets.set(event.requestId, socket);
}
for (const frame of websocketFrames) {
  const socket = sockets.get(frame.requestId) ?? {
    requestId: frame.requestId,
    targetId: frame.targetId,
    url: null,
    events: [],
    sentFrames: 0,
    sentBytes: 0,
    receivedFrames: 0,
    receivedBytes: 0,
  };
  const prefix = frame.direction === "sent" ? "sent" : "received";
  socket[`${prefix}Frames`] += 1;
  socket[`${prefix}Bytes`] += frame.bytes ?? 0;
  sockets.set(frame.requestId, socket);
}

const catalog = {
  format: "nea-live-capture-catalog",
  version: 1,
  generatedAt: new Date().toISOString(),
  capture,
  manifest,
  coverage: {
    savedResponseEvents: responseBodies.length,
    savedUniqueResponseUrls: savedUrls.size,
    responseBodyErrorEvents: responseBodyErrors.length,
    unresolvedResponseEvents: unresolvedResponses.length,
    unresolvedResponseUrls: [...new Set(unresolvedResponses.map(row => catalogUrl(row.url)))],
  },
  webSockets: [...sockets.values()],
  scripts: {
    parsedEvents: scripts.length,
    uniqueFiles: new Set(scripts.map(row => row.file)).size,
  },
  inventories: {
    responseBodies: await inventory("response-bodies"),
    requestBodies: await inventory("request-bodies"),
    websocketFrames: await inventory("websocket-frames"),
    scripts: await inventory("scripts"),
    manualCdp: await inventory("manual-cdp"),
  },
};

await writeFile(join(capture, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(JSON.stringify({ capture, counts: manifest.counts, coverage: catalog.coverage, inventories: catalog.inventories }, null, 2));
