import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadPreservedBlockCatalog } from "../../local-player/src/block-info.mjs";
import { importMapProject } from "../src/import-project.mjs";
import { createContactEvent, createGameDamageEvent, createGameEntityEvent, createGameTickEvent, createRuntimeEntity, ScriptRuntime } from "../src/runtime/script-runtime.mjs";

const archiveRoot = resolve(fileURLToPath(new URL("../../local-player/archive", import.meta.url)));
const blockCatalog = await loadPreservedBlockCatalog(archiveRoot, "world-bedwars.json");

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
    blockCatalog,
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
  assert.equal(snapshot.players[0].collision.shapeSource, "player-body-profile");
  assert.deepEqual(snapshot.players[0].collision.halfExtents, { x: 0.45, y: 1.1, z: 0.45 });
  assert.deepEqual(snapshot.players[0].collision.boundsHalfExtents, { x: 0.45, y: 1.1, z: 0.45 });
  assert.deepEqual(snapshot.players[0].collision.shapeHalfExtents, { x: 0.45, y: 1.1, z: 0.45 });
  assert.equal(snapshot.physics.triggers, 2);
  assert.ok(snapshot.physics.chunks > 0);
  assert.ok(snapshot.entities.find(entity => entity.id === "central-beacon")?.tags.includes("active"));
  assert.ok(logs.some(line => line.includes("server script loaded")));
});

test("provides the recovered GameConsole method surface", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-console-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    console.clear(); console.debug("debug"); console.assert(false, "assertion");
    console.dir({}); console.dirxml({}); console.group(); console.groupCollapsed(); console.groupEnd();
    console.table([]); console.time(); console.timeEnd(); console.timeLog(); console.timeStamp(); console.trace();
  `, "utf8");
  const calls = [];
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { clear: () => calls.push("clear"), info: message => calls.push(String(message)), debug: message => calls.push(String(message)), warn() {}, error: message => calls.push(String(message)) } });
  await runtime.start();
  runtime.stop();
  assert.ok(calls.includes("clear"));
  assert.ok(calls.some(call => call.includes("debug")));
  assert.ok(calls.some(call => call.includes("assertion")));
});

test("GameWorld.raycast exposes recovered result fields inside server scripts", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-raycast-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    const target = world.createEntity({ id: "ray-target", position: [100000, 1, 1] });
    const result = world.raycast([99990, 1, 1], [2, 0, 0], { maxDistance: 20, ignoreVoxel: true });
    if (!result.hit || result.hitEntity !== target) throw new Error("raycast entity mismatch");
    if (result.hitVoxel !== 0 || result.voxel !== 0) throw new Error("raycast voxel mismatch");
    if (result.distance !== 9.5) throw new Error("raycast distance mismatch: " + result.distance);
    if (result.direction.x !== 1 || result.normal.x !== -1) throw new Error("raycast vector mismatch");
    if (result.hitPosition.x !== 99999.5) throw new Error("raycast hitPosition mismatch");
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  runtime.stop();
});

test("GameWorld.size exposes recovered maximum voxel indices", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-world-size-")), "project");
  await importMapProject(source, output);
  const project = JSON.parse(await readFile(join(output, "dao3.project.json"), "utf8"));
  const worldSnapshot = JSON.parse(await readFile(join(output, project.world), "utf8"));
  await writeFile(join(output, "scripts", "server.js"), `
    world.onPlayerJoin(({ entity }) => {
      entity.recoveredWorldSize = [world.size.x, world.size.y, world.size.z];
    });
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  const player = runtime.addPlayer({ id: "world-size-player" });
  assert.deepEqual(Array.from(player.recoveredWorldSize), worldSnapshot.shape.map(value => value - 1));
  assert.equal(runtime.voxels.shape.x, worldSnapshot.shape[0] - 1);
  runtime.stop();
});

test("preserves captured source tags outside the project-package carrier grammar", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-source-tags-")), "project");
  await importMapProject(source, output);
  const project = JSON.parse(await readFile(join(output, "dao3.project.json"), "utf8"));
  const world = JSON.parse(await readFile(join(output, project.world), "utf8"));
  await writeFile(join(output, world.entities), JSON.stringify({ entities: [{
    kind: "entity",
    position: [1, 2, 3],
    tags: ["id-source-tags", "safe-tag"],
    source: { name: "captured-tag-entity", tags: [".native", "MixedCase", "safe-tag"] },
  }] }), "utf8");
  await writeFile(join(output, "scripts", "server.js"), `
    const entity = world.querySelector("#captured-tag-entity");
    if (!entity.hasTag(".native") || !entity.hasTag("MixedCase")) throw new Error("captured source tags missing");
    if (!entity.hasTag("safe-tag") || !entity.hasTag("id-source-tags")) throw new Error("carrier tags missing");
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  runtime.stop();
});

test("cleans recovered interval timers on stop", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-interval-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    const timer = setInterval(() => console.log("interval"), 1);
    setTimeout(() => clearInterval(timer), 4);
  `, "utf8");
  const logs = [];
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info: message => logs.push(String(message)), warn() {}, error() {} } });
  await runtime.start();
  await new Promise(resolve => setTimeout(resolve, 12));
  runtime.stop();
  assert.ok(logs.some(message => message.includes("interval")));
});

