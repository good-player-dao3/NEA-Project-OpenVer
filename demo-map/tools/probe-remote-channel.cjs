const { existsSync, readdirSync } = require("node:fs");
const { join, resolve } = require("node:path");
const { pathToFileURL } = require("node:url");
const { spawnSync } = require("node:child_process");

const gamingRoot = resolve(__dirname, "../../..");
const legacyRoot = resolve(process.argv[2] ?? process.env.NEA_LEGACY_ROOT ?? findLegacyRoot(gamingRoot));
const loader = pathToFileURL(join(legacyRoot, "node_modules/tsx/dist/loader.mjs")).href;
const probe = join(__dirname, "probe-remote-channel.mjs");
const result = spawnSync(process.execPath, ["--import", loader, probe, legacyRoot], {
  cwd: resolve(__dirname, ".."),
  env: process.env,
  stdio: "inherit",
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;

function findLegacyRoot(root) {
  const match = readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => join(root, entry.name))
    .find(path => existsSync(join(path, "legacy/box3-compat/src/wire/protocols.ts")) && existsSync(join(path, "node_modules/tsx")));
  if (!match) throw new Error("Pass the local legacy project root as the first argument or NEA_LEGACY_ROOT");
  return match;
}
