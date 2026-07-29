import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(root, "..");
const sourcePath = "demo-map/src/runtime/vector3.mjs";
const originPath = "origin/origin/origin/api/GameVector3.js";
const playerMathPath = "local-player/archive/project/bedwars/client-runtime/assets/_next/static/chunks/457.36bf26873ad51e54.js";
const source = await readFile(resolve(repositoryRoot, sourcePath), "utf8");
const originSource = await readFile(resolve(repositoryRoot, originPath), "utf8");
const playerMathSource = await readFile(resolve(repositoryRoot, playerMathPath), "utf8");
const docs = JSON.parse(await readFile(resolve(root, "generated", "docs-api-index.json"), "utf8"));

for (const marker of ["static fromPolar", "sub(value)", "mul(value)", "div(value)", "addEq(value)", "divEq(value)", "dot(value)", "cross(value)", "lerp(value, factor)", "normalize()", "angle(value)", "exactEquals(value)", "equals(value)", "export const GameVector3 = Vector3"]) {
  if (!source.includes(marker)) throw new Error(`Local shared Vector3 implementation missing ${marker}`);
}
for (const marker of ["static fromPolar(mag, phi, theta)", "divEq(v)", "towards(v)", "return `{ x:${this.x}, y:${this.y}, z:${this.z} }`;"]) {
  if (!originSource.includes(marker)) throw new Error(`Origin GameVector3 evidence missing ${marker}`);
}
if (!playerMathSource.includes('EPSILON:function(){return e}') || !playerMathSource.includes('var e=1e-6')) {
  throw new Error("Archived Player math epsilon evidence missing");
}

const documented = docs.entries.filter(entry => entry.owner === "GameVector3");
if (documented.length !== 31) throw new Error(`Expected 31 documented GameVector3 entries, found ${documented.length}`);
const evidence = [
  { type: "local-source", path: sourcePath, symbol: "Vector3 / GameVector3 compatibility implementation", confidence: "direct" },
  { type: "origin-source", path: originPath, symbol: "GameVector3", confidence: "direct" },
];
const entries = documented.map(entry => ({
  ...structuredClone(entry),
  kind: entry.id === "shared.GameVector3.GameVector3" ? "constructor" : entry.kind,
  availability: entry.id === "shared.GameVector3.equals" ? "partial" : "confirmed",
  compatibility: "emulated",
  capability: "shared.math",
  since: "0.1.0",
  notes: [
    ...(entry.notes ?? []),
    entry.id === "shared.GameVector3.equals"
      ? "The origin formula is confirmed, but the EPSILON$2 binding was not present in the extracted origin class; the local 1e-6 tolerance is supported indirectly by the archived Player math bundle."
      : "Implemented from the documented signature and recovered origin GameVector3 formula.",
  ],
  evidence: [...(entry.evidence ?? []), ...evidence, ...(entry.id === "shared.GameVector3.equals" ? [{ type: "player-bundle", path: playerMathPath, symbol: "module 48388 EPSILON = 1e-6", confidence: "supporting" }] : [])],
}));

entries.push(
  extension("shared.object.Vector3", "object", "Vector3", { declaration: "class" }),
  extension("shared.Vector3.from", "method", "from", { parameters: [{ name: "value", type: "Vector3Like" }], returns: "Vector3", static: true }),
  extension("shared.Vector3.subtract", "method", "subtract", { parameters: [{ name: "value", type: "Vector3Like" }], returns: "Vector3" }),
  extension("shared.Vector3.toArray", "method", "toArray", { parameters: [], returns: "number[3]" }),
);

const analysis = {
  format: "nea-local-shared-runtime-analysis",
  version: 1,
  generatedAt: new Date().toISOString(),
  source: { path: sourcePath, bytes: Buffer.byteLength(source), sha256: createHash("sha256").update(source).digest("hex") },
  entries,
  summary: {
    canonicalEntries: documented.length,
    confirmedCanonical: entries.filter(entry => entry.id.startsWith("shared.GameVector3.") && entry.availability === "confirmed").length,
    partialCanonical: entries.filter(entry => entry.id.startsWith("shared.GameVector3.") && entry.availability === "partial").length,
    localExtensions: entries.filter(entry => entry.owner === "Vector3" || entry.id === "shared.object.Vector3").length,
  },
};

const outputPath = resolve(root, "generated", "local-shared-runtime-analysis.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(analysis, null, 2)}\n`);
console.log(`Analyzed local shared Runtime; ${analysis.summary.confirmedCanonical} confirmed and ${analysis.summary.partialCanonical} partial GameVector3 entries.`);

function extension(id, kind, name, signature) {
  return {
    id,
    side: "shared",
    kind,
    owner: kind === "object" ? null : "Vector3",
    name,
    signature,
    availability: "confirmed",
    compatibility: "emulated",
    capability: "shared.math",
    since: "0.1.0",
    notes: ["Local Vector3 compatibility extension; not a documented GameVector3 identifier."],
    evidence: [evidence[0]],
  };
}