test("provides sleep and collision filter state APIs from the declared GameWorld surface", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-world-physics-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    world.addCollisionFilter("player", "player");
    world.addCollisionFilter(".groupA", "player");
    const active = world.collisionFilters();
    if (JSON.stringify(active) !== JSON.stringify([["player", "player"], [".groupA", "player"]])) throw new Error("collisionFilters mismatch");
    active[0][0] = "mutated";
    if (world.collisionFilters()[0][0] !== "player") throw new Error("collisionFilters leaked mutable state");
    world.removeCollisionFilter(".groupA", "player");
    if (world.collisionFilters().length !== 1) throw new Error("removeCollisionFilter mismatch");
    world.clearCollisionFilters();
    if (world.collisionFilters().length !== 0) throw new Error("clearCollisionFilters mismatch");
    sleep(1).then(() => world.say("sleep complete"));
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  await new Promise(resolveSleep => setTimeout(resolveSleep, 12));
  const snapshot = runtime.snapshot();
  runtime.stop();
  assert.ok(snapshot.messages.some(message => message.text === "sleep complete"));
});

test("uses the recovered GameWorld prototype and documented selector grammar", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-selectors-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    if (!(world instanceof GameWorld)) throw new Error("world prototype mismatch");
    world.customState = [0, 1];
    if (world.customState[1] !== 1) throw new Error("world custom state mismatch");
    const chair = world.createEntity({ id: "chair-id", name: "chair", tags: ["box", "red"] });
    world.createEntity({ id: "blue-id", name: "blue-chair", tags: ["box", "blue"] });
    if (world.querySelector("#chair") !== chair) throw new Error("name selector mismatch");
    if (world.querySelectorAll(".box").length !== 2) throw new Error("tag selector mismatch");
    if (world.querySelectorAll(".box .red")[0] !== chair) throw new Error("compound selector mismatch");
    if (!world.testSelector(chair, ".box .red")) throw new Error("testSelector mismatch");
    world.onPlayerJoin(({ player }) => {
      if (world.querySelectorAll("player")[0] !== player) throw new Error("player selector mismatch");
      if (!world.querySelectorAll("*").includes(player)) throw new Error("universal selector mismatch");
      if (player.player !== player || !player.isPlayer) throw new Error("player entity surface mismatch");
    });
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  runtime.addPlayer({ id: "selector-player" });
  runtime.stop();
});

test("loads synchronized server modules through native-style relative require", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-modules-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "helper.js"), `module.exports = { name: "Module Player" };`, "utf8");
  await writeFile(join(output, "scripts", "server.js"), `
    const helper = require("./helper.js");
    world.onPlayerJoin(({ player }) => { player.name = helper.name; });
  `, "utf8");
  const manifestPath = join(output, "scripts", "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.modules = ["scripts/server.js", "scripts/helper.js"];
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  const player = runtime.addPlayer({ id: "module-player" });
  runtime.stop();
  assert.equal(player.name, "Module Player");
});

test("dispatches recovered GameChatEvent fields", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-chat-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `world.onChat(event => { globalThis.chatEvent = event; });`, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  const player = runtime.addPlayer({ id: "chat-player" });
  assert.equal(runtime.dispatchChat(player.id, "hello"), true);
  assert.equal(runtime.dispatchChat("missing", "ignored"), false);
  assert.equal(player.id, "chat-player");
  runtime.stop();
});

test("registers and dispatches recovered input event surfaces", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-input-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    globalThis.events = [];
    for (const name of ["Press", "Click", "Release", "FluidEnter", "FluidLeave", "Die", "EntityContact", "PlayerPurchaseSuccess"]) world["on" + name](event => events.push(name + ":" + event.entity.id));
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  runtime.addPlayer({ id: "input-player" });
  for (const type of ["press", "click", "release", "fluidEnter", "fluidLeave", "die", "entityContact", "playerPurchaseSuccess"]) assert.equal(runtime.dispatchWorldEvent(type, "input-player", { button: "action0" }), true);
  assert.equal(runtime.dispatchWorldEvent("unknown", "input-player"), false);
  runtime.stop();
});

