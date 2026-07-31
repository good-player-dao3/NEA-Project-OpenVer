import assert from "node:assert/strict";
import test from "node:test";
import { loadPreservedBlockCatalog } from "../../../Backend/local-player/src/block-info.mjs";

test("block catalog loader rejects manifest path traversal", async () => {
  await assert.rejects(
    loadPreservedBlockCatalog("C:/safe/archive", "../outside.json"),
    /archive-relative JSON path/,
  );
  await assert.rejects(
    loadPreservedBlockCatalog("C:/safe/archive", "nested\\world.json"),
    /archive-relative JSON path/,
  );
});

test("block catalog loader rejects absolute manifest paths", async () => {
  await assert.rejects(
    loadPreservedBlockCatalog("C:/safe/archive", "/outside.json"),
    /archive-relative JSON path/,
  );
});
