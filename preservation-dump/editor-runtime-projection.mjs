import { createHash } from "node:crypto";

export function buildEditorRuntimeProjection({ packageId, entities, entityNodes, meshAssets, modelMetadataByHash, bootstrapMeshHashes }) {
  if (!Array.isArray(entities) || !Array.isArray(entityNodes) || entities.length !== entityNodes.length) {
    throw new Error("Projection entities and source nodes must have matching lengths");
  }
  const meshHashes = bootstrapMeshHashes.map(entry => structuredClone(entry));
  const meshIndexByHash = new Map(meshHashes.map((entry, index) => [entry.hash, index]));
  const mappings = [];
  const meshes = [];
  const diagnostics = [];
  const resolveMesh = (meshName, asset, metadata) => {
    const meshBounds = vector(metadata.bounds, "model metadata bounds");
    let bootstrapMeshIndex = meshIndexByHash.get(asset.hash);
    if (bootstrapMeshIndex === undefined) {
      const renderBoxOffset = metadata.renderBoxOffset === undefined ? [0, 0, 0] : vector(metadata.renderBoxOffset, "model renderBoxOffset");
      bootstrapMeshIndex = meshHashes.length;
      meshIndexByHash.set(asset.hash, bootstrapMeshIndex);
      meshHashes.push(Object.freeze({
        bodyBX: meshBounds[0], bodyBY: meshBounds[1], bodyBZ: meshBounds[2],
        bodyOffsetX: 0, bodyOffsetY: 0, bodyOffsetZ: 0,
        meshBX: meshBounds[0], meshBY: meshBounds[1], meshBZ: meshBounds[2],
        renderBoxOffsetX: renderBoxOffset[0], renderBoxOffsetY: renderBoxOffset[1], renderBoxOffsetZ: renderBoxOffset[2],
        hash: asset.hash,
        hashType: "",
      }));
    }
    return Object.freeze({ name: meshName, bounds: meshBounds, bootstrapMeshIndex, bootstrapMeshHash: asset.hash });
  };
  for (let entityIndex = 0; entityIndex < entityNodes.length; entityIndex += 1) {
    const node = entityNodes[entityIndex];
    const entity = entities[entityIndex];
    const meshName = node?.value?.mesh;
    const asset = typeof meshName === "string" ? meshAssets?.[meshName] : undefined;
    const metadata = asset?.hash ? modelMetadataByHash.get(asset.hash) : undefined;
    if (!asset?.hash || !metadata) {
      diagnostics.push(Object.freeze({ entityIndex, sourceId: String(node?.id ?? ""), mesh: meshName ?? "", reason: "captured-model-metadata-unavailable" }));
      continue;
    }
    const bodyBounds = vector(node.value.bounds, "entity bounds");
    const resolvedMesh = resolveMesh(meshName, asset, metadata);
    if (!sameVector(bodyBounds, resolvedMesh.bounds, 1e-5)) throw new Error(`Captured model bounds do not match project entity ${node.id}`);
    const sourceFingerprint = createHash("sha256").update(JSON.stringify({
      kind: entity.kind,
      position: [...entity.position],
      tags: [...entity.tags],
    }), "utf8").digest("hex");
    mappings.push(Object.freeze({
      entityIndex,
      sourceFingerprint,
      expect: Object.freeze({ kind: entity.kind, position: [...entity.position], tags: [...entity.tags] }),
      body: compactObject({
        bounds: bodyBounds,
        orientation: optionalQuaternion(node.value.orientation),
        collides: optionalBoolean(node.value.collision),
        fixed: optionalBoolean(node.value.fixed),
        gravity: optionalBoolean(node.value.gravity),
        mass: optionalFinite(node.value.mass),
        friction: optionalFinite(node.value.friction),
        restitution: optionalFinite(node.value.restitution),
      }),
      mesh: Object.freeze({ bootstrapMeshIndex: resolvedMesh.bootstrapMeshIndex, bootstrapMeshHash: resolvedMesh.bootstrapMeshHash }),
      model: compactObject({
        color: optionalColor(node.value.tint),
        scale: optionalVector(node.value.scale),
        emissive: optionalFinite(node.value.emissive),
        shininess: optionalFinite(node.value.shininess),
        metalness: optionalFinite(node.value.metalness),
        staticShadow: optionalBoolean(node.value.staticShadow),
      }),
    }));
  }
  for (const [meshName, asset] of Object.entries(meshAssets ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
    const metadata = asset?.hash ? modelMetadataByHash.get(asset.hash) : undefined;
    if (!asset?.hash || !metadata) continue;
    meshes.push(resolveMesh(meshName, asset, metadata));
  }
  return Object.freeze({
    meshHashes: Object.freeze(meshHashes),
    descriptor: Object.freeze({ format: "nea-local-player-entity-projection", version: 1, packageId, entities: Object.freeze(mappings), meshes: Object.freeze(meshes) }),
    diagnostics: Object.freeze(diagnostics),
  });
}

function compactObject(record) {
  return Object.freeze(Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined)));
}

function vector(value, label) {
  const result = Array.isArray(value) ? value.slice(0, 3).map(Number) : [Number(value?.[0] ?? value?.x), Number(value?.[1] ?? value?.y), Number(value?.[2] ?? value?.z)];
  if (result.length !== 3 || result.some(component => !Number.isFinite(component))) throw new Error(`Invalid ${label}`);
  return Object.freeze(result);
}

function optionalVector(value) { return value === undefined ? undefined : vector(value, "vector"); }
function optionalQuaternion(value) {
  if (value === undefined) return undefined;
  const result = Array.isArray(value) ? value.slice(0, 4).map(Number) : [Number(value?.[0] ?? value?.x), Number(value?.[1] ?? value?.y), Number(value?.[2] ?? value?.z), Number(value?.[3] ?? value?.w)];
  if (result.length !== 4 || result.some(component => !Number.isFinite(component))) throw new Error("Invalid quaternion");
  const magnitude = Math.hypot(...result);
  if (!Number.isFinite(magnitude) || magnitude <= 1e-12) throw new Error("Invalid quaternion");
  return Object.freeze(result.map(component => component / magnitude));
}
function optionalColor(value) {
  if (value === undefined) return undefined;
  const result = Array.isArray(value) ? value.slice(0, 4).map(Number) : [Number(value?.[0] ?? value?.r), Number(value?.[1] ?? value?.g), Number(value?.[2] ?? value?.b), Number(value?.[3] ?? value?.a)];
  if (result.length !== 4 || result.some(component => !Number.isFinite(component))) throw new Error("Invalid color");
  return Object.freeze(result);
}
function optionalBoolean(value) { return value === undefined ? undefined : Boolean(value); }
function optionalFinite(value) { const number = Number(value); return value === undefined ? undefined : Number.isFinite(number) ? number : undefined; }
function sameVector(left, right, epsilon) { return left.length === right.length && left.every((value, index) => Math.abs(value - right[index]) <= epsilon); }