test("provides recovered player-local events, stable identity, wearables, and dialog calls", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-player-surface-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    world.onPlayerJoin(({ entity }) => {
      entity._id = "mutated";
      entity.addTag("ready");
      entity.player.onPress(({ button }) => { globalThis.localPress = button; });
      entity.onFluidEnter(({ fluid }) => { globalThis.localFluid = fluid; });
      const wearable = entity.player.addWearable({ bodyPart: GameBodyPart.RIGHT_HAND, mesh: "mesh/sword.vb" });
      if (entity.player.wearables(GameBodyPart.RIGHT_HAND)[0] !== wearable) throw new Error("wearables mismatch");
      entity.player.removeWearable(wearable);
      entity.player.directMessage("ready message");
      entity.player.dialog({ type: "text", title: "Ready", content: "Ready" }).then(result => { globalThis.dialogResult = result; });
    });
  `, "utf8");
  const dialogs = [];
  const runtime = await ScriptRuntime.load(output, { blockCatalog, showDialog: async (playerId, config) => { dialogs.push({ playerId, config }); return { value: 0 }; }, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  const player = runtime.addPlayer({ id: "stable-player", name: "Guest" });
  runtime.dispatchWorldEvent("press", player.id, { button: "action0" });
  runtime.dispatchWorldEvent("fluidEnter", player.id, { fluid: 7 });
  await new Promise(resolveEvent => setTimeout(resolveEvent, 1));
  const snapshot = runtime.snapshot();
  runtime.stop();
  assert.equal(player.id, "stable-player");
  assert.equal(player.hasTag("ready"), true);
  assert.deepEqual(player.spawnPoint.toArray(), [0, 0, 0]);
  assert.deepEqual(dialogs, [{ playerId: "stable-player", config: { type: "text", title: "Ready", content: "Ready" } }]);
  assert.ok(snapshot.messages.some(message => message.playerId === "stable-player" && message.text === "ready message"));
});

test("GamePlayer color, spawnPoint, forceRespawn, and respawn events match recovered usage", async () => {
  const sourceRoot = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-respawn-")), "project");
  await importMapProject(sourceRoot, output);
  await writeFile(join(output, "scripts", "server.js"), `
    world.onRespawn(({ entity }) => { entity.worldRespawnObserved = true; });
    world.onPlayerJoin(({ entity }) => {
      entity.player.onRespawn(({ entity: respawned }) => { respawned.playerRespawnObserved = true; });
      entity.player.color.set(0.25, 0.5, 0.75);
      entity.player.spawnPoint.set(10, 20, 30);
      entity.player.forceRespawn();
    });
  `, "utf8");
  const writes = [];
  const damageWrites = [];
  const runtime = await ScriptRuntime.load(output, {
    blockCatalog,
    writePlayerState: async (playerId, state) => writes.push({ playerId, state }),
    writeDamageState: async (target, state, events) => damageWrites.push({ target, state, events }),
    logger: { info() {}, warn() {}, error() {} },
  });
  await runtime.start();
  const player = runtime.addPlayer({ id: "respawn-player", position: [1, 2, 3], authority: "backend" });
  await new Promise(resolveEvent => setTimeout(resolveEvent, 1));
  assert.deepEqual(player.position.toArray(), [10, 20, 30]);
  assert.deepEqual(player.spawnPoint.toArray(), [10, 20, 30]);
  assert.deepEqual({ r: player.color.r, g: player.color.g, b: player.color.b }, { r: 0.25, g: 0.5, b: 0.75 });
  assert.equal(player.worldRespawnObserved, true);
  assert.equal(player.playerRespawnObserved, true);
  assert.equal(writes.at(-1)?.playerId, "respawn-player");
  assert.deepEqual(writes.at(-1)?.state.position, [10, 20, 30]);
  assert.equal(damageWrites.some(write => write.target.playerId === "respawn-player" && write.events.respawn === true), true);
  runtime.stop();
});

test("GamePlayer damage dispatches documented entity and world damage events", async () => {
  const sourceRoot = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-damage-")), "project");
  await importMapProject(sourceRoot, output);
  await writeFile(join(output, "scripts", "server.js"), `
    world.onTakeDamage(event => {
      event.entity.worldDamage = {
        tick: event.tick,
        entity: event.entity.id,
        attacker: event.attacker,
        damage: event.damage,
        damageType: event.damageType,
      };
    });
    world.onPlayerJoin(({ entity }) => {
      entity.player.onTakeDamage(event => {
        event.entity.playerDamage = {
          tick: event.tick,
          entity: event.entity.id,
          attacker: event.attacker,
          damage: event.damage,
          damageType: event.damageType,
        };
      });
    });
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  const player = runtime.addPlayer({ id: "damage-player" });
  assert.equal(player.damage(25), 75);
  const expected = { tick: 0, entity: "damage-player", attacker: null, damage: 25, damageType: "" };
  assert.deepEqual({ ...player.playerDamage }, expected);
  assert.deepEqual({ ...player.worldDamage }, expected);
  runtime.stop();
});

