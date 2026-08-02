import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

const RESPONSE_INDEX_PATH = ["network", "response-bodies.jsonl"];
const REQUIRED_MIME_TYPE = "application/octet-stream";

export async function readCapturedVoxelChunkBodies(captureRoot, entries) {
  const root = resolve(captureRoot);
  const rows = await readResponseBodyIndex(resolve(root, ...RESPONSE_INDEX_PATH));
  return resolveVoxelChunkBodies({
    entries,
    responseRows: rows,
    bodyRoot: root,
  });
}

export async function resolveVoxelChunkBodies({ entries, responseRows, bodyRoot }) {
  const requestedEntries = validateEntries(entries);
  if (!Array.isArray(responseRows)) throw new TypeError("Response rows must be an array");
  const root = resolve(bodyRoot);
  const candidates = indexChunkResponses(requestedEntries, responseRows);
  const chunks = new Map();
  for (const entry of requestedEntries) {
    const match = candidates.get(entry);
    if (!match) throw new Error(`Voxel chunk entry has no captured response: ${entry}`);
    const bodyPath = resolveBodyPath(root, match.file);
    const bytes = await readFile(bodyPath);
    if (bytes.byteLength !== match.bytes) throw new Error(`Voxel chunk response body size mismatch: ${entry}`);
    chunks.set(entry, bytes);
  }
  return chunks;
}

async function readResponseBodyIndex(path) {
  const text = await readFile(path, "utf8");
  const rows = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (line === "") continue;
    try {
      rows.push(JSON.parse(line));
    } catch (error) {
      throw new Error(`Invalid response body index row ${index + 1}: ${error.message}`);
    }
  }
  return rows;
}

function validateEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) throw new TypeError("Voxel chunk entries must be a non-empty array");
  if (!entries.every(entry => typeof entry === "string" && /^[A-Za-z0-9_-]+$/.test(entry))) {
    throw new TypeError("Voxel chunk entries must use the observed opaque identifier alphabet");
  }
  return [...new Set(entries)];
}

function indexChunkResponses(entries, rows) {
  const entrySet = new Set(entries);
  const matches = new Map();
  for (const row of rows) {
    const entry = chunkEntryFromResponse(row);
    if (entry === null || !entrySet.has(entry)) continue;
    const normalized = validateResponseRow(row, entry);
    const previous = matches.get(entry);
    if (previous && (previous.file !== normalized.file || previous.bytes !== normalized.bytes)) {
      throw new Error(`Voxel chunk entry has conflicting captured responses: ${entry}`);
    }
    matches.set(entry, normalized);
  }
  return matches;
}

function chunkEntryFromResponse(row) {
  if (row === null || typeof row !== "object" || typeof row.url !== "string") return null;
  let url;
  try {
    url = new URL(row.url);
  } catch {
    return null;
  }
  const entry = url.pathname.split("/").filter(Boolean).at(-1);
  return entry ? decodeURIComponent(entry) : null;
}

function validateResponseRow(row, entry) {
  if (row.status !== 200) throw new Error(`Voxel chunk response is not HTTP 200: ${entry}`);
  if (row.mimeType !== REQUIRED_MIME_TYPE) throw new Error(`Voxel chunk response is not binary: ${entry}`);
  if (typeof row.file !== "string" || row.file === "") throw new Error(`Voxel chunk response file is missing: ${entry}`);
  if (!Number.isSafeInteger(row.bytes) || row.bytes < 0) throw new Error(`Voxel chunk response byte count is invalid: ${entry}`);
  return { file: row.file, bytes: row.bytes };
}

function resolveBodyPath(root, file) {
  if (isAbsolute(file)) throw new Error("Voxel chunk response file must be relative");
  const path = resolve(root, file);
  const local = relative(root, path);
  if (local === "" || local === ".." || local.startsWith("..\\") || isAbsolute(local)) {
    throw new Error("Voxel chunk response file escapes the capture body directory");
  }
  return path;
}
