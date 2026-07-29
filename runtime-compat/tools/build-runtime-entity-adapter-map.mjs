import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const local = await readJson("generated/local-server-runtime-analysis.json");
const docs = await readJson("generated/docs-api-index.json");
const localEntries = new Map(local.entries.map(entry => [entry.id, entry]));
const docsEntries = new Map(docs.entries.map(entry => [entry.id, entry]));
const specs = [
  partial("server.RuntimeEntity.id", "server.GameEntity.id", {
    access: ["Local RuntimeEntity.id is getter-only so the host entity index cannot diverge; canonical GameEntity.id is documented writable."],
    signature: [],
    effect: ["Local identity has no historical entity lifecycle or replication binding."],
  }),
  extension("server.RuntimeEntity.kind", "kind is a local importer classification and has no canonical GameEntity member."),
  partial("server.RuntimeEntity.position", "server.GameEntity.position", {
    access: [],
    signature: ["Canonical position uses GameVector3; local RuntimeEntity exposes the smaller Vector3 compatibility type."],
    effect: ["Local writes update only the compatibility wrapper and are not yet connected to authoritative entity replication."],
  }),
  partial("server.RuntimeEntity.tags", "server.GameEntity.tags", {
    access: ["Canonical tags is a method returning string[]; local tags is a readonly Set<string> property whose contents remain mutable."],
    signature: ["Property/method shape and collection type differ."],
    effect: ["Canonical addTag/removeTag/hasTag behavior and replication are not implemented."],
  }),
  extension("server.RuntimeEntity.snapshot", "snapshot is a local diagnostics helper with no documented canonical member."),
];

const members = specs.map(spec => {
  const localEntry = requireEntry(localEntries, spec.localId, "local runtime");
  const canonical = spec.canonicalId ? requireEntry(docsEntries, spec.canonicalId, "documentation") : null;
  return {
    local: { id: localEntry.id, kind: localEntry.kind, signature: localEntry.signature, capability: localEntry.capability },
    canonicalTargets: canonical ? [{ id: canonical.id, kind: canonical.kind, signature: canonical.signature }] : [],
    status: spec.status,
    implements: [],
    gaps: spec.gaps,
    evidence: [...(localEntry.evidence ?? []), ...(canonical?.evidence ?? [])],
  };
});

const localIds = local.entries.filter(entry => entry.owner === "RuntimeEntity").map(entry => entry.id).sort();
const mappedIds = members.map(entry => entry.local.id).sort();
if (JSON.stringify(localIds) !== JSON.stringify(mappedIds)) throw new Error("RuntimeEntity adapter map does not cover every local member");

const output = {
  format: "nea-runtime-entity-adapter-map",
  version: 1,
  generatedAt: new Date().toISOString(),
  contract: local.contract,
  localObject: {
    id: "server.object.RuntimeEntity",
    status: "extension",
    canonicalTarget: "server.object.GameEntity",
    notes: ["RuntimeEntity is a small local subset and does not implement the canonical GameEntity lifecycle, physics, events, animation, damage, audio, or replication surface."],
  },
  members,
  summary: {
    memberCount: members.length,
    partial: members.filter(entry => entry.status === "partial").length,
    extensions: members.filter(entry => entry.status === "extension").length,
  },
};

const outputPath = resolve(root, "abi", "runtime-entity-adapter-map.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`RuntimeEntity adapter map: ${output.summary.partial} partial, ${output.summary.extensions} extensions.`);

function partial(localId, canonicalId, gaps) {
  return { localId, canonicalId, status: "partial", gaps };
}

function extension(localId, reason) {
  return { localId, canonicalId: null, status: "extension", gaps: { access: [], signature: [], effect: [reason] } };
}

function requireEntry(entries, id, source) {
  const entry = entries.get(id);
  if (!entry) throw new Error(`${id} missing from ${source} catalog`);
  return entry;
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}
