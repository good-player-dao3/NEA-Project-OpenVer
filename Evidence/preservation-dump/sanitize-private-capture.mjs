import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { basename, extname, join, relative, resolve } from "node:path";

const MAX_JSON_BYTES = 2 * 1024 * 1024;
const MAX_SCHEMA_DEPTH = 5;
const EXCLUDED_DIRECTORY_NAMES = new Set([
  "browser-profile",
  "manual-cdp",
  "request-bodies",
  "response-bodies",
  "scripts",
  "websocket-frames",
]);
const EXCLUDED_FILE_NAMES = new Set([
  "request-bodies.json",
  "response-bodies.json",
  "scripts.json",
  "websocket-events.json",
  "websocket-frames.json",
]);
const ALLOWED_DESCRIPTOR_PATHS = new Set([
  "manual-cdp/project/extra-project-info.json",
  "manual-cdp/project/local-permissions.json",
  "manual-cdp/project/manifest.json",
  "manual-cdp/project/permissions.json",
  "manual-cdp/project/project-info.json",
  "manual-cdp/project/project.json",
  "manual-cdp/project/publish.json",
  "manual-cdp/project/runtime-bridge.json",
  "work-manifest.json",
]);
const DESCRIPTOR_NAMES = new Set([
  "bootstrap.json",
  "capabilities.json",
  "manifest.json",
  "project.json",
  "work-manifest.json",
]);
const SENSITIVE_KEY = /auth|authorization|cookie|credential|identity|login|password|payload|secret|session|source|script|token|url|user|value|body|code|content/i;

function parseArguments(argumentsList) {
  const values = {};
  for (let index = 2; index < argumentsList.length; index += 1) {
    if (argumentsList[index].startsWith("--")) values[argumentsList[index].slice(2)] = argumentsList[++index];
  }
  return values;
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function artifactId(relativePath) {
  return `artifact-${hash(relativePath).slice(0, 16)}`;
}

function isExcluded(relativePath) {
  const normalizedPath = relativePath.replaceAll("\\", "/").toLowerCase();
  if (ALLOWED_DESCRIPTOR_PATHS.has(normalizedPath)) return false;
  const parts = normalizedPath.split("/");
  return parts.some(part => EXCLUDED_DIRECTORY_NAMES.has(part))
    || EXCLUDED_FILE_NAMES.has(parts.at(-1));
}

function canContainAllowedDescriptor(relativePath) {
  const normalizedPath = relativePath.replaceAll("\\", "/").toLowerCase();
  return [...ALLOWED_DESCRIPTOR_PATHS].some(path => path.startsWith(`${normalizedPath}/`));
}

async function collectFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(current, entry.name);
    const relativePath = relative(root, path);
    if (isExcluded(relativePath) && !canContainAllowedDescriptor(relativePath)) continue;
    if (entry.isDirectory()) files.push(...await collectFiles(root, path));
    else if (entry.isFile() && extname(entry.name).toLowerCase() === ".json") files.push(path);
  }
  return files;
}

function describeValue(value, depth = 0) {
  if (depth >= MAX_SCHEMA_DEPTH) return { type: "truncated" };
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) {
    return { type: "array", items: value.length ? describeValue(value[0], depth + 1) : { type: "unknown" } };
  }
  if (typeof value !== "object") return { type: typeof value };
  const properties = {};
  for (const [key, child] of Object.entries(value).sort(([left], [right]) => left.localeCompare(right))) {
    const safeKey = SENSITIVE_KEY.test(key) ? "<redacted-key>" : key;
    properties[safeKey] = describeValue(child, depth + 1);
  }
  return { type: "object", properties };
}

function sanitizeValue(value, key = "") {
  if (SENSITIVE_KEY.test(key)) return "<redacted>";
  if (value === null || typeof value !== "object") {
    if (typeof value === "string") return `<redacted-string:${value.length}>`;
    return value;
  }
  if (Array.isArray(value)) return value.map(item => sanitizeValue(item, key));
  return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [
    SENSITIVE_KEY.test(childKey) ? "<redacted-key>" : childKey,
    sanitizeValue(child, childKey),
  ]));
}

function collectFieldPaths(value, prefix, counts, depth = 0) {
  if (depth >= MAX_SCHEMA_DEPTH || value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    if (value[0] !== undefined) collectFieldPaths(value[0], `${prefix}[]`, counts, depth + 1);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const safeKey = SENSITIVE_KEY.test(key) ? "<redacted-key>" : key;
    const path = prefix ? `${prefix}.${safeKey}` : safeKey;
    counts[path] = (counts[path] ?? 0) + 1;
    collectFieldPaths(child, path, counts, depth + 1);
  }
}

async function writeJson(path, value) {
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function sanitizeCapture(captureRoot, outputRoot) {
  const files = await collectFiles(captureRoot);
  const records = [];
  const fieldCounts = {};
  for (const file of files) {
    const bytes = (await stat(file)).size;
    if (bytes > MAX_JSON_BYTES) continue;
    let value;
    try {
      value = JSON.parse(await readFile(file, "utf8"));
    } catch {
      continue;
    }
    collectFieldPaths(value, "", fieldCounts);
    const relativePath = relative(captureRoot, file).replaceAll("\\", "/");
    const id = artifactId(relativePath);
    const descriptor = DESCRIPTOR_NAMES.has(basename(file).toLowerCase());
    const record = {
      artifactId: id,
      kind: descriptor ? "descriptor" : "json-schema",
      bytes,
      sha256: hash(JSON.stringify(value)),
      schemaFile: `schemas/${id}.json`,
    };
    await writeJson(join(outputRoot, record.schemaFile), {
      format: "nea-sanitized-json-schema",
      version: 1,
      artifactId: id,
      descriptor,
      schema: describeValue(value),
    });
    if (descriptor) {
      record.sanitizedFile = `descriptors/${id}.json`;
      await writeJson(join(outputRoot, record.sanitizedFile), sanitizeValue(value));
    }
    records.push(record);
  }
  const index = {
    format: "nea-sanitized-private-evidence",
    version: 1,
    generatedAt: new Date().toISOString(),
    provenance: {
      sourceClass: "approved-local-private-inspection",
      redactionStatus: "schema-only-and-redacted-values",
      publicStatus: "public-sanitized",
      reproducibilityLimit: "Original private paths, values, scripts, payloads, identities, and browser state are intentionally unavailable.",
    },
    policy: {
      excludedDirectories: [...EXCLUDED_DIRECTORY_NAMES].sort(),
      excludedFiles: [...EXCLUDED_FILE_NAMES].sort(),
      allowedDescriptorPaths: [...ALLOWED_DESCRIPTOR_PATHS].sort(),
      maxJsonBytes: MAX_JSON_BYTES,
      maxSchemaDepth: MAX_SCHEMA_DEPTH,
    },
    fieldInventory: Object.entries(fieldCounts)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([path, occurrences]) => ({ path, occurrences })),
    files: records,
  };
  await writeJson(join(outputRoot, "index.json"), index);
  return index;
}

const cliArguments = globalThis.process?.argv ?? [];
if (cliArguments[1] && import.meta.url === pathToFileURL(cliArguments[1]).href) {
  const values = parseArguments(cliArguments);
  const captureRoot = resolve(values.capture ?? "dump/private/live-capture");
  const outputRoot = resolve(values.output ?? "Evidence/dump/sanitized-capture");
  const result = await sanitizeCapture(captureRoot, outputRoot);
  console.log(JSON.stringify({ files: result.files.length, format: result.format }, null, 2));
}

export { describeValue, sanitizeCapture, sanitizeValue };
