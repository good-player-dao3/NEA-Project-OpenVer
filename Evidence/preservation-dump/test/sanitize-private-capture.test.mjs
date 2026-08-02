import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { sanitizeCapture } from "../sanitize-private-capture.mjs";

test("publishes schemas and redacted descriptors without private paths or values", async () => {
  const root = await mkdtemp(join(tmpdir(), "nea-sanitize-"));
  const output = await mkdtemp(join(tmpdir(), "nea-sanitized-"));
  try {
    await writeFile(join(root, "manifest.json"), JSON.stringify({ projectId: "private-map", token: "secret-token", version: 3 }));
    await mkdir(join(root, "manual-cdp", "project"), { recursive: true });
    await writeFile(join(root, "manual-cdp", "project", "project.json"), JSON.stringify({ world: { name: "private-world" }, scripts: "private script" }));
    await writeFile(join(root, "scripts.json"), JSON.stringify({ source: "private script text", events: ["pointer-lock"] }));
    await writeFile(join(root, "response-bodies.json"), JSON.stringify({ payload: "private response" }));
    const result = await sanitizeCapture(root, output);
    assert.equal(result.format, "nea-sanitized-private-evidence");
    assert.equal(result.files.length, 2);
    assert.ok(result.fieldInventory.some(field => field.path === "projectId"));
    assert.ok(result.fieldInventory.some(field => field.path === "<redacted-key>"));
    assert.equal(result.files.filter(file => file.kind === "descriptor").length, 2);
    const descriptor = result.files.find(file => file.kind === "descriptor");
    const sanitized = JSON.parse(await readFile(join(output, descriptor.sanitizedFile), "utf8"));
    assert.equal(sanitized.projectId, "<redacted-string:11>");
    assert.equal(sanitized["<redacted-key>"], "<redacted>");
    assert.equal(sanitized.version, 3);
    assert.doesNotMatch(JSON.stringify(sanitized), /private-map|secret-token|private script text/);
    assert.equal(JSON.stringify(result).includes(root.replaceAll("\\", "/")), false);
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(output, { recursive: true, force: true });
  }
});

test("excludes private capture payload directories", async () => {
  const root = await mkdtemp(join(tmpdir(), "nea-sanitize-"));
  const output = await mkdtemp(join(tmpdir(), "nea-sanitized-"));
  try {
    await writeFile(join(root, "manifest.json"), "{}");
    await mkdir(join(root, "manual-cdp", "network"), { recursive: true });
    await writeFile(join(root, "manual-cdp", "network", "project.json"), "{}");
    await writeFile(join(root, "scripts.json"), "{}");
    const result = await sanitizeCapture(root, output);
    assert.equal(result.files.length, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(output, { recursive: true, force: true });
  }
});
