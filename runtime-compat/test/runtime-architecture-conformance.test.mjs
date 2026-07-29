import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("runtime architecture preserves five explicit layers", async () => {
  const architecture = await readJson("abi/runtime-contracts.json");
  assert.deepEqual(architecture.layers.map(layer => layer.id), [
    "project-package",
    "client-script-runtime",
    "server-script-runtime",
    "mudb-transport",
    "authoritative-game-runtime",
  ]);
  assert.equal(architecture.transport.remoteChannelEnvelope.argsEncoding, "JSON-text");
  assert.equal(architecture.authoritativeRuntime.bodyProfileRequired, true);
  assert.equal(architecture.authoritativeRuntime.bodyProfileSizeStatus, "confirmed");
  assert.deepEqual(architecture.authoritativeRuntime.postureShapeStatus, {
    standing: "confirmed",
    crouching: "evidence-deferred",
    flying: "evidence-deferred",
  });
  assert.deepEqual(architecture.authoritativeRuntime.postureShapeCompatibilityPolicy, {
    onUnknownAuthoritativeShape: "preserve-current-collider",
    requireCompleteAuthoritativeShape: true,
    historicalClaim: false,
  });
  assert.equal(architecture.objectModels.server.playerRepresentation, "intersection-and-component");
  assert.equal(architecture.objectModels.server.classicalPlayerInheritance, false);
  assert.deepEqual(architecture.objectModels.server.localAdapters.map(adapter => adapter.object), [
    "server.object.RuntimeEntity",
    "server.object.RuntimePlayer",
  ]);
  assert.equal(architecture.sharedValues.catalog, "runtime-compat/abi/shared-runtime.json");
  assert.equal(architecture.sharedValues.capability, "shared.math");
  assert.equal(architecture.sharedValues.confirmedGameVector3Entries, 30);
  assert.equal(architecture.sharedValues.partialGameVector3Entries, 1);
});

test("current ABI is composed from executable client server and shared analyses", async () => {
  const current = await readJson("abi/current-runtime.json");
  const client = await readJson("generated/player-client-script-runtime-analysis.json");
  const server = await readJson("generated/local-server-runtime-analysis.json");
  const shared = await readJson("generated/local-shared-runtime-analysis.json");
  const ids = new Set(current.entries.map(entry => entry.id));
  for (const entry of [...client.entries, ...server.entries, ...shared.entries]) assert.ok(ids.has(entry.id), `${entry.id} missing from current ABI`);
  assert.ok(ids.has("server.RuntimePlayer.position"));
  assert.ok(ids.has("server.RuntimePlayer.applyImpulse"));
  assert.ok(current.entries.filter(entry => entry.capability).every(entry => entry.capability.startsWith(`${entry.side}.`)));
});

test("Demo client and server scripts resolve only side-qualified capabilities", async () => {
  const architecture = await readJson("abi/runtime-contracts.json");
  for (const binding of architecture.demo.bindings) {
    assert.equal(binding.resolved, true, `${binding.side}: ${binding.errors.join("; ")}`);
    assert.deepEqual(binding.errors, []);
    assert.ok(binding.requestedCapabilities.every(capability => capability.startsWith(`${binding.side}.`)));
    for (const required of binding.observedUsage.requiredCapabilities) {
      assert.ok(binding.requestedCapabilities.includes(required), `${binding.side} script did not declare ${required}`);
    }
    assert.ok(binding.resolvedEntries.length > 0);
  }
});

test("transport and authoritative flows remain separate from script contracts", async () => {
  const architecture = await readJson("abi/runtime-contracts.json");
  assert.deepEqual(architecture.contracts.map(contract => contract.side).sort(), ["client", "server"]);
  assert.ok(architecture.transport.requiredProtocols.includes("player.game-net"));
  assert.ok(architecture.transport.requiredProtocols.includes("player.remote-channel"));
  const publicState = architecture.flows.find(flow => flow.id === "public-state");
  assert.equal(publicState.from, "authoritative-game-runtime");
  assert.equal(publicState.to, "client-script-runtime");
});

test("authoritative contact state remains separate from script event payloads", async () => {
  const architecture = await readJson("abi/runtime-contracts.json");
  assert.equal(architecture.contactEvents.authoritativeStateStatus, "confirmed-schema-partial-binding");
  assert.equal(architecture.contactEvents.packedVoxelAxisStatus, "confirmed");
  assert.equal(architecture.contactEvents.conformance.status, "covered");
  assert.ok(architecture.contactEvents.conformance.excludedMappings.includes("GameEntity.contactForce aggregation"));
});

test("client documentation keeps concrete UI and audio owners", async () => {
  const docs = await readJson("generated/docs-api-index.json");
  const ids = new Set(docs.entries.map(entry => entry.id));
  for (const id of [
    "client.UiNode.name",
    "client.UiRenderable.position",
    "client.UiScreen.getAllScreen",
    "client.EventEmitter.on",
    "client.Audio.play",
    "client.MediaError.code",
  ]) assert.ok(ids.has(id), `${id} missing from canonical documentation index`);
  assert.equal(docs.entries.some(entry => entry.id.startsWith("client.ClientUI.")), false);
  assert.equal(docs.entries.some(entry => entry.id.startsWith("client.ClientAudio.")), false);
  assert.equal(docs.entries.some(entry => entry.id.startsWith("client.mediaError.")), false);
});

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}
