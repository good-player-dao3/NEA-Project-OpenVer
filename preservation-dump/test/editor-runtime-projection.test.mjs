import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { buildEditorRuntimeProjection } from "../editor-runtime-projection.mjs";

test("builds evidence-backed mesh entries and projection mappings without inventing missing assets", () => {
  const entities = [
    { kind: "entity", position: [1, 2, 3], tags: ["id-101", "shop"] },
    { kind: "entity", position: [4, 5, 6], tags: ["id-102"] },
    { kind: "entity", position: [7, 8, 9], tags: ["id-103"] },
  ];
  const nodes = [
    { id: "101", value: { mesh: "mesh/shop.vb", bounds: [2, 3, 4], position: [1, 2, 3], collision: true, fixed: true, gravity: false, mass: 2, friction: 0.5, restitution: 0.1, orientation: [0, -1.00390625, 0, 0], scale: [0.5, 0.5, 0.5], tint: [1, 0.5, 0.25, 1], emissive: 0, shininess: 0.2, metalness: 0.1, staticShadow: true } },
    { id: "102", value: { mesh: "mesh/shop.vb", bounds: [2, 3, 4], position: [4, 5, 6] } },
    { id: "103", value: { mesh: "mesh/missing.vb", bounds: [1, 1, 1], position: [7, 8, 9] } },
  ];
  const result = buildEditorRuntimeProjection({
    packageId: "captured-fixture",
    entities,
    entityNodes: nodes,
    meshAssets: { "mesh/shop.vb": { hash: "A".repeat(43) } },
    modelMetadataByHash: new Map([["A".repeat(43), { bounds: [2, 3, 4], renderBoxOffset: [0, 1.5, 0.25] }]]),
    bootstrapMeshHashes: [{ hash: "B".repeat(43), hashType: "", meshBX: 1, meshBY: 1, meshBZ: 1, bodyBX: 1, bodyBY: 1, bodyBZ: 1, bodyOffsetX: 0, bodyOffsetY: 0, bodyOffsetZ: 0, renderBoxOffsetX: 0, renderBoxOffsetY: 0, renderBoxOffsetZ: 0 }],
  });
  assert.equal(result.meshHashes.length, 2);
  assert.deepEqual(result.meshHashes[1], { bodyBX: 2, bodyBY: 3, bodyBZ: 4, bodyOffsetX: 0, bodyOffsetY: 0, bodyOffsetZ: 0, meshBX: 2, meshBY: 3, meshBZ: 4, renderBoxOffsetX: 0, renderBoxOffsetY: 1.5, renderBoxOffsetZ: 0.25, hash: "A".repeat(43), hashType: "" });
  assert.equal(result.descriptor.entities.length, 2);
  assert.equal(result.descriptor.entities[0].mesh.bootstrapMeshIndex, 1);
  assert.deepEqual(result.descriptor.entities[0].body.orientation, [0, -1, 0, 0]);
  assert.equal(result.descriptor.entities[1].mesh.bootstrapMeshIndex, 1);
  assert.equal(result.descriptor.entities[0].sourceFingerprint, createHash("sha256").update(JSON.stringify({ kind: "entity", position: [1, 2, 3], tags: ["id-101", "shop"] })).digest("hex"));
  assert.deepEqual(result.diagnostics, [{ entityIndex: 2, sourceId: "103", mesh: "mesh/missing.vb", reason: "captured-model-metadata-unavailable" }]);
});

test("rejects captured metadata whose bounds disagree with the project node", () => {
  assert.throws(() => buildEditorRuntimeProjection({
    packageId: "fixture",
    entities: [{ kind: "entity", position: [0, 0, 0], tags: ["id-1"] }],
    entityNodes: [{ id: "1", value: { mesh: "mesh/a.vb", bounds: [1, 2, 3] } }],
    meshAssets: { "mesh/a.vb": { hash: "A".repeat(43) } },
    modelMetadataByHash: new Map([["A".repeat(43), { bounds: [1, 2, 4] }]]),
    bootstrapMeshHashes: [],
  }), /bounds do not match/);
});