test("GameEntity hurt follows recovered damage, healing, death, and client-event semantics", async () => {
  const sourceRoot = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-hurt-")), "project");
  await importMapProject(sourceRoot, output);
  await writeFile(join(output, "scripts", "server.js"), `
    const dummy = world.createEntity({ id: "damage-dummy", enableDamage: true, hp: 10, maxHp: 10 });
    dummy.damageEvents = [];
    dummy.dieEvents = [];
    dummy.onTakeDamage(event => dummy.damageEvents.push({ damage: event.damage, attacker: event.attacker && event.attacker.id, damageType: event.damageType }));
    dummy.onDie(event => dummy.dieEvents.push({ attacker: event.attacker && event.attacker.id, damageType: event.damageType }));
    world.onTakeDamage(event => {
      if (event.entity.isPlayer) remoteChannel.sendClientEvent([event.entity], {
        type: "health-update", hp: event.entity.hp, damage: event.damage,
        attacker: event.attacker && event.attacker.id, damageType: event.damageType,
      });
    });
    world.onDie(event => {
      if (event.entity.isPlayer) remoteChannel.sendClientEvent([event.entity], {
        type: "death", attacker: event.attacker && event.attacker.id, damageType: event.damageType,
      });
    });
    world.onPlayerJoin(({ entity }) => {
      entity.enableDamage = true;
      entity.maxHp = 20;
      entity.hp = 20;
      entity.damageDummy = dummy;
      entity.damageEvents = [];
      entity.dieEvents = [];
      entity.onTakeDamage(event => entity.damageEvents.push({ damage: event.damage, attacker: event.attacker && event.attacker.id, damageType: event.damageType }));
      entity.onDie(event => entity.dieEvents.push({ attacker: event.attacker && event.attacker.id, damageType: event.damageType }));
    });
  `, "utf8");
  const delivered = [];
  const damageWrites = [];
  const runtime = await ScriptRuntime.load(output, {
    blockCatalog,
    logger: { info() {}, warn() {}, error() {} },
    sendClientEvent: (playerId, event) => delivered.push({ playerId, event }),
    writeDamageState: (target, state, events) => damageWrites.push({ target, state, events }),
  });
  await runtime.start();
  const attacker = runtime.addPlayer({ id: "hurt-attacker" });
  const target = runtime.addPlayer({ id: "hurt-target" });
  delivered.length = 0;
  damageWrites.length = 0;

  assert.equal(target.hurt(5, { attacker, damageType: "melee" }), undefined);
  target.hurt(-2, { attacker, damageType: "ignored-heal-source" });
  target.hurt(50, "void");
  target.hurt(1);
  target.damageDummy.hurt(4, { attacker, damageType: "golem" });
  target.damageDummy.hurt(6, { attacker, damageType: "golem" });

  assert.equal(target.hp, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(target.damageEvents)), [
    { damage: 5, attacker: "hurt-attacker", damageType: "melee" },
    { damage: -2, attacker: null, damageType: "" },
    { damage: 50, attacker: null, damageType: "void" },
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(target.dieEvents)), [{ attacker: null, damageType: "void" }]);
  assert.deepEqual(JSON.parse(JSON.stringify(target.damageDummy.damageEvents)), [
    { damage: 4, attacker: "hurt-attacker", damageType: "golem" },
    { damage: 6, attacker: "hurt-attacker", damageType: "golem" },
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(target.damageDummy.dieEvents)), [{ attacker: "hurt-attacker", damageType: "golem" }]);
  assert.deepEqual(delivered, [
    { playerId: "hurt-target", event: { type: "health-update", hp: 15, damage: 5, attacker: "hurt-attacker", damageType: "melee" } },
    { playerId: "hurt-target", event: { type: "health-update", hp: 17, damage: -2, attacker: null, damageType: "" } },
    { playerId: "hurt-target", event: { type: "health-update", hp: 0, damage: 50, attacker: null, damageType: "void" } },
    { playerId: "hurt-target", event: { type: "death", attacker: null, damageType: "void" } },
  ]);
  assert.deepEqual(damageWrites, [
    { target: { playerId: "hurt-target" }, state: { showHealthBar: true, hp: 15, maxHp: 20 }, events: { hurt: 5, die: false } },
    { target: { playerId: "hurt-target" }, state: { showHealthBar: true, hp: 17, maxHp: 20 }, events: { hurt: -2, die: false } },
    { target: { playerId: "hurt-target" }, state: { showHealthBar: true, hp: 0, maxHp: 20 }, events: { hurt: 50, die: true } },
  ]);
  runtime.stop();
});

