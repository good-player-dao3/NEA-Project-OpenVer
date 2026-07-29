import { copyFile, mkdir, open, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { createHash } from "node:crypto";
import { expandTerrain, loadMapSource, RUNTIME_API_VERSION } from "./format.mjs";

export async function importMapProject(sourceRoot, outputRoot) {
  const source = await loadMapSource(sourceRoot);
  const destination = resolve(outputRoot);
  const terrain = expandTerrain(source.terrain);
  const files = {
    manifest: join(destination, "dao3.project.json"),
    world: join(destination, "world", "world.json"),
    terrain: join(destination, "world", "terrain.json"),
    entities: join(destination, "world", "entities.json"),
    physics: join(destination, "world", "physics.json"),
    assets: join(destination, "assets", "index.json"),
    scripts: join(destination, "scripts", "manifest.json"),
    serverScript: join(destination, "scripts", "server.js"),
  };
  await Promise.all([mkdir(join(destination, "world"), { recursive: true }), mkdir(join(destination, "assets"), { recursive: true }), mkdir(join(destination, "scripts"), { recursive: true })]);

  await writeJson(files.manifest, {
    formatVersion: "dao3-project/v1",
    packageId: source.manifest.id,
    display: source.manifest.display,
    engine: {
      runtimeApiVersion: source.manifest.runtime.apiVersion,
      tickRate: source.manifest.runtime.tickRate,
      clientContract: source.manifest.runtime.clientContract,
      serverContract: source.manifest.runtime.serverContract,
      compatibilityLevel: source.manifest.runtime.compatibilityLevel,
    },
    world: "world/world.json",
    assets: "assets/index.json",
    scripts: "scripts/manifest.json",
  });
  await writeJson(files.world, {
    shape: source.manifest.world.shape,
    spawn: source.manifest.world.spawn,
    entities: "world/entities.json",
    terrain: "world/terrain.json",
    physics: "world/physics.json",
  });
  await writeJson(files.terrain, {
    voxels: terrain.map(voxel => ({ position: voxel.position, blockId: voxel.blockId, rotation: voxel.rotation })),
  });
  await writeJson(files.entities, {
    entities: source.entities.map(entity => ({
      kind: entity.kind,
      position: entity.position,
      tags: [...new Set([`id-${entity.id}`, ...entity.tags])].sort(),
    })),
  });
  await writeJson(files.physics, source.physics);
  await writeJson(files.assets, { assets: [] });
  await writeJson(files.scripts, {
    entry: "scripts/server.js",
    modules: ["scripts/server.js"],
    contract: {
      side: "server",
      id: source.manifest.runtime.serverContract,
      apiVersion: source.manifest.runtime.apiVersion,
    },
    capabilities: source.manifest.scripts.serverCapabilities,
  });
  await copyFile(resolve(source.root, source.manifest.scripts.server), files.serverScript);

  const clientScript = source.manifest.scripts.client === null
    ? null
    : await readFile(resolve(source.root, source.manifest.scripts.client));

  return Object.freeze({
    sourceRoot: source.root,
    outputRoot: destination,
    manifest: source.manifest,
    physics: source.physics,
    voxelCount: terrain.length,
    entityCount: source.entities.length,
    clientScript: clientScript === null ? null : Object.freeze({
      name: "clientIndex.js",
      bytes: clientScript,
      sha256: createHash("sha256").update(clientScript).digest("hex"),
    }),
  });
}

export async function publishClientScript(importedProject, assetRoot) {
  if (importedProject.clientScript === null) return null;
  const relativeManifest = `project/${importedProject.manifest.id}/client-scripts/manifest.json`;
  const manifestPath = resolve(assetRoot, relativeManifest);
  const modulePath = join(dirname(manifestPath), importedProject.clientScript.name);
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFileInPlace(modulePath, importedProject.clientScript.bytes);
  await writeJson(manifestPath, {
    format: "nea-recovered-client-scripts",
    version: 1,
    contract: {
      side: "client",
      id: importedProject.manifest.runtime.clientContract,
      apiVersion: importedProject.manifest.runtime.apiVersion,
    },
    capabilities: importedProject.manifest.scripts.clientCapabilities,
    sourceMessage: "gameNet.syncClientScriptModules",
    files: [{
      name: importedProject.clientScript.name,
      bytes: importedProject.clientScript.bytes.byteLength,
      sha256: importedProject.clientScript.sha256,
    }],
  });
  return relativeManifest.split("\\").join("/");
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFileInPlace(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeFileInPlace(path, value) {
  const handle = await openForRewrite(path);
  try {
    await handle.truncate(0);
    await handle.writeFile(value);
  } finally {
    await handle.close();
  }
}

async function openForRewrite(path) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      return await open(path, "r+");
    } catch (error) {
      if (error?.code === "ENOENT") return open(path, "w");
      if (error?.code !== "EPERM" || attempt === 7) throw error;
      await new Promise(resolveDelay => setTimeout(resolveDelay, 75 * (attempt + 1)));
    }
  }
  throw new Error(`Unable to open generated file for rewrite: ${path}`);
}

export function formatImportSummary(result) {
  return `${result.manifest.id}: ${result.voxelCount} voxels, ${result.entityCount} entities, runtime ${result.manifest.runtime.apiVersion || RUNTIME_API_VERSION}`;
}
