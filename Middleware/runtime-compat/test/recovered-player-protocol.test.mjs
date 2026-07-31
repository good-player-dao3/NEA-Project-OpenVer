import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { register } from "node:module";
import test from "node:test";

register(new URL("../../../Backend/local-player/tools/legacy-ts-loader.mjs", import.meta.url), import.meta.url);

test("recovered player protocol evidence loads independently", async () => {
  const module = await import(new URL("../evidence/recovered-player-protocol.ts", import.meta.url));
  const protocols = Object.values(module).filter(value => value?.name && value.client && value.server);

  assert.equal(protocols.length, 20);
  assert.ok(protocols.some(protocol => protocol.name === "remote-channel"));
});

test("ABI scanner defaults to recovered player protocol evidence", async () => {
  const scanner = await readFile(new URL("../../../Backend/local-player/tools/scan-runtime-abi.mjs", import.meta.url), "utf8");

  assert.match(scanner, /runtime-compat\/evidence\/recovered-player-protocol\.ts/);
  assert.doesNotMatch(scanner, /Lokibox|box-go/);
});