test("GameEntity destroy removes non-player entities once and despawns mapped replicas", async () => {
  const sourceRoot = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-destroy-")), "project");
  await importMapProject(sourceRoot, output);
  await writeFile(join(output, "scripts", "server.js"), `
    world.onPlayerJoin(({ entity }) => {
      const target = world.querySelector(".interactable");
      let destroyEvents = 0;
      target.onDestroy(event => {
        destroyEvents += 1;
        entity.destroyEventMatches = event.entity === target && event.player === target;
      });
      target.destroy();
      target.destroy();
      entity.destroy();
      entity.destroyResult = {
        destroyed: target.destroyed,
        queryMissing: world.querySelector(".interactable") === null,
        destroyEvents,
        playerSurvived: entity.destroyed === false,
      };
    });
  `, "utf8");
  const destroyed = [];
  const runtime = await ScriptRuntime.load(output, {
    blockCatalog,
    destroyEntity: entityId => destroyed.push(entityId),
    logger: { info() {}, warn() {}, error() {} },
  });
  await runtime.start();
  assert.equal(runtime.bindBackendEntities([{ sourceId: "central-beacon", entityId: 1000042 }]), 1);
  const player = runtime.addPlayer({ id: "destroy-player" });
  await new Promise(resolveEvent => setTimeout(resolveEvent, 1));
  assert.deepEqual({ ...player.destroyResult }, { destroyed: true, queryMissing: true, destroyEvents: 1, playerSurvived: true });
  assert.equal(player.destroyEventMatches, true);
  assert.deepEqual(destroyed, [1000042]);
  runtime.stop();
});

test("GameWorld.createEntity emits synchronously and projects captured runtime entity state", async () => {
  const sourceRoot = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-create-entity-")), "project");
  await importMapProject(sourceRoot, output);
  await writeFile(join(output, "scripts", "server.js"), `
    world.onEntityCreate(event => {
      event.entity.creationEvent = {
        tick: event.tick,
        entity: event.entity.id,
        playerAlias: event.player === event.entity,
      };
    });
    world.onPlayerJoin(({ entity: player }) => {
      const created = world.createEntity({
        id: "runtime-projectile",
        name: "Runtime Projectile",
        tags: ["runtime-projectile"],
        mesh: "captured-runtime-mesh",
        position: [1, 2, 3],
        velocity: [0, 1, 0],
        collides: false,
        fixed: true,
        gravity: false,
        mass: 2,
        friction: 0.25,
        restitution: 0.5,
        meshScale: [2, 3, 4],
        meshOrientation: [0, 0, 0, 1],
        meshInvisible: true,
        meshMetalness: 0.7,
        meshEmissive: 0.2,
        meshShininess: 0.9,
        enableInteract: true,
      });
      player.runtimeCreate = {
        id: created.id,
        creationEvent: created.creationEvent,
        selectorMatches: world.querySelector(".runtime-projectile") === created,
      };
      created.position = [10, 11, 12];
      created.velocity = [3, 2, 1];
    });
  `, "utf8");
  const creates = [];
  const states = [];
  const runtime = await ScriptRuntime.load(output, {
    blockCatalog,
    createEntity: entity => {
      creates.push(structuredClone(entity));
      return { entityId: 7002 };
    },
    writeEntityState: (entityId, state) => states.push({ entityId, state: structuredClone(state) }),
    logger: { info() {}, warn() {}, error() {} },
  });
  await runtime.start();
  const player = runtime.addPlayer({ id: "create-entity-player" });
  for (let attempt = 0; states.length === 0 && attempt < 100; attempt += 1) {
    await new Promise(resolveEvent => setTimeout(resolveEvent, 1));
  }

  assert.deepEqual(JSON.parse(JSON.stringify(player.runtimeCreate)), {
    id: "runtime-projectile",
    creationEvent: { tick: 0, entity: "runtime-projectile", playerAlias: true },
    selectorMatches: true,
  });
  assert.deepEqual(JSON.parse(JSON.stringify(creates)), [{
    position: [1, 2, 3], velocity: [0, 1, 0], name: "Runtime Projectile", tags: ["runtime-projectile"],
    mesh: "captured-runtime-mesh", collides: false, fixed: true, gravity: false, mass: 2,
    friction: 0.25, restitution: 0.5, meshScale: [2, 3, 4], meshOrientation: [0, 0, 0, 1],
    meshInvisible: true, meshMetalness: 0.7, meshEmissive: 0.2, meshShininess: 0.9, enableInteract: true,
  }]);
  assert.deepEqual(JSON.parse(JSON.stringify(states)), [{ entityId: 7002, state: {
    position: [10, 11, 12], velocity: [3, 2, 1], orientation: [0, 0, 0, 1],
  } }]);
  runtime.stop();
});

