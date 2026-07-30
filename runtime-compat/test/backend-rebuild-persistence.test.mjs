import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const backendUrl = new URL("../../local-player/backend/box3-server.cjs", import.meta.url);
const bundleToolUrl = new URL("../../local-player/tools/bundle-backend.cjs", import.meta.url);
const applyToolUrl = new URL("../../local-player/tools/apply-backend-compat-patch.cjs", import.meta.url);
const patchUrl = new URL("../../local-player/tools/backend-compat.patch", import.meta.url);

const backend = await readFile(backendUrl, "utf8");
const bundleTool = await readFile(bundleToolUrl, "utf8");
const applyTool = await readFile(applyToolUrl, "utf8");
const patch = await readFile(patchUrl, "utf8");

test("backend rebuild applies the audited compatibility patch after generic RemoteChannel", () => {
  const genericIndex = bundleTool.indexOf("patchGenericRemoteChannelBundle(process.argv[4])");
  const compatIndex = bundleTool.indexOf("applyBackendCompatPatch(process.argv[4])");
  assert.notEqual(genericIndex, -1);
  assert.ok(compatIndex > genericIndex);
  assert.match(applyTool, /backend compatibility patch baseline/);
  assert.match(applyTool, /backend compatibility patch output/);
});

test("audited backend target hash matches the checked-in runtime bundle", () => {
  const expected = /const TARGET_SHA256 = "([0-9a-f]{64})";/.exec(applyTool)?.[1];
  assert.ok(expected);
  assert.equal(createHash("sha256").update(backend).digest("hex"), expected);
});

test("compatibility patch persists recovered UI, Dialog, and player-network behavior", () => {
  assert.match(patch, /loadClientUiState/);
  assert.match(patch, /BOX3_CLIENT_UI_MANIFEST/);
  assert.match(patch, /BOX3_PLAYER_BODY_PROFILE/);
  assert.match(patch, /normalizeDialogConfig/);
  assert.match(patch, /response\.catch\(\(\) =>/);
  assert.match(patch, /GuiSessions/);
  assert.match(patch, /__nea\/control\/gui-command/);
  assert.match(patch, /resolveSessionLabel/);
  assert.match(patch, /MuQuantizedVec3/);
  assert.match(patch, /BOX3_LOG_SCRIPT_INPUT_EVENTS/);
  assert.match(patch, /\[game-net:input\]/);
  assert.match(patch, /\[game-net:entity-map\]/);
  assert.match(patch, /meshHashes\.length < 117/);
  assert.match(patch, /scale: requireVector\(record\.scale/);
  assert.match(patch, /model\.scale !== void 0\) requireVector2\(model\.scale/);
  assert.match(patch, /normalizeVector\(entity\.model\.scale \?\? \[1, 1, 1\], "entity model scale"\)/);
});

test("runtime model projection accepts captured zero scale used by hidden entities", () => {
  assert.match(backend, /normalizeVector\(entity\.model\.scale \?\? \[1, 1, 1\], "entity model scale"\)/);
  assert.doesNotMatch(backend, /normalizePositiveVector\(entity\.model\.scale/);
});
