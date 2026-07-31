import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import { buildRepositoryProjectCapabilityManifest, loadRepositoryRuntimeCompatibility, publicRuntimeCapabilities } from "../demo-map/src/project-capability.mjs";
import { buildEditorRuntimeProjection } from "./editor-runtime-projection.mjs";
const SERVER_CAPABILITIES = Object.freeze(["server.world.events", "server.world.chat", "server.world.entities", "server.world.voxels", "server.world.config", "server.gui", "server.storage", "server.player", "server.player.write", "server.remote-channel"]);
const [workRootArg, captureRootArg, outputRootArg, templateArchiveArg, templateProjectIdArg, templateWorldManifestArg] = process.argv.slice(2);
if (!workRootArg || !captureRootArg || !outputRootArg) {
  throw new Error("Usage: node build-editor-runtime-package.mjs <work-root> <capture-root> <output-root> [template-archive] [template-project-id] [template-world-manifest]");
}

const workRoot = resolve(workRootArg);
const captureRoot = resolve(captureRootArg);
const outputRoot = resolve(outputRootArg);
const templateArchive = resolve(templateArchiveArg ?? new URL("../local-player/archive", import.meta.url).pathname.slice(1));
const projectSourceRoot = join(workRoot, "manual-cdp", "project");
const sourceRoot = join(workRoot, "manual-cdp", "source");
const project = JSON.parse(await readFile(join(projectSourceRoot, "project.json"), "utf8"));
const extraProjectInfo = JSON.parse(await readFile(join(projectSourceRoot, "extra-project-info.json"), "utf8"));
const publish = JSON.parse(await readFile(join(projectSourceRoot, "publish.json"), "utf8"));
const runtimeCompatibility = await loadRepositoryRuntimeCompatibility();
const clientCapabilities = publicRuntimeCapabilities(runtimeCompatibility.currentRuntime, "client");
const runtimeTemplate = await discoverRuntimeTemplate(templateArchive, templateProjectIdArg, templateWorldManifestArg);
const templateWorld = runtimeTemplate.world;
const packageId = `captured-${publish.gameId}`;
const projectDisplayName = `Captured ${publish.gameId}`;
const archiveRoot = join(outputRoot, "archive");
const packageRoot = join(outputRoot, "project");
const archiveProjectRoot = join(archiveRoot, "project", packageId);
const clientRuntimeManifestName = `project/${packageId}/client-runtime/manifest.json`;
const projectBootstrapManifestName = `project/${packageId}/bootstrap/manifest.json`;

await mkdir(outputRoot, { recursive: true });
for (const directory of ["block", "avatar", "engine"]) {
  await cp(join(templateArchive, directory), join(archiveRoot, directory), { recursive: true, force: true });
}
await cp(runtimeTemplate.clientRuntimeRoot, join(archiveProjectRoot, "client-runtime"), { recursive: true, force: true });

const responseRows = (await readFile(join(captureRoot, "network", "response-bodies.jsonl"), "utf8"))
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => JSON.parse(line));
const bodyByCid = new Map();
const engineModelBodyByHash = new Map();
for (const row of responseRows) {
  const match = /\/block\/(Qm[1-9A-HJ-NP-Za-km-z]{44})$/.exec(row.url ?? "");
  if (match && row.status === 200 && row.file) bodyByCid.set(match[1], resolve(captureRoot, row.file));
  const modelMatch = /\/engine\/m\/([A-Za-z0-9_-]{43})$/.exec(row.url ?? "");
  if (modelMatch && row.status === 200 && row.file) engineModelBodyByHash.set(modelMatch[1], resolve(captureRoot, row.file));
}

const decodedByCid = new Map();
for (const cid of new Set(project.voxels.chunks)) {
  const destination = join(archiveRoot, "block", cid);
  try {
    decodedByCid.set(cid, decodeVoxelChunk(await readFile(destination)));
  } catch (error) {
    if (!bodyByCid.has(cid)) throw new Error(`Missing captured block response for ${cid}`, { cause: error });
    const bytes = await readFile(bodyByCid.get(cid));
    await writeFile(destination, bytes);
    decodedByCid.set(cid, decodeVoxelChunk(bytes));
  }
}