test("game-net input events reconstruct GameInputEvent press and release payloads", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-input-events-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    world.onPress(event => {
      event.entity.inputEvents ??= [];
      event.entity.inputEvents.push({
        tick: event.tick, button: event.button, pressed: event.pressed,
        position: event.position.toArray(), hit: event.raycast.hit,
        action0: event.button === GameButtonType.ACTION0,
        jump: event.button === GameButtonType.JUMP,
      });
    });
    world.onRelease(event => {
      event.entity.inputEvents.push({ tick: event.tick, button: event.button, pressed: event.pressed });
    });
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  const player = runtime.addPlayer({ id: "input-event-player" });
  assert.equal(runtime.dispatchInputEvents(player.id, { events: [{
    tick: 12, buttonState: 5, prevButtonState: 0, position: [1, 2, 3],
    rayTime: -1, rayOrigin: [1, 3, 3], rayDirection: [0, 0, 1],
    rayHitEntity: 0, rayHitVoxelX: 0, rayHitVoxelY: 0, rayHitVoxelZ: 0, rayHitNormal: [0, 0, 0],
  }] }), 2);
  assert.deepEqual({ action0: player.action0Button, action1: player.action1Button, jump: player.jumpButton, walk: player.walkButton, crouch: player.crouchButton }, { action0: true, action1: false, jump: true, walk: false, crouch: false });
  assert.equal(runtime.dispatchInputEvents(player.id, { events: [{
    tick: 13, buttonState: 4, prevButtonState: 5, position: [1, 2, 3],
    rayTime: -1, rayOrigin: [1, 3, 3], rayDirection: [0, 0, 1],
    rayHitEntity: 0, rayHitVoxelX: 0, rayHitVoxelY: 0, rayHitVoxelZ: 0, rayHitNormal: [0, 0, 0],
  }] }), 1);
  assert.equal(player.action0Button, false);
  assert.equal(player.jumpButton, true);
  assert.deepEqual(Array.from(player.inputEvents, item => ({ ...item, position: item.position && Array.from(item.position) })), [
    { tick: 12, button: "action0", pressed: true, position: [1, 2, 3], hit: false, action0: true, jump: false },
    { tick: 12, button: "jump", pressed: true, position: [1, 2, 3], hit: false, action0: false, jump: true },
    { tick: 13, button: "action0", pressed: false, position: undefined },
  ]);
  runtime.stop();
});

test("game-net input honors recovered GamePlayer permission flags", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-input-permissions-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    world.onPress(event => {
      event.entity.allowedPresses ??= [];
      event.entity.allowedPresses.push(event.button);
    });
    world.onRelease(event => event.entity.allowedReleases = [...(event.entity.allowedReleases ?? []), event.button]);
    world.onClick(event => event.clicker.disabledClickDispatched = true);
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  const player = runtime.addPlayer({ id: "permission-player" });
  assert.deepEqual({ action0: player.enableAction0, action1: player.enableAction1, jump: player.enableJump, jump2: player.enableDoubleJump, crouch: player.enableCrouch }, { action0: true, action1: true, jump: true, jump2: true, crouch: true });
  player.enableAction0 = false;
  player.enableJump = false;
  player.enableDoubleJump = false;
  player.enableCrouch = false;
  assert.equal(runtime.dispatchInputEvents(player.id, { events: [{
    tick: 30, buttonState: 95, prevButtonState: 0, position: [0, 0, 0],
    rayTime: 1, rayOrigin: [0, 0, 0], rayDirection: [1, 0, 0],
    rayHitEntity: 0, rayHitVoxelX: 1, rayHitVoxelY: 0, rayHitVoxelZ: 0, rayHitNormal: [-1, 0, 0],
  }] }), 2);
  assert.deepEqual(Array.from(player.allowedPresses), ["action1", "walk"]);
  assert.equal(player.disabledClickDispatched, undefined);
  assert.deepEqual({ action0: player.action0Button, action1: player.action1Button, jump: player.jumpButton, walk: player.walkButton, crouch: player.crouchButton }, { action0: false, action1: true, jump: false, walk: true, crouch: false });
  player.enableAction1 = false;
  assert.equal(runtime.dispatchInputEvents(player.id, { events: [{
    tick: 31, buttonState: 0, prevButtonState: 10, position: [0, 0, 0],
    rayTime: -1, rayOrigin: [0, 0, 0], rayDirection: [1, 0, 0],
    rayHitEntity: 0, rayHitVoxelX: 0, rayHitVoxelY: 0, rayHitVoxelZ: 0, rayHitNormal: [0, 0, 0],
  }] }), 1);
  assert.deepEqual(Array.from(player.allowedReleases), ["walk"]);
  runtime.stop();
});

