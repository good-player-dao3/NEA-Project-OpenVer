import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(root, "..");
const localAnalysis = await readJson("generated/local-server-runtime-analysis.json");
const docs = await readJson("generated/docs-api-index.json");
const origin = await readJson("generated/origin-server-api.json");
const runtimeSourcePath = "demo-map/src/runtime/script-runtime.mjs";
const runtimeSource = await readFile(resolve(repositoryRoot, runtimeSourcePath), "utf8");

for (const marker of [
  "_id: String(input.id)",
  "get id() { return this._id; }",
  "return Object.freeze({ tick, entity, player: entity });",
  "onTakeDamage(handler) { return this._signals.takeDamage.on(handler); }",
  "return Object.freeze({ tick, entity, attacker, damage, damageType: damageType || \"\" });",
  "const permissionMask = inputPermissionMask(player);",
  "enableAction0: true,",
]) {
  if (!runtimeSource.includes(marker)) throw new Error(`RuntimePlayer adapter evidence missing: ${marker}`);
}

const localEntries = new Map(localAnalysis.entries.map(entry => [entry.id, entry]));
const docsEntries = new Map(docs.entries.map(entry => [entry.id, entry]));
const originEntries = new Map(origin.entries.map(entry => [entry.id, entry]));

const memberSpecs = [
  partial("server.RuntimePlayer.id", ["server.GameEntity.id"], {
    access: ["Local RuntimePlayer makes id getter-only, while the documentation and origin shell expose a writable GameEntity.id property."],
    signature: [],
    effect: ["RuntimePlayer.id identifies the local player wrapper; full GameEntity identity and lifecycle semantics are not implemented."],
  }),
  partial("server.RuntimePlayer.name", ["server.GamePlayerEntity.name"], {
    access: ["Documentation declares GamePlayerEntity.name readonly; local RuntimePlayer permits writes. The origin GamePlayer shell also exposes a writable name property."],
    signature: [],
    effect: ["Local writes update the compatibility runtime state and may queue an authoritative write; historical player-profile propagation is not proven."],
  }, ["server.GamePlayer.name"]),
  partial("server.RuntimePlayer.position", ["server.GameEntity.position"], {
    access: [],
    signature: ["Canonical position uses GameVector3; local RuntimePlayer exposes the smaller compatibility Vector3 surface."],
    effect: ["Local assignment writes the compatibility physics body and may queue backend state; complete GameEntity transform semantics are not implemented."],
  }),
  partial("server.RuntimePlayer.velocity", ["server.GameEntity.velocity"], {
    access: [],
    signature: ["Canonical velocity uses GameVector3; local RuntimePlayer exposes the smaller compatibility Vector3 surface."],
    effect: ["Local assignment updates the compatibility physics body; complete historical rigid-body behavior remains transport- and backend-dependent."],
  }),
  compatible("server.RuntimePlayer.walkButton", ["server.GamePlayerEntity.walkButton"], ["server.GamePlayer.walkButton"]),
  originPartial("server.RuntimePlayer.crouchButton", ["server.GamePlayer.crouchButton"], { access: [], signature: [], effect: ["The value is updated from masked game-net input events; current documentation extraction does not contain this origin-declared member."] }),
  compatible("server.RuntimePlayer.jumpButton", ["server.GamePlayerEntity.jumpButton"], ["server.GamePlayer.jumpButton"]),
  compatible("server.RuntimePlayer.action0Button", ["server.GamePlayerEntity.action0Button"], ["server.GamePlayer.action0Button"]),
  compatible("server.RuntimePlayer.action1Button", ["server.GamePlayerEntity.action1Button"], ["server.GamePlayer.action1Button"]),
  inputPermission("server.RuntimePlayer.enableAction0", "server.GamePlayerEntity.enableAction0", "server.GamePlayer.enableAction0"),
  inputPermission("server.RuntimePlayer.enableAction1", "server.GamePlayerEntity.enableAction1", "server.GamePlayer.enableAction1"),
  inputPermission("server.RuntimePlayer.enableJump", "server.GamePlayerEntity.enableJump", "server.GamePlayer.enableJump"),
  inputPermission("server.RuntimePlayer.enableDoubleJump", "server.GamePlayerEntity.enableDoubleJump", "server.GamePlayer.enableDoubleJump"),
  originPartial("server.RuntimePlayer.enableCrouch", ["server.GamePlayer.enableCrouch"], { access: [], signature: [], effect: ["The server input bridge applies the recovered crouch mask, but authoritative Player Public flags are not yet written back to the client."] }),
  partial("server.RuntimePlayer.color", ["server.GamePlayerEntity.color"], {
    access: [],
    signature: [],
    effect: ["The local Script Runtime value and mutation API are present; authoritative client rendering propagation remains unverified."],
  }, ["server.GamePlayer.color"]),
  partial("server.RuntimePlayer.spawnPoint", ["server.GamePlayerEntity.spawnPoint"], {
    access: [],
    signature: ["Canonical spawnPoint uses GameVector3; the local value uses the compatible Vector3 implementation."],
    effect: ["The value drives local forceRespawn; native validation and automatic engine respawn integration remain unverified."],
  }, ["server.GamePlayer.spawnPoint"]),
  partial("server.RuntimePlayer.onRespawn", ["server.GamePlayerEntity.onRespawn"], {
    access: [],
    signature: ["The local listener token is structurally compatible, while the complete native event scheduling contract is not recovered."],
    effect: ["Local forceRespawn emits the recovered GameEntityEvent shape; automatic engine respawn triggers remain unverified."],
  }, ["server.GamePlayer.onRespawn"]),
  originPartial("server.RuntimePlayer.nextRespawn", ["server.GamePlayer.nextRespawn"], {
    access: [],
    signature: ["The historical optional filter remains unimplemented."],
    effect: ["Automatic engine respawn triggers remain unverified."],
  }),
  partial("server.RuntimePlayer.onClick", ["server.GameEntity.onClick"], {
    access: [],
    signature: ["The recovered GameClickEvent fields are exposed; the historical optional listener filter remains unimplemented."],
    effect: ["A clicked player receives the same event object after world.onClick when its backend entity id is authoritative."],
  }),
  originPartial("server.RuntimePlayer.nextClick", ["server.GameEntity.nextClick"], {
    access: [],
    signature: ["The historical optional filter remains unimplemented."],
    effect: ["Resolution depends on an authoritative backend player id."],
  }),
  partial("server.RuntimePlayer.onPress", ["server.GamePlayerEntity.onPress"], {
    access: [],
    signature: ["The recovered GameInputEvent fields and GameButtonType values are exposed."],
    effect: ["The game-net bridge dispatches real Player input events after applying the recovered PlayerFlags mask; complete client-side Public flag propagation remains separate."],
  }, ["server.GamePlayer.onPress"]),
  originPartial("server.RuntimePlayer.nextPress", ["server.GamePlayer.nextPress"], {
    access: [],
    signature: ["The historical optional filter remains unimplemented."],
    effect: ["The recovered PlayerFlags mask is applied; the historical optional filter remains the only known gap."],
  }),
  partial("server.RuntimePlayer.onRelease", ["server.GamePlayerEntity.onRelease"], {
    access: [],
    signature: ["The recovered GameInputEvent fields and GameButtonType values are exposed."],
    effect: ["The game-net bridge dispatches real Player input events after applying the recovered PlayerFlags mask; complete client-side Public flag propagation remains separate."],
  }, ["server.GamePlayer.onRelease"]),
  originPartial("server.RuntimePlayer.nextRelease", ["server.GamePlayer.nextRelease"], {
    access: [],
    signature: ["The historical optional filter remains unimplemented."],
    effect: ["The recovered PlayerFlags mask is applied; the historical optional filter remains the only known gap."],
  }),
  partial("server.RuntimePlayer.onTakeDamage", ["server.GameEntity.onTakeDamage"], {
    access: [],
    signature: ["The local listener token and recovered GameDamageEvent fields are present."],
    effect: ["Existing local damage() calls dispatch entity and world events; native hurt producers, damage enablement, attacker propagation, and death scheduling remain unverified."],
  }),
  originPartial("server.RuntimePlayer.nextTakeDamage", ["server.GameEntity.nextTakeDamage"], {
    access: [],
    signature: ["The historical optional filter remains unimplemented."],
    effect: ["Only locally produced damage() events are currently dispatched."],
  }),
  partial("server.RuntimePlayer.forceRespawn", ["server.GamePlayerEntity.forceRespawn"], {
    access: [],
    signature: [],
    effect: ["Position, velocity, contacts, triggers, backend state, and respawn events are updated; native death-state side effects remain unverified."],
  }, ["server.GamePlayer.forceRespawn"]),
  extension("server.RuntimePlayer.grounded", "Grounded is a local derived physics state and has no direct documented GameEntity or GamePlayerEntity member."),
  partial("server.RuntimePlayer.health", ["server.GameEntity.hp"], {
    access: ["Local health is getter-only, while canonical GameEntity.hp is writable."],
    signature: ["The local member is named health rather than hp."],
    effect: ["Local health and damage-event dispatch exist, but maxHp, enableDamage, native hurt producers, and death state remain unimplemented."],
  }),
  extension("server.RuntimePlayer.applyImpulse", "No direct documented GameEntity or GamePlayerEntity applyImpulse member exists; this is a compatibility physics helper."),
  extension("server.RuntimePlayer.damage", "The local helper mutates health and dispatches the recovered default GameDamageEvent shape, but it is not the native GameEntity.hurt API and does not implement attacker/type input, enableDamage, death, or respawn semantics."),
  partial("server.RuntimePlayer.sendMessage", ["server.GamePlayerEntity.directMessage"], {
    access: [],
    signature: ["Canonical directMessage accepts a string; local sendMessage accepts an unknown value and formats it for logging."],
    effect: ["Local behavior records/logs a message; historical direct player delivery is not proven."],
  }, ["server.GamePlayer.directMessage"]),
  extension("server.RuntimePlayer.snapshot", "snapshot is a local diagnostics and synchronization helper with no documented canonical member."),
];

