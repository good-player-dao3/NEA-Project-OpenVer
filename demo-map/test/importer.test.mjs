import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { importMapProject } from "../src/import-project.mjs";

test("imports the Demo into dao3-project/v1", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-map-import-")), "project");
  const result = await importMapProject(source, output);
  assert.equal(result.manifest.id, "nea-script-lab");
  assert.ok(result.voxelCount > 8_000);
  assert.equal(result.entityCount, 2);
  assert.equal(result.clientScript?.name, "clientIndex.js");

  const manifest = JSON.parse(await readFile(join(output, "dao3.project.json"), "utf8"));
  assert.equal(manifest.formatVersion, "dao3-project/v1");
  assert.equal(manifest.engine.clientContract, "dao3-client-runtime/v1");
  assert.equal(manifest.engine.serverContract, "nea-server-runtime/v1");
  assert.equal(manifest.engine.tickRate, 20);
  const scripts = JSON.parse(await readFile(join(output, "scripts", "manifest.json"), "utf8"));
  assert.deepEqual(scripts.capabilities, [
    "server.world.events",
    "server.world.chat",
    "server.world.entities",
    "server.player",
    "server.player.write",
    "server.remote-channel",
  ]);
  assert.deepEqual(result.manifest.scripts.clientCapabilities, ["client.core", "client.ui", "client.remote-channel"]);
  assert.deepEqual(result.physics.playerBody.boundsHalfExtents, { x: 0.45, y: 1.1, z: 0.45 });
  assert.deepEqual(result.physics.playerBody.shapeHalfExtents, { x: 0.45, y: 1.1, z: 0.45 });
  const terrain = JSON.parse(await readFile(join(output, "world", "terrain.json"), "utf8"));
  assert.equal(terrain.voxels.length, result.voxelCount);
  assert.equal(new Set(terrain.voxels.map(voxel => voxel.position.join(","))).size, terrain.voxels.length);
  const physics = JSON.parse(await readFile(join(output, "world", "physics.json"), "utf8"));
  assert.equal(physics.formatVersion, "nea-physics/v1");
  assert.equal(physics.stepHeight, 1.25);
  assert.equal(physics.playerBody.origin, "body-center");
  assert.equal(physics.playerBody.originStatus, "confirmed");
  assert.equal(physics.playerBody.sizeStatus, "confirmed");
  assert.equal(physics.materials["631"].restitution, 0.82);
  assert.equal(physics.colliders[0].id, "training-step");
  assert.equal(physics.triggers.length, 2);
});