test("game-net action presses dispatch evidence-based GameClickEvent to world and target entity", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-click-events-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    const target = world.querySelector(".interactable");
    world.onClick(event => {
      event.clicker.worldClickEvent = event;
      event.clicker.worldClick = {
        tick: event.tick, entity: event.entity.id, clicker: event.clicker.id, button: event.button,
        distance: event.distance, clickerPosition: event.clickerPosition.toArray(),
        hitEntity: event.raycast.hitEntity.id, hitPosition: event.raycast.hitPosition.toArray(),
      };
    });
    target.onClick(event => {
      event.clicker.entityClick = event.entity === target && event.clicker.worldClickEvent === event;
    });
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  assert.equal(runtime.bindBackendEntities([{ sourceId: "central-beacon", entityId: 1000042 }]), 1);
  const player = runtime.addPlayer({ id: "click-player", position: [1, 0, 0] });
  assert.equal(runtime.dispatchInputEvents(player.id, { events: [{
    tick: 21, buttonState: 1, prevButtonState: 0, position: [1, 0, 0],
    rayTime: 3, rayOrigin: [1, 0, 0], rayDirection: [1, 0, 0],
    rayHitEntity: 1000042, rayHitVoxelX: 0, rayHitVoxelY: 0, rayHitVoxelZ: 0, rayHitNormal: [-1, 0, 0],
  }] }), 1);
  assert.deepEqual({ ...player.worldClick, clickerPosition: Array.from(player.worldClick.clickerPosition), hitPosition: Array.from(player.worldClick.hitPosition) }, {
    tick: 21, entity: "central-beacon", clicker: player.id, button: "action0", distance: 3,
    clickerPosition: [1, 0, 0], hitEntity: "central-beacon", hitPosition: [4, 0, 0],
  });
  assert.equal(player.entityClick, true);
  runtime.stop();
});

