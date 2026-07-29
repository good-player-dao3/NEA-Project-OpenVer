import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("RuntimePlayer canonical map covers every public local member", async () => {
  const map = await readJson("abi/runtime-player-adapter-map.json");
  const local = await readJson("generated/local-server-runtime-analysis.json");
  const localIds = local.entries.filter(entry => entry.owner === "RuntimePlayer").map(entry => entry.id).sort();
  const mappedIds = map.members.map(entry => entry.local.id).sort();
  assert.deepEqual(mappedIds, localIds);
  assert.equal(map.summary.memberCount, 10);
  assert.equal(map.summary.compatible, 0);
  assert.equal(map.summary.partial, 6);
  assert.equal(map.summary.extensions, 4);
  assert.ok(map.members.filter(entry => entry.status !== "compatible").every(entry => entry.implements.length === 0));
});

test("RuntimePlayer remains a composite instead of claiming GamePlayerEntity", async () => {
  const map = await readJson("abi/runtime-player-adapter-map.json");
  assert.equal(map.localObject.status, "extension");
  assert.deepEqual(map.localObject.composition, ["server.GameEntity", "server.GamePlayerEntity"]);
  assert.deepEqual(member(map, "server.RuntimePlayer.name").canonicalTargets.map(entry => entry.id), ["server.GamePlayerEntity.name"]);
  assert.deepEqual(member(map, "server.RuntimePlayer.position").canonicalTargets.map(entry => entry.id), ["server.GameEntity.position"]);
  assert.deepEqual(member(map, "server.RuntimePlayer.health").canonicalTargets.map(entry => entry.id), ["server.GameEntity.hp"]);
  assert.equal(member(map, "server.RuntimePlayer.snapshot").status, "extension");
});

test("GameEntityEvent records canonical fields and isolates the player alias", async () => {
  const map = await readJson("abi/runtime-player-adapter-map.json");
  assert.deepEqual(map.events[0].canonicalFields, ["tick", "entity"]);
  assert.deepEqual(map.events[0].localAliases, [{ name: "player", target: "entity" }]);
  assert.equal(map.events[0].status, "partial");
});

function member(map, id) {
  const entry = map.members.find(item => item.local.id === id);
  assert.ok(entry, `${id} missing from RuntimePlayer adapter map`);
  return entry;
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}
