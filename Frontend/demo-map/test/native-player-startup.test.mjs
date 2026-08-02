import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("native Player starts from an isolated build root and serves the client script", { timeout: 30_000 }, async () => {
  const playerPort = await freePort();
  const controlPort = await freePort();
  const buildRoot = await mkdtemp(join(tmpdir(), "nea-native-player-"));
  const child = spawn(process.execPath, ["src/server.mjs"], {
    cwd: join(process.cwd(), "Frontend", "demo-map"),
    env: {
      ...process.env,
      NEA_DEMO_PORT: String(playerPort),
      NEA_DEMO_CONTROL_PORT: String(controlPort),
      NEA_DEMO_BUILD_ROOT: buildRoot,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", chunk => { output += chunk; });
  child.stderr.on("data", chunk => { output += chunk; });
  try {
    const status = await waitForStatus(playerPort);
    assert.equal(status.world, "project-package-v1");
    assert.deepEqual(status.clientScriptModules, ["clientIndex.js"]);
    assert.equal(status.localClient.pagePath, "/p/local-bedwars");
    assert.ok(status.protocols.includes("remote-channel"));
    const page = await fetch(`http://127.0.0.1:${playerPort}/play/nea-script-lab?contentId=100110008`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /id="GameIframe"/);
  } catch (error) {
    error.message += `\n${output.slice(-4000)}`;
    throw error;
  } finally {
    stopProcessTree(child);
    await rm(buildRoot, { recursive: true, force: true });
  }
});

test("native Player derives the launcher route from an imported Showcase id", { timeout: 30_000 }, async () => {
  const playerPort = await freePort();
  const controlPort = await freePort();
  const buildRoot = await mkdtemp(join(tmpdir(), "nea-showcase-player-"));
  const sourceRoot = join(process.cwd(), "Frontend", "demo-map", "showcase");
  const child = spawn(process.execPath, ["src/server.mjs"], {
    cwd: join(process.cwd(), "Frontend", "demo-map"),
    env: {
      ...process.env,
      NEA_DEMO_PORT: String(playerPort),
      NEA_DEMO_CONTROL_PORT: String(controlPort),
      NEA_DEMO_BUILD_ROOT: buildRoot,
      NEA_DEMO_SOURCE_ROOT: sourceRoot,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", chunk => { output += chunk; });
  child.stderr.on("data", chunk => { output += chunk; });
  try {
    const status = await waitForStatus(playerPort);
    assert.equal(status.localClient.pagePath, "/p/local-bedwars");
    const page = await fetch(`http://127.0.0.1:${playerPort}/play/nea-capability-showcase?contentId=100110008`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /id="GameIframe"/);
    assert.match(output, /Player: http:\/\/127\.0\.0\.1:\d+\/play\/nea-capability-showcase\?contentId=100110008/);
  } catch (error) {
    error.message += `\n${output.slice(-4000)}`;
    throw error;
  } finally {
    stopProcessTree(child);
    await rm(buildRoot, { recursive: true, force: true });
  }
});

async function waitForStatus(port) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/status`);
      if (response.ok) return response.json();
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error("Native Player status endpoint did not become ready");
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

function stopProcessTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") {
    try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
    return;
  }
  child.kill("SIGTERM");
}
