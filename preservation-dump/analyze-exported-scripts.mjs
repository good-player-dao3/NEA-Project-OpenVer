import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";

const options = await parseOptions(process.argv.slice(2));
const sourceRoot = resolve(options.output, "manual-cdp", "source");
const analysisRoot = resolve(options.output, "manual-cdp", "analysis");
const roots = {
  server: ["world", "voxels", "resources", "storage", "http", "rtc", "analytics", "gui", "remoteChannel"],
  client: ["ui", "remoteChannel", "navigator", "world", "input", "screen", "media", "http", "UiScreen", "UiBox", "UiText", "UiImage", "UiInput", "UiScale", "UiScrollBox"],
};

const sides = {};
for (const side of ["server", "client"]) {
  const directory = resolve(sourceRoot, side);
  const filenames = (await readdir(directory)).filter(name => name.endsWith(".js")).sort();
  const api = new Map();
  const globalAssignments = new Map();
  const remote = {
    sendsClientEvent: [],
    sendsServerEvent: [],
    handledTypes: [],
    registrations: [],
  };
  const files = [];

  for (const filename of filenames) {
    const path = resolve(directory, filename);
    const source = await readFile(path, "utf8");
    const code = stripComments(source);
    const evidencePath = relative(options.output, path).split(sep).join("/");
    files.push({ name: filename, bytes: Buffer.byteLength(source), characters: source.length, empty: source.length === 0 });

    for (const root of roots[side]) {
      const expression = new RegExp(`\\b${escapeRegExp(root)}\\s*(?:\\?\\.)?\\.\\s*([A-Za-z_$][\\w$]*)`, "g");
      for (const match of code.matchAll(expression)) addEvidence(api, `${root}.${match[1]}`, evidencePath, lineAt(source, match.index));
    }
    for (const match of code.matchAll(/\bglobalThis\.([A-Za-z_$][\w$]*)\s*=/g)) {
      addEvidence(globalAssignments, match[1], evidencePath, lineAt(source, match.index));
    }
    collectCallTypes(code, source, evidencePath, "sendClientEvent", remote.sendsClientEvent);
    collectCallTypes(code, source, evidencePath, "sendServerEvent", remote.sendsServerEvent);
    if (code.includes("remoteChannel")) {
      for (const match of code.matchAll(/\b(?:case\s+|(?:args|event|events|message|data|e)\s*(?:\?\.)?\.\s*type\s*={2,3}\s*)["'`]([^"'`]+)["'`]/g)) {
        addListEvidence(remote.handledTypes, match[1], evidencePath, lineAt(source, match.index));
      }
      for (const match of code.matchAll(/remoteChannel\s*(?:\?\.)?\.\s*((?:events\s*(?:\?\.)?\.\s*)?(?:on|once|onServerEvent|onClientEvent))\s*\(\s*["'`]?([^"'`,)]*)/g)) {
        addListEvidence(remote.registrations, `${match[1]}:${match[2] || "callback"}`, evidencePath, lineAt(source, match.index));
      }
    }
  }

  sides[side] = {
    files,
    api: mapToEntries(api),
    globalAssignments: mapToEntries(globalAssignments),
    remote: Object.fromEntries(Object.entries(remote).map(([key, values]) => [key, dedupeListEvidence(values)])),
  };
}

const report = {
  format: "nea-exported-script-abi-usage",
  version: 1,
  generatedAt: new Date().toISOString(),
  source: relative(process.cwd(), sourceRoot).split(sep).join("/"),
  counts: {
    serverFiles: sides.server.files.length,
    clientFiles: sides.client.files.length,
    serverApiMembers: sides.server.api.length,
    clientApiMembers: sides.client.api.length,
    serverOutboundTypes: sides.server.remote.sendsClientEvent.length,
    clientOutboundTypes: sides.client.remote.sendsServerEvent.length,
  },
  sides,
};

await mkdir(analysisRoot, { recursive: true });
await writeFile(resolve(analysisRoot, "script-abi-usage.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(resolve(analysisRoot, "script-abi-usage.md"), renderMarkdown(report));
console.log(`Analyzed ${report.counts.serverFiles} server and ${report.counts.clientFiles} client scripts.`);
console.log(`Found ${report.counts.serverApiMembers} server and ${report.counts.clientApiMembers} client API member usages.`);

function collectCallTypes(code, source, evidencePath, method, output) {
  const expression = new RegExp(`\\b${method}\\s*\\([\\s\\S]{0,1200}?\\btype\\s*:\\s*["'\`]([^"'\`]+)["'\`]`, "g");
  for (const match of code.matchAll(expression)) addListEvidence(output, match[1], evidencePath, lineAt(source, match.index));
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, " ")).replace(/(^|[^:\\])\/\/.*$/gm, "$1");
}

function addEvidence(map, name, file, line) {
  const entry = map.get(name) ?? { name, count: 0, evidence: [] };
  entry.count += 1;
  if (!entry.evidence.some(item => item.file === file && item.line === line)) entry.evidence.push({ file, line });
  map.set(name, entry);
}

function addListEvidence(list, name, file, line) {
  list.push({ name, file, line });
}

function dedupeListEvidence(list) {
  const map = new Map();
  for (const item of list) {
    const entry = map.get(item.name) ?? { name: item.name, count: 0, evidence: [] };
    entry.count += 1;
    if (!entry.evidence.some(evidence => evidence.file === item.file && evidence.line === item.line)) entry.evidence.push({ file: item.file, line: item.line });
    map.set(item.name, entry);
  }
  return [...map.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function mapToEntries(map) {
  return [...map.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function lineAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderMarkdown(report) {
  const lines = [
    "# Exported Script ABI Usage",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `- Server scripts: ${report.counts.serverFiles}`,
    `- Client scripts: ${report.counts.clientFiles}`,
    `- Server API members used: ${report.counts.serverApiMembers}`,
    `- Client API members used: ${report.counts.clientApiMembers}`,
    "",
  ];
  for (const side of ["server", "client"]) {
    lines.push(`## ${side === "server" ? "Server" : "Client"} API`, "");
    for (const entry of report.sides[side].api) lines.push(`- \`${entry.name}\` (${entry.count})`);
    lines.push("", `## ${side === "server" ? "Server" : "Client"} Remote Types`, "");
    const remoteEntries = side === "server" ? report.sides[side].remote.sendsClientEvent : report.sides[side].remote.sendsServerEvent;
    for (const entry of remoteEntries) lines.push(`- \`${entry.name}\` (${entry.count})`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

async function parseOptions(argumentsList) {
  const values = {};
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument.startsWith("--")) values[argument.slice(2)] = argumentsList[++index];
  }
  if (values.output) return { output: resolve(values.output) };
  const activeSession = JSON.parse((await readFile(resolve("dump/private/live-capture-active.json"), "utf8")).replace(/^\uFEFF/, ""));
  return { output: resolve(activeSession.output) };
}
