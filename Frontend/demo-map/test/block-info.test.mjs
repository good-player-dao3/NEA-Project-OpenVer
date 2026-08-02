import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";
import { loadPreservedBlockCatalog, loadPreservedBlockCatalogMetadata } from "../../../Backend/local-player/src/block-info.mjs";

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

test("block catalog metadata loader preserves the same path boundary", async () => {
  await assert.rejects(
    loadPreservedBlockCatalogMetadata("C:/safe/archive", "../outside.json"),
    /archive-relative JSON path/,
  );
  await assert.rejects(
    loadPreservedBlockCatalog("C:/safe/archive", "C:/outside.json"),
    /archive-relative JSON path/,
  );
});

test("block catalog metadata preserves explicit world terrain options", async () => {
  const metadata = await loadPreservedBlockCatalogMetadata(resolve(process.cwd(), "Backend", "local-player", "archive"), "world-bedwars.json");
  assert.equal(metadata.resetCounter, 0);
  assert.equal(metadata.innerAO, true);
});