test("server remoteChannel supports historical events, arrays, and broadcast", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-remote-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    remoteChannel.onServerEvent(({ tick, entity, args }) => {
      remoteChannel.sendClientEvent([entity], { type: "array-target", tick, value: args.value });
      remoteChannel.broadcastClientEvent({ type: "broadcast", sender: entity.id });
    });
  `, "utf8");
  const delivered = [];
  const runtime = await ScriptRuntime.load(output, {
    blockCatalog,
    logger: { info() {}, warn() {}, error() {} },
    sendClientEvent: (playerId, event) => delivered.push({ playerId, event }),
  });
  await runtime.start();
  runtime.addPlayer({ id: "remote-1" });
  runtime.addPlayer({ id: "remote-2" });
  runtime.tick();
  assert.equal(runtime.dispatchClientEvent("remote-1", { value: 9 }), true);
  runtime.stop();
  assert.deepEqual(delivered, [
    { playerId: "remote-1", event: { type: "array-target", tick: 1, value: 9 } },
    { playerId: "remote-1", event: { type: "broadcast", sender: "remote-1" } },
    { playerId: "remote-2", event: { type: "broadcast", sender: "remote-1" } },
  ]);
});

test("backend-authoritative players observe state without local gravity and queue script writes", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-state-")), "project");
  await importMapProject(source, output);
  const writes = [];
  const runtime = await ScriptRuntime.load(output, {
    blockCatalog,
    logger: { info() {}, warn() {}, error() {} },
    writePlayerState: (playerId, state) => writes.push({ playerId, state }),
  });
  await runtime.start();
  const player = runtime.addPlayer({ id: "backend-1", position: [10, 10, 10], authority: "backend" });
  runtime.applyAuthoritativeState(player.id, {
    tick: 20,
    playerId: 77,
    position: [12, 7, 12],
    velocity: [1, 0, 0],
    bodyHalfExtents: [0.45, 1.1, 0.45],
    bodyShapeHalfExtents: [0.4, 1, 0.4],
  });
  runtime.tick();
  assert.deepEqual(player.position.toArray(), [12, 7, 12]);
  player.applyImpulse({ x: 2, y: 3, z: 4 });
  const snapshot = runtime.snapshot().players[0];
  runtime.stop();
  assert.equal(snapshot.authority, "backend");
  assert.equal(snapshot.backendPlayerId, 77);
  assert.equal(snapshot.collision.shapeSource, "authoritative-state");
  assert.deepEqual(snapshot.collision.boundsHalfExtents, { x: 0.45, y: 1.1, z: 0.45 });
  assert.deepEqual(snapshot.collision.shapeHalfExtents, { x: 0.4, y: 1, z: 0.4 });
  assert.deepEqual(snapshot.velocity, [3, 3, 4]);
  assert.ok(writes.some(write => write.playerId === "backend-1" && write.state.velocity[1] === 3));
});

test("RuntimePlayer id is getter-only and remains stable", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-id-")), "project");
  await importMapProject(source, output);
  const runtime = await ScriptRuntime.load(output, {
    blockCatalog, logger: { info() {}, warn() {}, error() {} } });
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

test("GUI transport keeps the internal player identity after scripts redefine public entity.id", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-gui-identity-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    world.onPlayerJoin(({ entity }) => {
      Object.defineProperties(entity, { id: { value: entity.player.name } });
      gui.init(entity, { "": { display: true, data: "<dialog />" } });
    });
  `, "utf8");
  const commands = [];
  const runtime = await ScriptRuntime.load(output, {
    blockCatalog,
    logger: { info() {}, warn() {}, error() {} },
    sendGuiCommand: command => { commands.push(command); },
  });
  await runtime.start();
  const player = runtime.addPlayer({ id: "internal-player", name: "Guest" });
  await Promise.resolve();
  assert.equal(player.id, "Guest");
  assert.equal(commands[0].playerId, "internal-player");
  runtime.stop();
});

test("RuntimeEntity properties and snapshots cannot diverge", () => {
  const entity = createRuntimeEntity({ id: "stable-entity", kind: "prop", position: [1, 2, 3], tags: ["initial"] });
  assert.throws(() => { entity.id = "rewritten"; }, TypeError);
  assert.throws(() => { entity.kind = "other"; }, TypeError);
  entity.position = [4, 5, 6];
  entity.tags.add("active");
  assert.deepEqual(entity.snapshot(), {
    id: "stable-entity",
    name: "stable-entity",
    kind: "prop",
    position: [4, 5, 6],
    tags: ["active", "initial"],
    destroyed: false,
    enableDamage: false,
    showHealthBar: true,
    hp: 100,
    maxHp: 100,
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
  assert.deepEqual(createGameDamageEvent(9, entity, 25), {
    tick: 9,
    entity,
    attacker: null,
    damage: 25,
    damageType: "",
  });
});

test("voxel contact events expose the recovered impulse-derived force vector", () => {
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
    force: Object.freeze({ x: -2, y: 20, z: 3 }),
  });
  assert.equal(event.tick, 12);
  assert.equal(event.entity, entity);
  assert.deepEqual([event.x, event.y, event.z, event.voxel], [4, 5, 6, 631]);
  assert.deepEqual(event.axis.toArray(), [0, 1, 0]);
  assert.equal(event.normal, event.axis);
  assert.deepEqual(event.force.toArray(), [-2, 20, 3]);
  assert.deepEqual(event.compatibility, { canonical: "compatible", unresolved: [] });
});

test("GameEventFuture filters are forwarded through world next methods", async () => {
  const source = resolve(fileURLToPath(new URL("../project", import.meta.url)));
  const output = join(await mkdtemp(join(tmpdir(), "nea-runtime-event-filter-")), "project");
  await importMapProject(source, output);
  await writeFile(join(output, "scripts", "server.js"), `
    world.nextPlayerJoin(event => event.entity.name === "Target").then(event => {
      event.entity.matchedByFutureFilter = true;
    });
  `, "utf8");
  const runtime = await ScriptRuntime.load(output, { blockCatalog, logger: { info() {}, warn() {}, error() {} } });
  await runtime.start();
  const skipped = runtime.addPlayer({ id: "filter-skip", name: "Skipped" });
  await Promise.resolve();
  assert.equal(skipped.matchedByFutureFilter, undefined);
  const target = runtime.addPlayer({ id: "filter-target", name: "Target" });
  await Promise.resolve();
  assert.equal(target.matchedByFutureFilter, true);
  runtime.stop();
});
