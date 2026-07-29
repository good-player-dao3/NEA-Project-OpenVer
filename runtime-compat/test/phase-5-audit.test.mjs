import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const audit = JSON.parse(await readFile(new URL("../generated/phase-5-audit.json", import.meta.url), "utf8"));

test("phase 5 audit covers every objective requirement", () => {
  assert.deepEqual(audit.requirements.map(requirement => requirement.id), [
    "layered-architecture",
    "machine-readable-api-abi",
    "player-standing-body",
    "player-posture-shapes",
    "terrain-contact-rules",
    "version-capability-conformance",
    "demo-contract-bindings",
    "gap-report",
  ]);
  assert.equal(audit.requirements.filter(requirement => requirement.status === "complete").length, 7);
  const apiAbi = audit.requirements.find(requirement => requirement.id === "machine-readable-api-abi");
  assert.equal(apiAbi.status, "complete");
  assert.ok(apiAbi.evidence.some(item => item.path === "runtime-compat/generated/api-abi-completeness.json" && item.finding.status === "complete"));
});

test("audit does not claim completion without authoritative posture deltas", () => {
  assert.equal(audit.overallStatus, "partial");
  const posture = audit.requirements.find(requirement => requirement.id === "player-posture-shapes");
  assert.equal(posture.status, "partial");
  assert.match(posture.remaining[0], /PUBLIC body delta/);
  assert.match(audit.policy, /no substitute values/);
});
