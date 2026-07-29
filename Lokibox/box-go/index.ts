#!/usr/bin/env bun

const commands: Record<string, { description: string; module: string }> = {
  proxy: { description: "start the WebSocket protocol proxy", module: "./proxy.ts" },
  connect: { description: "connect with the mudb client", module: "./connect.ts" },
  listen: { description: "listen and decode raw WebSocket frames", module: "./listen.ts" },
  raw: { description: "connect and print raw WebSocket traffic", module: "./raw-connect.ts" },
  test: { description: "run the local client/server protocol test", module: "./test-client.ts" },
  vec3: { description: "run the vector schema smoke test", module: "./vec3-test.ts" },
}

function printHelp(): void {
  console.log("Box-GO - Box3 mudb protocol toolkit\n")
  console.log("Usage: bun run index.ts <command>\n")
  for (const [name, command] of Object.entries(commands)) {
    console.log(`  ${name.padEnd(8)} ${command.description}`)
  }
  console.log("\nEnvironment variables:")
  console.log("  BOX3_WS_URL  WebSocket URL used by connect/listen/raw")
  console.log("  BOX3_SESSION  Box3 session id used by connect/listen")
  console.log("  BOX3_PROXY_PORT  Local proxy port (default: 8080)")
}

const command = Bun.argv[2] ?? "help"
if (command === "help" || command === "--help" || command === "-h") {
  printHelp()
} else if (commands[command]) {
  await import(commands[command].module)
} else {
  console.error(`Unknown command: ${command}\n`)
  printHelp()
  process.exitCode = 1
}
