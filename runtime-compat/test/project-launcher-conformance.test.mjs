import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const backend = await readFile(new URL("../../local-player/backend/box3-server.cjs", import.meta.url), "utf8");

test("project package identity controls Player launcher and shell routes", () => {
  for (const marker of [
    "matchesLauncherPath(path)",
    "path === `/play/${this.gameName}`",
    "const source = `/p/${this.gameName}?contentId=",
    "gameName: this.gameName",
    "clientRuntime.bindProjectIdentity(projectWorld.project.manifest.packageId",
  ]) assert.ok(backend.includes(marker), `missing project launcher marker: ${marker}`);
});
