import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { loadPreservedBlockCatalogMetadata } from "../../../Backend/local-player/src/block-info.mjs";
import { convertRecoveredVoxelChunks } from "../../../Middleware/runtime-compat/src/recovered-terrain-converter.mjs";

const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));
const sourceArchive = join(repositoryRoot, "Backend", "local-player", "archive");
const backendPath = join(repositoryRoot, "Backend", "local-player", "backend", "box3-server.cjs");

test("Native Player loads a public recovered chunk conversion through a project package", { timeout: 30_000 }, async () => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), "nea-native-terrain-"));
  const archiveRoot = join(fixtureRoot, "archive");
  const projectRoot = join(fixtureRoot, "project");
  const port = await freePort();
  let child;
  let output = "";
  try {
    const metadata = await loadPreservedBlockCatalogMetadata(sourceArchive, "world-bedwars.json");
    const block = metadata.catalog.find(entry => entry.id !== 0);
    assert.ok(block, "preserved block catalog must include a non-air block");
    const terrain = convertPublicFixtureTerrain(block.id);
    await cp(sourceArchive, archiveRoot, { recursive: true });
    await writeTerrainProjectFixture({ archiveRoot, projectRoot, terrain });
    child = spawn(process.execPath, [backendPath], {
      env: {
        ...process.env,
        BOX3_PORT: String(port),
        BOX3_ASSET_ROOT: archiveRoot,
        BOX3_PROJECT_ROOT: projectRoot,
        BOX3_PROJECT_BLOCK_INFO: metadata.contentAddress,
        BOX3_CLIENT_RUNTIME_MANIFEST: "project/terrain-fixture/client-runtime/manifest.json",
        BOX3_PLAYER_BODY_PROFILE: JSON.stringify(playerBodyProfile()),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", chunk => { output += chunk; });
    child.stderr.on("data", chunk => { output += chunk; });
    const status = await waitForStatus(port);
    assert.equal(status.world, "project-package-v1");
    assert.equal(status.localClient.pagePath, "/p/terrain-fixture");
  } catch (error) {
    error.message += `\n${output.slice(-4000)}`;
    throw error;
  } finally {
    if (child) stopProcessTree(child);
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

async function writeTerrainProjectFixture({ archiveRoot, projectRoot, terrain }) {
  await mkdir(join(projectRoot, "world"), { recursive: true });
  await mkdir(join(projectRoot, "assets"), { recursive: true });
  await mkdir(join(projectRoot, "scripts"), { recursive: true });
  await writeJson(join(projectRoot, "dao3.project.json"), {
    formatVersion: "dao3-project/v1",
    packageId: "terrain-fixture",
    display: { name: "Terrain fixture" },
    engine: { runtimeApiVersion: "0.1.0", tickRate: 20 },
    world: "world/world.json",
    assets: "assets/index.json",
    scripts: "scripts/manifest.json",
  });
  await writeJson(join(projectRoot, "world", "world.json"), {
    shape: [32, 32, 32],
    spawn: [1, 2, 1],
    entities: "world/entities.json",
    terrain: "world/terrain.json",
  });
  await writeJson(join(projectRoot, "world", "entities.json"), { entities: [] });
  await writeJson(join(projectRoot, "world", "terrain.json"), terrain);
  await writeJson(join(projectRoot, "assets", "index.json"), { assets: [] });
  await writeJson(join(projectRoot, "scripts", "manifest.json"), { entry: null, modules: [], capabilities: [] });
  await writeClientRuntimeFixture(archiveRoot);
}

function convertPublicFixtureTerrain(blockId) {
  return convertRecoveredVoxelChunks({
    voxels: { shape: { x: 32, y: 32, z: 32 }, chunks: ["public-fixture-slot"] },
    chunkBodies: [encodeVoxelChunk([blockId | (3 << 14)], [[1, 0, 1, 1, 1, 1, 0]])],
    orderProof: {
      format: "nea-voxel-chunk-order-proof",
      version: 1,
      status: "confirmed-observed",
      descriptorToResetHashes: "confirmed-observed",
      chunkSize: 32,
      linearIndex: "x + nx * (y + ny * z)",
      chunkShape: { x: 1, y: 1, z: 1 },
      slotCount: 1,
    },
    maxVoxels: 1,
  });
}

function encodeVoxelChunk(palette, boxes) {
  const bytes = [varint(palette.length), varint(boxes.length), ...palette.map(varint)];
  for (const [minX, minY, minZ, sizeX, sizeY, sizeZ, paletteIndex] of boxes) {
    bytes.push(varint(interleave3(zigzag(minX)) | (interleave3(zigzag(minY)) << 1) | (interleave3(zigzag(minZ)) << 2)));
    bytes.push(varint(interleave3(sizeX) | (interleave3(sizeY) << 1) | (interleave3(sizeZ) << 2)));
    bytes.push(varint(paletteIndex));
  }
  return Uint8Array.from(bytes.flat());
}

function varint(value) {
  const bytes = [];
  do {
    const byte = value & 127;
    value >>>= 7;
    bytes.push(byte | (value ? 128 : 0));
  } while (value);
  return bytes;
}

function zigzag(value) {
  return value < 0 ? (-value * 2) - 1 : value * 2;
}

function interleave3(value) {
  let result = 0;
  for (let bit = 0; bit < 10; bit += 1) result |= ((value >>> bit) & 1) << (bit * 3);
  return result;
}

async function writeClientRuntimeFixture(archiveRoot) {
  const runtimeRoot = join(archiveRoot, "project", "terrain-fixture", "client-runtime");
  const assetsRoot = join(runtimeRoot, "assets");
  const files = [
    { path: "/_next/static/fixture.js", contentType: "application/javascript", bytes: Buffer.from("console.log('terrain fixture');") },
    { path: "/_next/static/fixture.css", contentType: "text/css", bytes: Buffer.from("body{margin:0}") },
  ];
  await mkdir(join(assetsRoot, "_next", "static"), { recursive: true });
  await Promise.all(files.map(file => writeFile(join(runtimeRoot, `assets${file.path}`), file.bytes)));
  await writeJson(join(runtimeRoot, "manifest.json"), {
    format: "nea-recovered-client-runtime",
    version: 1,
    buildId: "terrain-fixture",
    pagePath: "/p/terrain-fixture",
    gameName: "terrain-fixture",
    contentId: "1",
    initialScripts: ["/_next/static/fixture.js"],
    initialStyles: ["/_next/static/fixture.css"],
    files: files.map(file => ({
      path: file.path,
      file: `assets${file.path}`,
      bytes: file.bytes.byteLength,
      sha256: createHash("sha256").update(file.bytes).digest("hex"),
      contentType: file.contentType,
    })),
  });
}

function playerBodyProfile() {
  return {
    profileId: "terrain-fixture-body",
    origin: "body-center",
    sizeStatus: "confirmed",
    boundsHalfExtents: [0.45, 1.1, 0.45],
    shapeHalfExtents: [0.45, 1.1, 0.45],
  };
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value)}\n`);
}

async function waitForStatus(port) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/status`);
      if (response.ok) return response.json();
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error("Native Player terrain fixture did not become ready");
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

function stopProcessTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") {
    try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
    return;
  }
  child.kill("SIGTERM");
}