const capturedAudio = await packageCapturedAudioAssets({ project, bodyByCid, archiveRoot, packageRoot });
const capturedPictures = await packageCapturedPictureAssets({ project, engineModelBodyByHash, archiveRoot, packageRoot });

const shape = vector(project.voxels.shape);
const chunkShape = shape.map(value => value / 32);
const terrain = [];
const chunkEntries = [];
for (let index = 0; index < project.voxels.chunks.length; index += 1) {
  const cid = project.voxels.chunks[index];
  const decoded = decodedByCid.get(cid);
  const chunkX = index % chunkShape[0];
  const chunkY = Math.floor(index / chunkShape[0]) % chunkShape[1];
  const chunkZ = Math.floor(index / (chunkShape[0] * chunkShape[1]));
  for (const box of decoded.boxes) {
    const blockId = box.block & 4095;
    const rotation = box.block >>> 14;
    for (let z = box.minZ; z < box.maxZ; z += 1) {
      for (let y = box.minY; y < box.maxY; y += 1) {
        for (let x = box.minX; x < box.maxX; x += 1) {
          terrain.push({ position: [chunkX * 32 + x, chunkY * 32 + y, chunkZ * 32 + z], blockId, rotation });
        }
      }
    }
  }
  chunkEntries.push({ index, hash: cid, boxes: decoded.boxes.length, bytes: decoded.bytes, source: "captured-content" });
}

const spawn = vector(project.player.initialPosition);
const worldManifestName = `world-${packageId}.json`;
await writeJson(join(archiveRoot, worldManifestName), {
  format: "nea-recovered-world",
  version: 1,
  layout: "captured",
  provenance: {
    blockInfo: templateWorld.provenance.blockInfo,
    placementKnown: true,
    source: captureRoot,
    note: "Recovered from an editor project snapshot and matching locally captured block responses.",
  },
  chunkSize: 32,
  chunkShape,
  voxelShape: shape,
  spawn,
  resetCounter: 0,
  innerAO: true,
  emptyChunk: project.voxels.chunks[0],
  hashes: project.voxels.chunks,
  chunks: chunkEntries,
  completeness: { chunks: chunkEntries.length, recovered: chunkEntries.length, streamed: chunkEntries.length, unavailable: 0, uniqueMissingContentAddresses: 0 },
});

const serverFiles = await javascriptFiles(join(sourceRoot, "server"));
const serverModules = [];
for (const name of serverFiles) {
  const destination = join(packageRoot, "scripts", name);
  await mkdir(join(packageRoot, "scripts"), { recursive: true });
  await writeFile(destination, await readFile(join(sourceRoot, "server", name)));
  serverModules.push(`scripts/${name}`);
}

