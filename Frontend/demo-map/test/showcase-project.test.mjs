import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { loadMapSource } from "../src/format.mjs";
import { importMapProject } from "../src/import-project.mjs";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const showcaseRoot = join(packageRoot, "..", "showcase");

test("showcase source declares the large map and honest capability bands", async () => {
  const source = await loadMapSource(showcaseRoot);
  assert.deepEqual(source.manifest.world.shape, [256, 64, 256]);
  assert.equal(source.manifest.runtime.groupId, "showcase-local");
  assert.ok(source.manifest.scripts.serverCapabilities.includes("server.http"));
  assert.ok(source.manifest.scripts.clientCapabilities.includes("client.ui"));
  assert.equal(source.entities.length, 5);
  assert.equal(source.physics.formatVersion, "nea-physics/v1");
});

test("showcase imports through the same transactional package path", async t => {
  const outputRoot = join(tmpdir(), `nea-showcase-test-${process.pid}`);
  t.after(async () => {
    const { rm } = await import("node:fs/promises");
    await rm(outputRoot, { recursive: true, force: true });
  });
  const result = await importMapProject(showcaseRoot, outputRoot);
  assert.equal(result.manifest.display.name, "NEA Capability Showcase");
  assert.equal(result.manifest.world.shape[0], 256);
  const serverScript = await readFile(join(outputRoot, "scripts", "server.js"), "utf8");
  assert.match(serverScript, /showcase:set-physics/);
  assert.match(serverScript, /evidence-deferred/);
  assert.match(serverScript, /world\.onClick/);
  assert.match(serverScript, /lab\.onClick/);
  assert.match(serverScript, /world\.addZone/);
  assert.match(serverScript, /coreZone\.onEnter/);
  assert.match(serverScript, /coreZone\.onLeave/);
  assert.match(serverScript, /world\.onPress/);
  assert.match(serverScript, /world\.onRelease/);
  assert.match(serverScript, /world\.onFluidEnter/);
  assert.match(serverScript, /world\.onFluidLeave/);
  assert.match(serverScript, /buoyancy: \"evidence-deferred\"/);
});
