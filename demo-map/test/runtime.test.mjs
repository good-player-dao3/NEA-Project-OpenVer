import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { importMapProject } from "../src/import-project.mjs";
import { createContactEvent, createGameEntityEvent, createGameTickEvent, createRuntimeEntity, ScriptRuntime } from "../src/runtime/script-runtime.mjs";

test("runs server script lifecycle and capability-gated APIs", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-")), "project");
  await importMapProject(source, output);
  const logs = [];
  const delivered = [];
  const logger = {
    info: message => logs.push(String(message)),
    warn: message => logs.push(String(message)),
    error: message => logs.push(String(message)),
  };
  const runtime = await ScriptRuntime.load(output, {
    logger,
    sendClientEvent: (playerId, event) => delivered.push({ playerId, event }),
  });
  await runtime.start();
  const player = runtime.addPlayer({ id: "player-1", name: "Guest", position: [32, 9, 38] });
  runtime.dispatchClientEvent(player.id, { type: "nea-demo:ready" });
  for (let tick = 0; tick < 30; tick += 1) runtime.tick();
  player.position = [25, 5, 38];
  player.velocity = [0, 0, 0];
  runtime.tick();
  player.position = [41, 5, 38];
  player.velocity = [0, 0, 0];
  runtime.tick();
  const snapshot = runtime.snapshot();
  runtime.stop();

  assert.equal(snapshot.players[0].name, "Explorer-1");
  assert.ok(snapshot.messages.some(message => message.text.includes("Explorer-1 joined")));
  assert.ok(snapshot.messages.some(message => message.text.includes("completed the Player handshake")));
  assert.ok(snapshot.outboundEvents.some(item => item.event.type === "nea-demo:welcome"));
  assert.ok(snapshot.outboundEvents.some(item => item.event.type === "nea-demo:bounce"));
  assert.ok(delivered.some(item => item.playerId === "player-1" && item.event.type === "nea-demo:ack"));
  assert.ok(delivered.some(item => item.event.type === "nea-demo:checkpoint"));
  assert.ok(delivered.some(item => item.event.type === "nea-demo:hazard" && item.event.health === 75));
  assert.equal(snapshot.players[0].health, 75);
  assert.equal(snapshot.players[0].collision.origin, "body-center");
  assert.equal(snapshot.players[0].collision.sizeStatus, "confirmed");
  assert.deepEqual(snapshot.players[0].collision.halfExtents, { x: 0.45, y: 1.1, z: 0.45 });
  assert.deepEqual(snapshot.players[0].collision.boundsHalfExtents, { x: 0.45, y: 1.1, z: 0.45 });
  assert.deepEqual(snapshot.players[0].collision.shapeHalfExtents, { x: 0.45, y: 1.1, z: 0.45 });
  assert.equal(snapshot.physics.triggers, 2);
  assert.ok(snapshot.physics.chunks > 0);
  assert.ok(snapshot.entities.find(entity => entity.id === "central-beacon")?.tags.includes("active"));
  assert.ok(logs.some(line => line.includes("server script loaded")));
});

test("backend-authoritative players observe state without local gravity and queue script writes", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-state-")), "project");
  await importMapProject(source, output);
  const writes = [];
  const runtime = await ScriptRuntime.load(output, {
    logger: { info() {}, warn() {}, error() {} },
    writePlayerState: (playerId, state) => writes.push({ playerId, state }),
  });
  await runtime.start();
  const player = runtime.addPlayer({ id: "backend-1", position: [10, 10, 10], authority: "backend" });
  runtime.applyAuthoritativeState(player.id, { tick: 20, playerId: 77, position: [12, 7, 12], velocity: [1, 0, 0] });
  runtime.tick();
  assert.deepEqual(player.position.toArray(), [12, 7, 12]);
  player.applyImpulse({ x: 2, y: 3, z: 4 });
  const snapshot = runtime.snapshot().players[0];
  runtime.stop();
  assert.equal(snapshot.authority, "backend");
  assert.equal(snapshot.backendPlayerId, 77);
  assert.deepEqual(snapshot.velocity, [3, 3, 4]);
  assert.ok(writes.some(write => write.playerId === "backend-1" && write.state.velocity[1] === 3));
});

test("RuntimePlayer id is getter-only and remains stable", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-id-")), "project");
  await importMapProject(source, output);
  const runtime = await ScriptRuntime.load(output, { logger: { info() {}, warn() {}, error() {} } });
  const player = runtime.addPlayer({ id: "stable-player", position: [0, 4, 0] });
  const descriptor = Object.getOwnPropertyDescriptor(player, "id");
  assert.equal(typeof descriptor.get, "function");
  assert.equal(descriptor.set, undefined);
  assert.throws(() => { player.id = "rewritten"; }, TypeError);
  assert.equal(player.id, "stable-player");
  assert.equal(player.snapshot().id, "stable-player");
  assert.equal(runtime.addPlayer({ id: "stable-player" }), player);
  assert.deepEqual(runtime.snapshot().players.map(item => item.id), ["stable-player"]);
});

test("RuntimeEntity properties and snapshots cannot diverge", () => {
  const entity = createRuntimeEntity({ id: "stable-entity", kind: "prop", position: [1, 2, 3], tags: ["initial"] });
  assert.throws(() => { entity.id = "rewritten"; }, TypeError);
  assert.throws(() => { entity.kind = "other"; }, TypeError);
  entity.position = [4, 5, 6];
  entity.tags.add("active");
  assert.deepEqual(entity.snapshot(), {
    id: "stable-entity",
    kind: "prop",
    position: [4, 5, 6],
    tags: ["active", "initial"],
  });
});

test("server lifecycle event objects retain historical fields", () => {
  const entity = Object.freeze({ id: "event-player" });
  assert.deepEqual(createGameTickEvent(8, 7, 50, false), {
    tick: 8,
    prevTick: 7,
    elapsedTimeMS: 50,
    skip: false,
    deltaTime: 0.05,
  });
  assert.deepEqual(createGameEntityEvent(8, entity), {
    tick: 8,
    entity,
    player: entity,
  });
});

test("voxel contact events expose canonical fields without inventing force", () => {
  const entity = Object.freeze({ id: "event-player" });
  const event = createContactEvent(12, entity, {
    collider: Object.freeze({
      kind: "voxel",
      id: "4,5,6",
      x: 4,
      y: 5,
      z: 6,
      blockId: 631,
      tags: Object.freeze(["bounce"]),
      material: Object.freeze({ friction: 1, restitution: 0.8 }),
    }),
    normal: Object.freeze({ x: 0, y: 1, z: 0 }),
  });
  assert.equal(event.tick, 12);
  assert.equal(event.entity, entity);
  assert.deepEqual([event.x, event.y, event.z, event.voxel], [4, 5, 6, 631]);
  assert.deepEqual(event.axis.toArray(), [0, 1, 0]);
  assert.equal(event.normal, event.axis);
  assert.equal(event.force, null);
  assert.deepEqual(event.compatibility, { canonical: "partial", unresolved: ["force"] });
});