const clientFiles = await javascriptFiles(join(sourceRoot, "client"));
const clientOutput = join(archiveRoot, "project", packageId, "client-scripts");
await mkdir(clientOutput, { recursive: true });
const clientManifestFiles = [];
for (const name of clientFiles) {
  const bytes = await readFile(join(sourceRoot, "client", name));
  await writeFile(join(clientOutput, name), bytes);
  clientManifestFiles.push({ name, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
}
const clientManifestName = `project/${packageId}/client-scripts/manifest.json`;
await writeJson(join(archiveRoot, clientManifestName), {
  format: "nea-recovered-client-scripts",
  version: 1,
  capabilities: clientCapabilities,
  sourceMessage: "gameNet.syncClientScriptModules",
  files: clientManifestFiles,
});

const capturedPictureAssets = capturedPictures.uiAssets;
const clientUiManifestName = `project/${packageId}/client-ui/manifest.json`;
await writeJson(join(archiveRoot, clientUiManifestName), {
  format: "nea-recovered-client-ui",
  version: 1,
  sourceMessage: "gameUI.reset",
  running: true,
  defaultScreenId: project.defaultScreenId,
  pictureAssets: capturedPictureAssets,
  uiTree: project.uiTree,
});

const runtimeManifestPath = join(archiveRoot, clientRuntimeManifestName);
const runtimeManifest = JSON.parse(await readFile(runtimeManifestPath, "utf8"));
runtimeManifest.pagePath = `/p/${packageId}`;
runtimeManifest.gameName = packageId;
runtimeManifest.contentId = String(publish.gameId);
await writeJson(runtimeManifestPath, runtimeManifest);

const entityNodes = Object.values(project.entitiesTree)
  .filter(node => node?.type === 1 && node.value);
const projectPackageTagPattern = /^[a-z][a-z0-9-]{0,63}$/;
const entities = entityNodes.map(node => {
  const sourceTags = [...new Set((node.value.tags ?? []).filter(tag => typeof tag === "string"))].sort();
  const packageTags = [...new Set([`id-${node.id}`, ...sourceTags.filter(tag => projectPackageTagPattern.test(tag))])].sort();
  return {
    kind: "entity",
    position: vector(node.value.position),
    tags: packageTags,
    source: {
      name: node.value.name ?? node.name ?? "",
      mesh: node.value.mesh ?? "",
      tags: sourceTags,
      collision: node.value.collision ?? false,
      fixed: node.value.fixed ?? false,
    },
  };
});

const modelMetadataByHash = new Map();
const copiedModelHashes = new Set();
await mkdir(join(archiveRoot, "engine", "m"), { recursive: true });
for (const asset of Object.values(extraProjectInfo.meshAssets ?? {})) {
  const metadataPath = asset?.hash ? engineModelBodyByHash.get(asset.hash) : undefined;
  if (!metadataPath) continue;
  const metadataBytes = await readFile(metadataPath);
  const metadata = JSON.parse(metadataBytes.toString("utf8"));
  const dataPath = typeof metadata.dataHash === "string" ? engineModelBodyByHash.get(metadata.dataHash) : undefined;
  if (!dataPath) continue;
  modelMetadataByHash.set(asset.hash, metadata);
  for (const [hash, sourcePath] of [[asset.hash, metadataPath], [metadata.dataHash, dataPath]]) {
    if (copiedModelHashes.has(hash)) continue;
    copiedModelHashes.add(hash);
    await writeFile(join(archiveRoot, "engine", "m", hash), await readFile(sourcePath));
  }
}
const bootstrapPath = join(archiveProjectRoot, "bootstrap", "bootstrap.json");
const bootstrap = structuredClone(runtimeTemplate.bootstrap);
const initialBootstrapMeshCount = bootstrap.meshHashes.length;
const projection = buildEditorRuntimeProjection({
  packageId,
  entities,
  entityNodes,
  meshAssets: extraProjectInfo.meshAssets ?? {},
  modelMetadataByHash,
  bootstrapMeshHashes: bootstrap.meshHashes,
});
bootstrap.meshHashes = projection.meshHashes;
const bootstrapBytes = Buffer.from(`${JSON.stringify(bootstrap, null, 2)}\n`);
await writeFile(bootstrapPath, bootstrapBytes);
await writeJson(join(archiveRoot, projectBootstrapManifestName), {
  format: "nea-recovered-project-bootstrap-manifest",
  version: 1,
  file: { name: "bootstrap.json", bytes: bootstrapBytes.length, sha256: createHash("sha256").update(bootstrapBytes).digest("hex") },
});
const playerProjectionDescriptor = "compat/player-entity-projection.json";
await writeJson(join(packageRoot, playerProjectionDescriptor), projection.descriptor);
const serverCapabilityModules = await Promise.all(serverFiles.map(async name => ({
  name,
  source: await readFile(join(sourceRoot, "server", name), "utf8"),
})));
const clientCapabilityModules = await Promise.all(clientFiles.map(async name => ({
  name,
  source: await readFile(join(sourceRoot, "client", name), "utf8"),
})));
const validatedMeshNames = new Set(projection.descriptor.meshes.map(mesh => mesh.name));
const capabilityAssets = [
  ...[...validatedMeshNames].sort().map(name => ({ name, kind: "mesh", runtimeBinding: "validated-mesh" })),
  ...capturedAudio.capabilityAssets,
  ...capturedPictures.capabilityAssets,
];
const capabilityManifest = await buildRepositoryProjectCapabilityManifest({
  apiVersion: "0.1.0",
  contracts: { client: "dao3-client-runtime/v1", server: "nea-server-runtime/v1" },
  serverModules: serverCapabilityModules,
  clientModules: clientCapabilityModules,
  serverCapabilities: SERVER_CAPABILITIES,
  clientCapabilities,
  runtimeCompatibility,
  assets: capabilityAssets,
  entities: entities.map((entity, index) => ({ id: entityNodes[index]?.id, kind: entity.kind, mesh: entity.source?.mesh ?? "" })),
  uiState: { defaultScreenId: project.defaultScreenId, uiTree: project.uiTree },
  projectIdentity: { projectName: projectDisplayName },
});
await writeJson(join(packageRoot, "capabilities", "manifest.json"), capabilityManifest);

await writeJson(join(packageRoot, "dao3.project.json"), {
  formatVersion: "dao3-project/v1",
  packageId,
  display: { name: projectDisplayName, description: "Locally recovered editor project runtime package." },
  engine: {
    runtimeApiVersion: "0.1.0",
    tickRate: 20,
    clientContract: "dao3-client-runtime/v1",
    serverContract: "nea-server-runtime/v1",
    compatibilityLevel: "experimental",
  },
  world: "world/world.json",
  assets: "assets/index.json",
  scripts: "scripts/manifest.json",
  capabilities: "capabilities/manifest.json",
});
await writeJson(join(packageRoot, "world", "world.json"), { shape, spawn, entities: "world/entities.json", terrain: "world/terrain.json", physics: "world/physics.json" });
await writeJson(join(packageRoot, "world", "terrain.json"), { voxels: terrain });
await writeJson(join(packageRoot, "world", "entities.json"), { entities });
await writeJson(join(packageRoot, "world", "physics.json"), {
  formatVersion: "nea-physics/v1",
  gravity: project.physics.gravity,
  playerBody: {
    profileId: "historical-player-default-v1",
    origin: "body-center",
    originStatus: "confirmed",
    sizeStatus: "confirmed",
    boundsHalfExtents: [0.45, 1.1, 0.45],
    shapeHalfExtents: [0.45, 1.1, 0.45],
  },
  materials: {},
  colliders: [],
  triggers: [],
});
await writeJson(join(packageRoot, "assets", "index.json"), { assets: [...capturedAudio.packageAssets, ...capturedPictures.packageAssets] });
await writeJson(join(packageRoot, "scripts", "manifest.json"), {
  entry: `scripts/${project.scriptIndex}`,
  modules: serverModules,
  contract: { side: "server", id: "nea-server-runtime/v1", apiVersion: "0.1.0" },
  capabilities: SERVER_CAPABILITIES,
});

const summary = {
  format: "nea-editor-runtime-package",
  version: 1,
  packageId,
  contentId: String(publish.gameId),
  projectRoot: packageRoot,
  archiveRoot,
  worldManifest: worldManifestName,
  clientManifest: clientManifestName,
  clientUiManifest: clientUiManifestName,
  clientRuntimeManifest: clientRuntimeManifestName,
  projectBootstrapManifest: projectBootstrapManifestName,
  playerProjectionDescriptor,
  route: `/play/${packageId}`,
  terrainVoxels: terrain.length,
  entities: entities.length,
  projectedEntities: projection.descriptor.entities.length,
  unmappedEntities: projection.diagnostics.length,
  supplementalMeshHashes: projection.meshHashes.length - initialBootstrapMeshCount,
  serverModules: serverModules.length,
  clientModules: clientManifestFiles.length,
  clientCapabilities: clientCapabilities.length,
  clientUiNodes: Object.keys(project.uiTree ?? {}).length,
  clientUiPictureAssets: Object.keys(capturedPictureAssets).length,
  declaredPictureAssets: Object.keys(project.pictureAssets ?? {}).length,
  packagedPictureAssets: Object.keys(capturedPictureAssets).length,
  unresolvedPictureAssets: capturedPictures.missing,
  packagedAudioAssets: capturedAudio.packageAssets.length,
  audioAssetAliases: capturedAudio.capabilityAssets.length,
  missingAudioAssets: capturedAudio.missing,
  capabilityStatus: capabilityManifest.status,
  capabilitySummary: capabilityManifest.summary,
};
await writeJson(join(outputRoot, "runtime-package.json"), summary);
console.log(JSON.stringify(summary, null, 2));

async function javascriptFiles(root) {
  const entries = await import("node:fs/promises").then(module => module.readdir(root, { withFileTypes: true }));
  return entries.filter(entry => entry.isFile() && entry.name.endsWith(".js") && basename(entry.name) === entry.name).map(entry => entry.name).sort();
}

async function discoverRuntimeTemplate(archiveRoot, requestedProjectId, requestedWorldManifest) {
  const projectRoot = join(archiveRoot, "project");
  const projectEntries = (await readdir(projectRoot, { withFileTypes: true })).filter(entry => entry.isDirectory());
  const candidates = [];
  for (const entry of projectEntries) {
    if (requestedProjectId && entry.name !== requestedProjectId) continue;
    const candidateRoot = join(projectRoot, entry.name);
    try {
      const clientRuntime = JSON.parse(await readFile(join(candidateRoot, "client-runtime", "manifest.json"), "utf8"));
      const bootstrapManifest = JSON.parse(await readFile(join(candidateRoot, "bootstrap", "manifest.json"), "utf8"));
      if (clientRuntime.format !== "nea-recovered-client-runtime" || clientRuntime.version !== 1) continue;
      if (bootstrapManifest.format !== "nea-recovered-project-bootstrap-manifest" || bootstrapManifest.version !== 1) continue;
      const bootstrap = JSON.parse(await readFile(join(candidateRoot, "bootstrap", bootstrapManifest.file.name), "utf8"));
      candidates.push({ projectId: entry.name, clientRuntimeRoot: join(candidateRoot, "client-runtime"), bootstrap });
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  if (candidates.length !== 1) throw new Error(`Expected exactly one compatible Player runtime template, found ${candidates.length}; pass [template-project-id] to select one`);

  const worldFiles = (await readdir(archiveRoot, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith(".json") && (!requestedWorldManifest || entry.name === requestedWorldManifest));
  const worlds = [];
  for (const entry of worldFiles) {
    const value = JSON.parse(await readFile(join(archiveRoot, entry.name), "utf8"));
    if (value.format === "nea-recovered-world" && value.version === 1 && typeof value.provenance?.blockInfo === "string") worlds.push({ name: entry.name, value });
  }
  if (worlds.length !== 1) throw new Error(`Expected exactly one compatible world template, found ${worlds.length}; pass [template-world-manifest] to select one`);
  return Object.freeze({ ...candidates[0], worldManifest: worlds[0].name, world: worlds[0].value });
}

async function packageCapturedAudioAssets({ project, bodyByCid, archiveRoot, packageRoot }) {
  const packageAssets = [];
  const capabilityAssets = [];
  const packagedByHash = new Map();
  let missing = 0;
  for (const [name, asset] of Object.entries(project.audioAssets ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
    const hash = asset?.hash;
    if (typeof hash !== "string" || !/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash)) {
      missing += 1;
      continue;
    }
    let packaged = packagedByHash.get(hash);
    if (!packaged) {
      let bytes;
      try {
        bytes = await readFile(join(archiveRoot, "block", hash));
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
        if (!bodyByCid.has(hash)) {
          missing += 1;
          continue;
        }
        bytes = await readFile(bodyByCid.get(hash));
      }
      if (!isMp3(bytes) || cidV0(bytes) !== hash) {
        missing += 1;
        continue;
      }
      const source = `assets/content/${hash}.mp3`;
      await mkdir(join(packageRoot, "assets", "content"), { recursive: true });
      await writeFile(join(packageRoot, source), bytes);
      await writeFile(join(archiveRoot, "block", hash), bytes);
      packaged = Object.freeze({
        logicalPath: `audio/${hash}.mp3`,
        source,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        mimeType: "audio/mpeg",
        bytes: bytes.length,
      });
      packagedByHash.set(hash, packaged);
      packageAssets.push(packaged);
    }
    capabilityAssets.push(Object.freeze({ name, kind: "audio", contentAddress: hash, path: packaged.source, runtimeBinding: "player-block-audio" }));
  }
  return Object.freeze({ packageAssets: Object.freeze(packageAssets), capabilityAssets: Object.freeze(capabilityAssets), missing });
}

function isMp3(bytes) {
  return bytes.length >= 3 && (bytes.subarray(0, 3).equals(Buffer.from("ID3")) || bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
}

async function packageCapturedPictureAssets({ project, engineModelBodyByHash, archiveRoot, packageRoot }) {
  const uiAssets = {};
  const packageAssets = [];
  const capabilityAssets = [];
  const packagedFiles = new Set();
  let missing = 0;
  for (const [name, asset] of Object.entries(project.pictureAssets ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
    const metadataHash = asset?.hash;
    const declaredImageHash = asset?.previewImage;
    const metadataPath = typeof metadataHash === "string" ? engineModelBodyByHash.get(metadataHash) : null;
    const imagePath = typeof declaredImageHash === "string" ? engineModelBodyByHash.get(declaredImageHash) : null;
    if (!metadataPath || !imagePath) {
      missing += 1;
      continue;
    }
    const metadataBytes = await readFile(metadataPath);
    const imageBytes = await readFile(imagePath);
    let metadata;
    try {
      metadata = JSON.parse(metadataBytes.toString("utf8"));
    } catch {
      missing += 1;
      continue;
    }
    const image = detectImage(imageBytes);
    if (!/^[A-Za-z0-9_-]{43}$/.test(metadataHash) || !/^[A-Za-z0-9_-]{43}$/.test(declaredImageHash) ||
        createHash("sha256").update(metadataBytes).digest("base64url") !== metadataHash ||
        createHash("sha256").update(imageBytes).digest("base64url") !== declaredImageHash ||
        metadata.hash !== declaredImageHash || !Number.isInteger(metadata.width) || metadata.width <= 0 ||
        !Number.isInteger(metadata.height) || metadata.height <= 0 || image === null) {
      missing += 1;
      continue;
    }
    await writeFile(join(archiveRoot, "engine", "m", metadataHash), metadataBytes);
    await writeFile(join(archiveRoot, "engine", "m", declaredImageHash), imageBytes);
    for (const file of [
      { hash: metadataHash, bytes: metadataBytes, extension: "json", mimeType: "application/json" },
      { hash: declaredImageHash, bytes: imageBytes, extension: image.extension, mimeType: image.mimeType },
    ]) {
      const source = `assets/content/${file.hash}.${file.extension}`;
      if (!packagedFiles.has(source)) {
        await mkdir(join(packageRoot, "assets", "content"), { recursive: true });
        await writeFile(join(packageRoot, source), file.bytes);
        packageAssets.push(Object.freeze({ logicalPath: `picture/${file.hash}.${file.extension}`, source, sha256: createHash("sha256").update(file.bytes).digest("hex"), mimeType: file.mimeType, bytes: file.bytes.length }));
        packagedFiles.add(source);
      }
    }
    uiAssets[name] = Object.freeze({ metadataHash, hash: declaredImageHash, width: metadata.width, height: metadata.height });
    capabilityAssets.push(Object.freeze({ name, kind: "image", contentAddress: declaredImageHash, metadataHash, runtimeBinding: "player-picture-image" }));
  }
  return Object.freeze({ uiAssets: Object.freeze(uiAssets), packageAssets: Object.freeze(packageAssets), capabilityAssets: Object.freeze(capabilityAssets), missing });
}

function detectImage(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return Object.freeze({ extension: "png", mimeType: "image/png" });
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return Object.freeze({ extension: "jpg", mimeType: "image/jpeg" });
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return Object.freeze({ extension: "webp", mimeType: "image/webp" });
  if (bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))) return Object.freeze({ extension: "gif", mimeType: "image/gif" });
  return null;
}

function cidV0(bytes) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const multihash = Buffer.concat([Buffer.from([0x12, 0x20]), createHash("sha256").update(bytes).digest()]);
  let value = BigInt(`0x${multihash.toString("hex")}`);
  let encoded = "";
  while (value > 0n) {
    const remainder = Number(value % 58n);
    encoded = alphabet[remainder] + encoded;
    value /= 58n;
  }
  for (const byte of multihash) {
    if (byte !== 0) break;
    encoded = alphabet[0] + encoded;
  }
  return encoded;
}

function vector(value) {
  if (Array.isArray(value)) return value.slice(0, 3).map(Number);
  return [Number(value?.[0] ?? value?.x), Number(value?.[1] ?? value?.y), Number(value?.[2] ?? value?.z)];
}

function decodeVoxelChunk(bytes) {
  const state = { bytes, offset: 0 };
  const paletteLength = readVarint(state);
  const boxCount = readVarint(state);
  if (paletteLength > 4096 || boxCount > 32768) throw new RangeError("Invalid voxel chunk header");
  const palette = Array.from({ length: paletteLength }, () => readVarint(state));
  const boxes = [];
  let previousX = 0;
  let previousY = 0;
  let previousZ = 0;
  for (let index = 0; index < boxCount; index += 1) {
    const minimum = readVarint(state);
    const size = readVarint(state);
    const paletteIndex = readVarint(state);
    if (paletteIndex >= palette.length) throw new RangeError("Invalid voxel chunk palette index");
    const minX = (previousX + decodeZigZag(deinterleave3(minimum))) & 31;
    const minY = (previousY + decodeZigZag(deinterleave3(minimum >>> 1))) & 31;
    const minZ = (previousZ + decodeZigZag(deinterleave3(minimum >>> 2))) & 31;
    const maxX = minX + deinterleave3(size);
    const maxY = minY + deinterleave3(size >>> 1);
    const maxZ = minZ + deinterleave3(size >>> 2);
    if (maxX <= minX || maxY <= minY || maxZ <= minZ || maxX > 32 || maxY > 32 || maxZ > 32) throw new RangeError(`Invalid voxel chunk box ${index}`);
    boxes.push({ minX, minY, minZ, maxX, maxY, maxZ, block: palette[paletteIndex] });
    previousX = minX;
    previousY = minY;
    previousZ = minZ;
  }
  if (state.offset !== bytes.length) throw new Error("Voxel chunk contains trailing bytes");
  return { boxes, bytes: bytes.length };
}

function readVarint(state) {
  let value = 0;
  let shift = 0;
  while (state.offset < state.bytes.length) {
    const byte = state.bytes[state.offset++];
    value += (byte & 0x7f) * 2 ** shift;
    if ((byte & 0x80) === 0) return value;
    shift += 7;
  }
  throw new Error("Unexpected end of voxel chunk varint");
}

function decodeZigZag(value) {
  return value & 1 ? -(value >>> 1) - 1 : value >>> 1;
}

function deinterleave3(value) {
  let result = 1227133513 & value;
  result = 3272356035 & (result | result >>> 2);
  result |= result >>> 4;
  result &= 251719695;
  result |= result >>> 8;
  result &= 4278190335;
  result |= result >>> 16;
  return result & 1023;
}

async function writeJson(path, value) {
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}
