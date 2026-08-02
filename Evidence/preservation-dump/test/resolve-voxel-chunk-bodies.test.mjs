import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { resolveVoxelChunkBodies } from "../resolve-voxel-chunk-bodies.mjs";
import { readCapturedVoxelChunkBodies } from "../resolve-voxel-chunk-bodies.mjs";

test("resolves terminal-path binary responses for opaque voxel chunk entries", async () => {
  const root = await mkdtemp(join(tmpdir(), "nea-voxel-resolver-"));
  try {
    await mkdir(join(root, "bodies"));
    await writeFile(join(root, "bodies", "chunk.bin"), Buffer.from([0, 1, 2]));
    const result = await resolveVoxelChunkBodies({
      entries: ["chunk_alpha"],
      bodyRoot: join(root, "bodies"),
      responseRows: [
        { url: "https://example.invalid/resource/chunk_alpha", status: 200, mimeType: "application/octet-stream", file: "chunk.bin", bytes: 3 },
        { url: "https://example.invalid/resource/chunk_alpha", status: 200, mimeType: "application/octet-stream", file: "chunk.bin", bytes: 3 },
      ],
    });
    assert.deepEqual([...result.keys()], ["chunk_alpha"]);
    assert.deepEqual([...result.values()][0], Buffer.from([0, 1, 2]));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects missing, conflicting, non-binary, and escaping chunk responses", async () => {
  const root = await mkdtemp(join(tmpdir(), "nea-voxel-resolver-"));
  try {
    await mkdir(join(root, "bodies"));
    await writeFile(join(root, "bodies", "chunk.bin"), Buffer.from([0]));
    const input = { entries: ["chunk_alpha"], bodyRoot: join(root, "bodies") };
    await assert.rejects(resolveVoxelChunkBodies({ ...input, responseRows: [] }), /no captured response/);
    await assert.rejects(resolveVoxelChunkBodies({ ...input, responseRows: [
      { url: "https://example.invalid/chunk_alpha", status: 200, mimeType: "application/octet-stream", file: "chunk.bin", bytes: 1 },
      { url: "https://example.invalid/chunk_alpha", status: 200, mimeType: "application/octet-stream", file: "other.bin", bytes: 1 },
    ] }), /conflicting/);
    await assert.rejects(resolveVoxelChunkBodies({ ...input, responseRows: [
      { url: "https://example.invalid/chunk_alpha", status: 200, mimeType: "application/json", file: "chunk.bin", bytes: 1 },
    ] }), /not binary/);
    await assert.rejects(resolveVoxelChunkBodies({ ...input, responseRows: [
      { url: "https://example.invalid/chunk_alpha", status: 200, mimeType: "application/octet-stream", file: "../outside.bin", bytes: 1 },
    ] }), /escapes/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("resolves capture index files relative to the capture root", async () => {
  const root = await mkdtemp(join(tmpdir(), "nea-voxel-capture-resolver-"));
  try {
    await mkdir(join(root, "network"), { recursive: true });
    await mkdir(join(root, "response-bodies"), { recursive: true });
    await writeFile(join(root, "response-bodies", "chunk.bin"), Buffer.from([7, 8]));
    await writeFile(join(root, "network", "response-bodies.jsonl"), `${JSON.stringify({
      url: "https://example.invalid/asset/chunk_alpha",
      status: 200,
      mimeType: "application/octet-stream",
      file: "response-bodies/chunk.bin",
      bytes: 2,
    })}\n`);
    const result = await readCapturedVoxelChunkBodies(root, ["chunk_alpha"]);
    assert.deepEqual([...result.values()][0], Buffer.from([7, 8]));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
