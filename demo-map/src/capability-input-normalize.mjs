export function normalizeCapabilityAssets(assets) {
  if (!Array.isArray(assets)) throw new Error("Capability asset input must be an array");
  return assets.map((asset, index) => {
    if (typeof asset === "string") return { reference: asset, source: null, bytes: null, sha256: null };
    if (!asset || typeof asset !== "object" || Array.isArray(asset)) throw new Error(`Capability asset input is invalid at ${index}`);
    const reference = asset.name ?? asset.logicalPath ?? asset.id ?? asset.path;
    const source = asset.packagePath ?? asset.source ?? asset.path ?? null;
    const byteLength = asset.bytes instanceof Uint8Array ? asset.bytes.byteLength : asset.bytes;
    const bytes = Number.isInteger(byteLength) && byteLength >= 0 ? byteLength : null;
    if (typeof reference !== "string" || reference.length === 0) throw new Error(`Capability asset input is incomplete at ${index}`);
    return {
      reference,
      source: typeof source === "string" && source.length > 0 ? source : null,
      bytes,
      sha256: typeof asset.sha256 === "string" && asset.sha256.length > 0 ? asset.sha256 : null,
    };
  }).sort((left, right) => left.reference.localeCompare(right.reference) || String(left.source ?? "").localeCompare(String(right.source ?? "")));
}

export function normalizeCapabilityEntities(entities) {
  if (!Array.isArray(entities)) throw new Error("Capability entity input must be an array");
  return entities.map((entity, index) => {
    if (!entity || typeof entity !== "object" || Array.isArray(entity)) throw new Error(`Capability entity input is invalid at ${index}`);
    const taggedId = Array.isArray(entity.tags) ? entity.tags.find(tag => typeof tag === "string" && tag.startsWith("id-"))?.slice(3) : null;
    const id = String(entity.id ?? entity.sourceId ?? taggedId ?? `entity-${index + 1}`);
    const kind = String(entity.kind ?? entity.source?.kind ?? "entity");
    const mesh = entity.mesh ?? entity.source?.mesh ?? entity.visual?.assetPath ?? null;
    return { id, kind, mesh: typeof mesh === "string" && mesh.length > 0 ? mesh : null };
  }).sort((left, right) => left.id.localeCompare(right.id) || left.kind.localeCompare(right.kind));
}

export function normalizeCapabilityRuntimeAbi(runtimeCompatibility) {
  if (!runtimeCompatibility || typeof runtimeCompatibility !== "object" || Array.isArray(runtimeCompatibility)) throw new Error("Capability Runtime ABI input is missing or invalid");
  return {
    currentRuntime: withoutGeneratedAt(runtimeCompatibility.currentRuntime),
    compatibilityMatrix: withoutGeneratedAt(runtimeCompatibility.compatibilityMatrix),
    runtimeContracts: withoutGeneratedAt(runtimeCompatibility.runtimeContracts),
  };
}

function withoutGeneratedAt(value) {
  if (Array.isArray(value)) return value.map(withoutGeneratedAt);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).filter(key => key !== "generatedAt").sort().map(key => [key, withoutGeneratedAt(value[key])]));
}