const members = memberSpecs.map(buildMember);
const localMemberIds = localAnalysis.entries
  .filter(entry => entry.owner === "RuntimePlayer")
  .map(entry => entry.id)
  .sort();
const mappedMemberIds = members.map(entry => entry.local.id).sort();
if (JSON.stringify(localMemberIds) !== JSON.stringify(mappedMemberIds)) {
  throw new Error(`RuntimePlayer adapter map is incomplete: local=${localMemberIds.join(",")} mapped=${mappedMemberIds.join(",")}`);
}

const output = {
  format: "nea-runtime-player-adapter-map",
  version: 1,
  generatedAt: new Date().toISOString(),
  contract: localAnalysis.contract,
  localObject: {
    id: "server.object.RuntimePlayer",
    status: "extension",
    composition: ["server.GameEntity", "server.GamePlayerEntity"],
    notes: [
      "RuntimePlayer is a local composite wrapper, not a direct implementation of either canonical object.",
      "Canonical mappings are member-level and partial unless conformance proves exact access, signature, and effects.",
    ],
  },
  members,
  events: [{
    localFactory: "createGameEntityEvent",
    canonicalObject: "server.GameEntityEvent",
    status: "partial",
    canonicalFields: ["tick", "entity"],
    localAliases: [{ name: "player", target: "entity" }],
    gaps: ["The entity value is a RuntimePlayer composite subset, not a complete GameEntity/GamePlayerEntity object."],
    evidence: [{ type: "local-source", path: runtimeSourcePath, symbol: "createGameEntityEvent", confidence: "direct" }],
  }, {
    localFactory: "createGameDamageEvent",
    canonicalObject: "server.GameDamageEvent",
    status: "partial",
    canonicalFields: ["tick", "entity", "attacker", "damage", "damageType"],
    localAliases: [],
    gaps: ["Fields and historical null/empty defaults are recovered, but only local damage() currently produces the event."],
    evidence: [{ type: "local-source", path: runtimeSourcePath, symbol: "createGameDamageEvent", confidence: "direct" }],
  }],
  summary: {
    memberCount: members.length,
    compatible: members.filter(entry => entry.status === "compatible").length,
    partial: members.filter(entry => entry.status === "partial").length,
    extensions: members.filter(entry => entry.status === "extension").length,
  },
};

