import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const backendUrl = new URL("../../local-player/backend/box3-server.cjs", import.meta.url);
const backend = await readFile(backendUrl, "utf8");

function loadRemoteChannelSessions() {
  const start = backend.indexOf("var RemoteChannelSessions = class {");
  const end = backend.indexOf("var BedwarsRemoteSessions = class {", start);
  assert.notEqual(start, -1, "generic remote-channel registry is missing");
  assert.notEqual(end, -1, "generic registry boundary is missing");
  const classSource = backend.slice(start, end).replace(
    "var RemoteChannelSessions = class {",
    "RemoteChannelSessions = class {",
  );
  const context = {
    RemoteChannelSessions: undefined,
    requireSessionId3(sessionId) {
      if (typeof sessionId !== "string" || sessionId.length === 0) throw new TypeError("sessionId is required");
    },
  };
  vm.runInNewContext(classSource, context);
  return context.RemoteChannelSessions;
}

function createClient(sessionId, sent) {
  return {
    sessionId,
    message: {
      sendClientEvent(packet) {
        sent.push(structuredClone(packet));
      },
    },
  };
}

test("Dialog API configs normalize to the historical Player union", () => {
  assert.match(backend, /client\.message\.open\(\{ rpcId, config: normalizeDialogConfig\(config\) \}\)/);
  assert.match(backend, /if \(type === "select"\)[\s\S]*options: config\.options\.map/);
  const dialogSchema = backend.match(/var dialog = \{[\s\S]*?\n\};/)?.[0] ?? "";
  assert.doesNotMatch(dialogSchema, /pictureAssets|defaultScreenId/);
});

test("Dialog control ingress resolves the logged short session label", () => {
  assert.match(backend, /hasActiveClient\(sessionId\) \{[\s\S]*?this\.resolveSessionLabel\(sessionId\)/);
  assert.match(backend, /resolveSessionLabel\(sessionLabel\) \{[\s\S]*?slice\(0, 6\) \+ "\.\.\."/);
  assert.match(backend, /const session = \{\s*sessionId,\s*nextRpcId/);
});

test("Demo waits for client protocol connections without enabling legacy gameplay", async () => {
  const demoServer = await readFile(new URL("../../../Frontend/demo-map/src/server.mjs", import.meta.url), "utf8");
  assert.match(demoServer, /openDialogWithRetry/);
  assert.match(demoServer, /dialog client not connected/);
  assert.match(demoServer, /sendClientEventWithRetry/);
  assert.match(demoServer, /session not connected/);
  assert.match(demoServer, /BOX3_DISABLE_LEGACY_GAMEPLAY: "1"/);
});

test("backend bundling reapplies the generic remote-channel transport", async () => {
  const bundleTool = await readFile(new URL("../../local-player/tools/bundle-backend.cjs", import.meta.url), "utf8");
  const patchTool = await readFile(new URL("../../local-player/tools/patch-generic-remote-channel.cjs", import.meta.url), "utf8");
  assert.match(bundleTool, /patchGenericRemoteChannelBundle\(process\.argv\[4\]\)/);
  assert.match(patchTool, /class \{/);
  assert.match(patchTool, /remoteChannelSessions\.connect\(client\)/);
  assert.match(patchTool, /remoteChannelSessions\.sendExternalEvent/);
});

test("generic remote-channel transport is independent from legacy gameplay", () => {
  assert.match(backend, /this\.remoteChannelSessions = new RemoteChannelSessions\(\);/);
  assert.match(backend, /remoteChannelSessions: this\.remoteChannelSessions/);
  assert.match(backend, /context\.remoteChannelSessions\.connect\(client\)/);
  assert.match(backend, /historicalProjectInstance\?\.remoteChannelSessions\.sendExternalEvent/);
  assert.doesNotMatch(
    backend.match(/sendRemoteClientEvent\(sessionLabel, event\) \{[\s\S]*?\n  \}/)?.[0] ?? "",
    /bedwarsRemoteSessions/,
  );
});

test("generic remote-channel transport sends any JSON value with monotonic ticks", () => {
  const RemoteChannelSessions = loadRemoteChannelSessions();
  const transport = new RemoteChannelSessions();
  const sent = [];
  const client = createClient("session-1234567890", sent);
  transport.connect(client);
  assert.equal(transport.sendExternalEvent("sessio...7890", { type: "object", args: [1, true, null] }), true);
  assert.equal(transport.sendExternalEvent("session-1234567890", ["array", 2]), true);
  assert.deepEqual(sent, [
    { tick: 1, args: '{"type":"object","args":[1,true,null]}' },
    { tick: 2, args: '["array",2]' },
  ]);
});

test("generic remote-channel transport accepts valid client packets and rejects malformed JSON", () => {
  const RemoteChannelSessions = loadRemoteChannelSessions();
  const transport = new RemoteChannelSessions();
  const client = createClient("session-a", []);
  transport.connect(client);
  assert.equal(transport.handleServerEvent(client, { tick: 7, args: '{"ready":true}' }), true);
  assert.equal(transport.handleServerEvent(client, { tick: 8, args: "not-json" }), false);
  assert.equal(transport.handleServerEvent(client, { tick: -1, args: "null" }), false);
  transport.disconnect(client);
  assert.equal(transport.handleServerEvent(client, { tick: 9, args: "null" }), false);
  assert.equal(transport.sendExternalEvent("session-a", null), false);
});
