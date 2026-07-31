import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const mudbRoot = join(repoRoot, "mudb");
const toolchainRoot = join(repoRoot, "tools", ".mudb-toolchain");

// Pinned inside the range mudb already declares (typescript ^3.7.4, @types/node ^8.10.38).
const TYPESCRIPT_VERSION = "3.9.10";
const TYPES_NODE_VERSION = "8.10.66";

// local-player/src/block-info.mjs requires mudb/schema and mudb/stream; nothing else is consumed,
// and the remaining layers need dev dependencies (tape, ws, webworkify) that this repo does not vendor.
const LAYERS = ["schema", "stream"];

function fail(message) {
  console.error(`[mudb] ${message}`);
  process.exit(1);
}

function collect(dir, extension, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name !== "test" && entry.name !== "bench") collect(join(dir, entry.name), extension, files);
    } else if (entry.name.endsWith(extension)) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

function newestMtime(files) {
  return files.reduce((newest, file) => Math.max(newest, statSync(file).mtimeMs), 0);
}

function outputState() {
  const missing = LAYERS.filter(layer => !existsSync(join(mudbRoot, layer, "index.js")));
  if (missing.length > 0) return { built: false, reason: `${missing.map(layer => `${layer}/index.js`).join(", ")} not emitted` };

  const emitted = LAYERS.flatMap(layer => collect(join(mudbRoot, layer), ".js"));
  const sources = LAYERS.flatMap(layer => collect(join(mudbRoot, "src", layer), ".ts"));
  const oldestOutput = Math.min(...emitted.map(file => statSync(file).mtimeMs));
  if (oldestOutput < newestMtime(sources)) return { built: false, reason: "emitted files are older than mudb/src" };

  return { built: true };
}

function resolveCompiler() {
  for (const root of [mudbRoot, toolchainRoot]) {
    const entry = join(root, "node_modules", "typescript", "bin", "tsc");
    if (existsSync(entry)) return { root, entry };
  }
  return null;
}

function installToolchain() {
  mkdirSync(toolchainRoot, { recursive: true });
  // A private manifest keeps npm from resolving mudb's own runtime dependencies, which build native code.
  writeFileSync(join(toolchainRoot, "package.json"), `${JSON.stringify({
    name: "nea-mudb-toolchain",
    version: "0.0.0",
    private: true,
    description: "Pinned TypeScript compiler for the vendored mudb schema/stream layer.",
    dependencies: { "@types/node": TYPES_NODE_VERSION, typescript: TYPESCRIPT_VERSION },
  }, null, 2)}\n`);

  console.log(`[mudb] installing typescript@${TYPESCRIPT_VERSION} into tools/.mudb-toolchain`);
  const install = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["install", "--no-audit", "--no-fund", "--ignore-scripts"], {
    cwd: toolchainRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (install.status !== 0) fail("could not install the TypeScript toolchain; the first build needs network access");
}

function writeProjectConfig(typeRoot) {
  mkdirSync(toolchainRoot, { recursive: true });
  const configPath = join(toolchainRoot, "tsconfig.mudb.json");
  // Absolute paths keep the generated project independent of where the toolchain lives.
  writeFileSync(configPath, `${JSON.stringify({
    extends: join(mudbRoot, "tsconfig.json"),
    compilerOptions: {
      rootDir: join(mudbRoot, "src"),
      outDir: mudbRoot,
      typeRoots: [typeRoot],
      types: ["node"],
    },
    include: LAYERS.map(layer => join(mudbRoot, "src", layer, "**", "*")),
    exclude: ["test", "bench"].map(name => join(mudbRoot, "src", "**", name, "**")),
  }, null, 2)}\n`);
  return configPath;
}

function build() {
  let compiler = resolveCompiler();
  if (!compiler) {
    installToolchain();
    compiler = resolveCompiler();
    if (!compiler) fail("the TypeScript toolchain is still missing after installation");
  }

  const configPath = writeProjectConfig(join(compiler.root, "node_modules", "@types"));
  const compile = spawnSync(process.execPath, [compiler.entry, "-p", configPath], { cwd: mudbRoot, stdio: "inherit" });
  if (compile.status !== 0) fail("tsc could not build the mudb schema/stream layer");

  const state = outputState();
  if (!state.built) fail(`tsc reported success but ${state.reason}`);
}

const state = outputState();
if (state.built && !process.argv.includes("--force")) {
  console.log(`[mudb] schema/stream already built`);
} else if (process.argv.includes("--check")) {
  fail(`schema/stream not built: ${state.reason}; run "node tools/build-mudb.mjs"`);
} else {
  build();
  console.log(`[mudb] built ${LAYERS.map(layer => `${layer}/index.js`).join(" and ")} for local-player/src/block-info.mjs`);
}