const outputPath = resolve(root, "abi", "runtime-player-adapter-map.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`RuntimePlayer adapter map: ${output.summary.partial} partial, ${output.summary.extensions} extensions.`);

function compatible(localId, canonicalIds, supportingOriginIds = canonicalIds) {
  return { localId, canonicalIds, supportingOriginIds, status: "compatible", gaps: { access: [], signature: [], effect: [] } };
}

function inputPermission(localId, canonicalId, originId) {
  return partial(localId, [canonicalId], { access: [], signature: [], effect: ["The server input bridge applies the recovered flag mask, but authoritative Player Public flags are not yet written back to the client."] }, [originId]);
}

function partial(localId, canonicalIds, gaps, supportingOriginIds = canonicalIds) {
  return { localId, canonicalIds, supportingOriginIds, status: "partial", gaps };
}

function originPartial(localId, supportingOriginIds, gaps) {
  return { localId, canonicalIds: [], supportingOriginIds, status: "partial", gaps };
}

function extension(localId, reason) {
  return { localId, canonicalIds: [], supportingOriginIds: [], status: "extension", gaps: { access: [], signature: [], effect: [reason] } };
}

function buildMember(spec) {
  const local = requireEntry(localEntries, spec.localId, "local runtime");
  const canonicalTargets = spec.canonicalIds.map(id => requireEntry(docsEntries, id, "documentation"));
  const originSupport = spec.supportingOriginIds.map(id => requireEntry(originEntries, id, "origin"));
  return {
    local: {
      id: local.id,
      kind: local.kind,
      signature: local.signature,
      capability: local.capability,
    },
    canonicalTargets: canonicalTargets.map(entry => ({ id: entry.id, kind: entry.kind, signature: entry.signature })),
    status: spec.status,
    implements: spec.status === "compatible" ? spec.canonicalIds : [],
    gaps: spec.gaps,
    evidence: uniqueEvidence([...(local.evidence ?? []), ...canonicalTargets.flatMap(entry => entry.evidence ?? []), ...originSupport.flatMap(entry => entry.evidence ?? [])]),
  };
}

function requireEntry(entries, id, source) {
  const entry = entries.get(id);
  if (!entry) throw new Error(`${id} missing from ${source} catalog`);
  return entry;
}

function uniqueEvidence(evidence) {
  const seen = new Set();
  return evidence.filter(item => {
    const key = `${item.type}:${item.path}:${item.symbol}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}
