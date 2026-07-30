import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("player entities use an attached component instead of class inheritance", async () => {
  const model = await readJson("abi/server-object-model.json");
  assert.equal(model.playerComposition.representation, "intersection-and-component");
  assert.equal(model.playerComposition.classicalInheritance, false);
  assert.equal(model.playerComposition.entityDiscriminator, "server.GameEntity.isPlayer");
  assert.equal(model.playerComposition.componentAccessor, "server.GameEntity.player");
  assert.equal(model.playerComposition.originComponentClass, "GamePlayer");
  assert.equal(model.playerComposition.status, "confirmed");
});

test("server object model retains shared value-object dependencies", async () => {
  const model = await readJson("abi/server-object-model.json");
  assert.deepEqual(model.sharedTypes.map(entry => entry.documentedOwner), [
    "GameVector3",
    "GameQuaternion",
    "GameBounds3",
    "GameRGBColor",
    "GameRGBAColor",
    "GameAnimation",
    "GameEventHandlerToken",
    "Sound",
  ]);
  assert.ok(model.entities.GameEntity.dependencies.includes("GameVector3"));
  assert.ok(model.entities.GamePlayerEntity.dependencies.includes("GameBounds3"));
});

test("RuntimeEntity adapter covers every local member without false implements", async () => {
  const map = await readJson("abi/runtime-entity-adapter-map.json");
  const local = await readJson("generated/local-server-runtime-analysis.json");
  const localIds = local.entries.filter(entry => entry.owner === "RuntimeEntity").map(entry => entry.id).sort();
  assert.deepEqual(map.members.map(entry => entry.local.id).sort(), localIds);
  assert.equal(map.summary.memberCount, 7);
  assert.equal(map.summary.partial, 5);
  assert.equal(map.summary.extensions, 2);
  assert.ok(map.members.every(entry => entry.implements.length === 0));
});

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}
