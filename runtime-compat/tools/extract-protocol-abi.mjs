import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(root, "..");
const reportPath = resolve(repositoryRoot, "local-player", "reports", "runtime-abi.json");
const report = JSON.parse(await readFile(reportPath, "utf8"));

const protocols = [
  ...report.playerProtocols.map(protocol => ({
    id: `player.${protocol.name}`,
    layer: "player",
    transport: "MuDB",
    exportName: protocol.exportName,
    clientReceives: protocol.client,
    serverReceives: protocol.server,
    availability: "confirmed",
    compatibility: "missing",
    evidence: [{
      type: "protocol-schema",
      path: "Lokibox/box-go/protocol.ts",
      symbol: protocol.exportName,
      confidence: "direct",
    }],
  })),
  ...report.scriptProtocols.map(protocol => ({
    id: `script.${protocol.name}`,
    layer: "script-shell",
    transport: "MuDB",
    clientReceives: protocol.client ?? {},
    serverReceives: protocol.server ?? {},
    availability: "confirmed",
    compatibility: "missing",
    evidence: [{
      type: "protocol-schema",
      path: "origin/server-protocols.json",
      symbol: protocol.name,
      confidence: "direct",
    }],
  })),
];

const remote = protocols.find(protocol => protocol.id === "player.remote-channel");
if (!remote) throw new Error("Player remote-channel protocol is missing");
remote.compatibility = "bridged";
remote.conformance = {
  status: "covered",
  fixture: "runtime-compat/conformance/client-remote-channel.mjs",
  tests: "runtime-compat/test/remote-channel-conformance.test.mjs",
  behaviors: [
    "outbound JSON serialization with current tick",
    "pre-isolate inbound queueing",
    "inbound JSON parsing with malformed payload drop",
    "listener removal and clear",
  ],
};

const output = {
  format: "nea-protocol-abi",
  version: 1,
  generatedAt: new Date().toISOString(),
  topology: report.startupAbi.websocket,
  summary: {
    playerProtocols: report.summary.playerProtocols,
    playerClientMessages: report.summary.playerClientMessages,
    playerServerMessages: report.summary.playerServerMessages,
    scriptProtocols: report.summary.scriptProtocols,
    scriptClientMessages: report.summary.scriptClientMessages,
    scriptServerMessages: report.summary.scriptServerMessages,
  },
  protocols,
};

await writeFile(resolve(root, "abi", "protocols.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Extracted ${protocols.length} MuDB protocol catalogs with complete message schemas.`);
