const { createHash } = require("node:crypto");
const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const BASE_SHA256 = "d35b3db79e93c03021fcb0ad62bf20d89e4bef470553bff17be6c9e3a61cc097";
const TARGET_SHA256 = "ab169d4ffcb93dd239dad255b0c6fa895e43815af2c7cadba1276e6bcfa30241";

function applyBackendCompatPatch(bundlePath) {
  const source = readFileSync(bundlePath, "utf8");
  assertHash(source, BASE_SHA256, "backend compatibility patch baseline");
  const patch = readFileSync(join(__dirname, "backend-compat.patch"), "utf8");
  const output = applyUnifiedPatch(source, patch);
  assertHash(output, TARGET_SHA256, "backend compatibility patch output");
  writeFileSync(bundlePath, output);
}

function applyUnifiedPatch(source, patch) {
  const sourceLines = source.split("\n");
  const patchLines = patch.replace(/\r\n/g, "\n").split("\n");
  const output = [];
  let sourceIndex = 0;
  let patchIndex = 0;
  while (patchIndex < patchLines.length && !patchLines[patchIndex].startsWith("@@ ")) patchIndex += 1;
  while (patchIndex < patchLines.length) {
    const header = patchLines[patchIndex++];
    const match = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(header);
    if (!match) throw new Error(`Invalid backend compatibility hunk: ${header}`);
    const oldCount = Number(match[2] ?? 1);
    const oldStart = oldCount === 0 ? Number(match[1]) : Number(match[1]) - 1;
    while (sourceIndex < oldStart) output.push(sourceLines[sourceIndex++]);
    let consumed = 0;
    while (patchIndex < patchLines.length && !patchLines[patchIndex].startsWith("@@ ")) {
      const line = patchLines[patchIndex++];
      if (line.startsWith("diff --git ") || line.startsWith("--- ") || line.startsWith("+++ ")) continue;
      if (line === "\\ No newline at end of file") continue;
      const marker = line[0];
      const value = line.slice(1);
      if (marker === " ") {
        assertLine(sourceLines, sourceIndex, value);
        output.push(sourceLines[sourceIndex++]);
        consumed += 1;
      } else if (marker === "-") {
        assertLine(sourceLines, sourceIndex, value);
        sourceIndex += 1;
        consumed += 1;
      } else if (marker === "+") {
        output.push(value);
      } else if (line !== "") {
        throw new Error(`Invalid backend compatibility patch line: ${line}`);
      }
    }
    if (consumed !== oldCount) throw new Error(`Backend compatibility hunk consumed ${consumed} lines, expected ${oldCount}`);
  }
  output.push(...sourceLines.slice(sourceIndex));
  return output.join("\n");
}

function assertLine(lines, index, expected) {
  if (lines[index] !== expected) {
    throw new Error(`Backend compatibility patch mismatch at line ${index + 1}`);
  }
}

function assertHash(value, expected, label) {
  const actual = createHash("sha256").update(value).digest("hex");
  if (actual !== expected) throw new Error(`${label} hash mismatch: expected ${expected}, received ${actual}`);
}

module.exports = { applyBackendCompatPatch, applyUnifiedPatch };
