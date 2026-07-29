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
  extension("server.RuntimePlayer.grounded", "Grounded is a local derived physics state and has no direct documented GameEntity or GamePlayerEntity member."),
  partial("server.RuntimePlayer.health", ["server.GameEntity.hp"], {
    access: ["Local health is getter-only, while canonical GameEntity.hp is writable."],
    signature: ["The local member is named health rather than hp."],
    effect: ["Local health does not implement maxHp, enableDamage, death state, or damage events."],
  }),
  extension("server.RuntimePlayer.applyImpulse", "No direct documented GameEntity or GamePlayerEntity applyImpulse member exists; this is a compatibility physics helper."),
  extension("server.RuntimePlayer.damage", "The local helper mutates health but does not reproduce GameEntity.hurt, GameDamageEvent, damage source/type, enableDamage, death, or respawn semantics."),
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

function partial(localId, canonicalIds, gaps, supportingOriginIds = canonicalIds) {
  return { localId, canonicalIds, supportingOriginIds, status: "partial", gaps };
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
