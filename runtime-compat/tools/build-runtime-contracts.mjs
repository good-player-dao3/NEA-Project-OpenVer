import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(root, "..");
const current = JSON.parse(await readFile(resolve(root, "abi", "current-runtime.json"), "utf8"));
const protocols = JSON.parse(await readFile(resolve(root, "abi", "protocols.json"), "utf8"));
const serverObjectModel = JSON.parse(await readFile(resolve(root, "abi", "server-object-model.json"), "utf8"));
const runtimeEntityAdapters = JSON.parse(await readFile(resolve(root, "abi", "runtime-entity-adapter-map.json"), "utf8"));
const runtimePlayerAdapters = JSON.parse(await readFile(resolve(root, "abi", "runtime-player-adapter-map.json"), "utf8"));
const contactEventModel = JSON.parse(await readFile(resolve(root, "abi", "contact-event-model.json"), "utf8"));
const scriptRuntimeBoundaries = JSON.parse(await readFile(resolve(root, "abi", "script-runtime-boundaries.json"), "utf8"));
const playerPosture = JSON.parse(await readFile(resolve(root, "abi", "physics-player-posture.json"), "utf8"));
const compatibilityMatrix = JSON.parse(await readFile(resolve(root, "abi", "compatibility-matrix.json"), "utf8"));
const sharedRuntime = JSON.parse(await readFile(resolve(root, "generated", "local-shared-runtime-analysis.json"), "utf8"));
const projectPath = "demo-map/project/nea.map.json";
const clientScriptPath = "demo-map/project/scripts/client.js";
const serverScriptPath = "demo-map/project/scripts/server.js";
const projectSource = await readFile(resolve(repositoryRoot, projectPath), "utf8");
const clientSource = await readFile(resolve(repositoryRoot, clientScriptPath), "utf8");
const serverSource = await readFile(resolve(repositoryRoot, serverScriptPath), "utf8");
const project = JSON.parse(projectSource);

const entriesBySide = groupBy(current.entries.filter(entry => ["client", "server"].includes(entry.side)), entry => entry.side);
const contracts = [
  scriptContract("dao3-client-runtime/v1", "client", "historical-player-ses", "native", entriesBySide.client ?? []),
  scriptContract("nea-server-runtime/v1", "server", "local-vm-script-runtime", "experimental", entriesBySide.server ?? []),
];
const contractById = new Map(contracts.map(contract => [contract.id, contract]));
const observedUsage = {
  client: analyzeUsage("client", clientSource, clientUsageRules()),
  server: analyzeUsage("server", serverSource, serverUsageRules()),
};
const demoBindings = [
  resolveBinding("client", project.runtime.clientContract, project.scripts.clientCapabilities, observedUsage.client),
  resolveBinding("server", project.runtime.serverContract, project.scripts.serverCapabilities, observedUsage.server),
];

for (const binding of demoBindings) {
  if (!binding.resolved) throw new Error(`${binding.side} Demo runtime binding is unresolved: ${binding.errors.join("; ")}`);
}

const remoteProtocol = protocols.protocols.find(protocol => protocol.id === "player.remote-channel");
const gameNetProtocol = protocols.protocols.find(protocol => protocol.id === "player.game-net");
if (!remoteProtocol || !gameNetProtocol) throw new Error("Required Player MuDB protocols were not found");

const architecture = {
  format: "nea-runtime-architecture-contract",
  version: 1,
  generatedAt: new Date().toISOString(),
  apiVersion: project.runtime.apiVersion,
  compatibilityLevel: project.runtime.compatibilityLevel,
  layers: [
    layer("project-package", "data", "Loads exported world data, assets, scripts, requested contracts and capabilities without granting implementation access directly.", ["dao3-project/v1"], [projectPath, "demo-map/src/import-project.mjs"]),
    layer("client-script-runtime", "execution", "Runs clientIndex.js in the archived Player SES Compartment with client-only globals.", ["dao3-client-runtime/v1"], ["runtime-compat/generated/player-client-script-runtime-analysis.json"]),
    layer("server-script-runtime", "execution", "Runs the authoritative map script in an isolated VM and gates every implemented mutation or event API by server capability.", ["nea-server-runtime/v1"], ["demo-map/src/runtime/script-runtime.mjs", "runtime-compat/generated/local-server-runtime-analysis.json", "runtime-compat/abi/server-object-model.json", "runtime-compat/abi/runtime-entity-adapter-map.json", "runtime-compat/abi/runtime-player-adapter-map.json"]),
    layer("mudb-transport", "transport", "Serializes recovered protocol envelopes and preserves message direction without interpreting map payloads.", ["mudb-transport/v1", "nea-protocol-abi/v1"], ["runtime-compat/abi/protocols.json"]),
    layer("authoritative-game-runtime", "state", "Owns ticks, players, rigid bodies and accepted state transitions used to produce PUBLIC network state.", ["nea-authoritative-runtime/v1"], ["local-player/backend/box3-server.cjs", "runtime-compat/generated/player-network-body-analysis.json"]),
  ],
  contracts,
  compatibilityMatrix: {
    path: "runtime-compat/abi/compatibility-matrix.json",
    declarations: compatibilityMatrix.summary.entries,
    executable: compatibilityMatrix.summary.executable,
    byStatus: compatibilityMatrix.summary.byStatus,
  },
  scriptRuntimes: {
    boundaries: "runtime-compat/abi/script-runtime-boundaries.json",
    invariant: scriptRuntimeBoundaries.invariant,
    runtimes: scriptRuntimeBoundaries.runtimes.map(runtime => ({
      id: runtime.id,
      side: runtime.side,
      engine: runtime.engine,
      provider: runtime.provider,
    })),
  },
  objectModels: {
    server: {
      canonical: "runtime-compat/abi/server-object-model.json",
      playerRepresentation: serverObjectModel.playerComposition.representation,
      classicalPlayerInheritance: serverObjectModel.playerComposition.classicalInheritance,
      localAdapters: [
        { object: runtimeEntityAdapters.localObject.id, map: "runtime-compat/abi/runtime-entity-adapter-map.json", status: runtimeEntityAdapters.localObject.status },
        { object: runtimePlayerAdapters.localObject.id, map: "runtime-compat/abi/runtime-player-adapter-map.json", status: runtimePlayerAdapters.localObject.status },
      ],
    },
  },
  sharedValues: {
    catalog: "runtime-compat/abi/shared-runtime.json",
    provider: "local-shared-compatibility-runtime",
    capability: "shared.math",
    executableEntries: sharedRuntime.entries.length,
    confirmedGameVector3Entries: sharedRuntime.summary.confirmedCanonical,
    partialGameVector3Entries: sharedRuntime.summary.partialCanonical,
  },
  contactEvents: {
    model: "runtime-compat/abi/contact-event-model.json",
    canonicalEvents: contactEventModel.canonicalEvents.map(event => ({ id: event.id, localStatus: event.localStatus })),
    forceStatus: contactEventModel.force.status,
    packedVoxelAxisStatus: contactEventModel.axis.status,
    authoritativeStateStatus: contactEventModel.authoritativeState.status,
    conformance: contactEventModel.authoritativeState.conformance,
  },
  transport: {
    id: "mudb-transport/v1",
    protocolAbi: "nea-protocol-abi/v1",
    requiredProtocols: [gameNetProtocol.id, remoteProtocol.id],
    remoteChannelEnvelope: { fields: ["tick", "args"], argsEncoding: "JSON-text" },
  },
  authoritativeRuntime: {
    id: "nea-authoritative-runtime/v1",
    bodyProfileRequired: true,
    bodyProfileSizeStatus: "confirmed",
    publicStateUsesExplicitHalfExtents: true,
    postureAbi: "runtime-compat/abi/physics-player-posture.json",
    postureShapeStatus: {
      standing: playerPosture.standing.status,
      crouching: playerPosture.crouching.authoritativeShape.status,
      flying: playerPosture.flying.authoritativeShape.status,
    },
    postureShapeCompatibilityPolicy: playerPosture.compatibilityPolicy,
  },
  flows: [
    flow("client-module-delivery", "authoritative-game-runtime", "client-script-runtime", "player.game-net.syncClientScriptModules", "Dictionary of module source; entry clientIndex.js"),
    flow("client-event", "client-script-runtime", "server-script-runtime", "player.remote-channel.sendServerEvent", "MuDB {tick,args}; args is JSON text"),
    flow("server-event", "server-script-runtime", "client-script-runtime", "player.remote-channel.sendClientEvent", "MuDB {tick,args}; malformed JSON is dropped by Player"),
    flow("authoritative-state", "server-script-runtime", "authoritative-game-runtime", "nea-control.player-state", "Versioned position and velocity command"),
    flow("public-state", "authoritative-game-runtime", "client-script-runtime", "player.game-net.PUBLIC", "Player and RigidBody snapshots with explicit half extents"),
  ],
  demo: {
    project: sourceDescriptor(projectPath, projectSource),
    scripts: {
      client: sourceDescriptor(clientScriptPath, clientSource),
      server: sourceDescriptor(serverScriptPath, serverSource),
    },
    bindings: demoBindings,
  },
};

await writeFile(resolve(root, "abi", "runtime-contracts.json"), `${JSON.stringify(architecture, null, 2)}\n`);
console.log(`Built runtime architecture contract with ${architecture.layers.length} layers and ${contracts.length} script contracts.`);

function scriptContract(id, side, provider, compatibilityLevel, entries) {
  const capabilityEntries = groupBy(entries.filter(entry => entry.capability), entry => entry.capability);
  const capabilities = Object.entries(capabilityEntries).map(([capabilityId, values]) => {
    if (!capabilityId.startsWith(`${side}.`)) throw new Error(`${side} capability is not side-qualified: ${capabilityId}`);
    return {
      id: capabilityId,
      availability: weakestAvailability(values),
      compatibility: weakestCompatibility(values),
      entries: values.map(entry => entry.id).sort(),
    };
  }).sort((left, right) => left.id.localeCompare(right.id));
  return {
    id,
    side,
    apiVersion: "0.1.0",
    provider,
    compatibilityLevel,
    capabilities,
    uncategorizedEntries: entries.filter(entry => !entry.capability).map(entry => entry.id).sort(),
  };
}

function resolveBinding(side, contractId, requestedCapabilities, usage) {
  const contract = contractById.get(contractId);
  const available = new Map((contract?.capabilities ?? []).map(capability => [capability.id, capability]));
  const errors = [];
  if (!contract) errors.push(`unknown contract ${contractId}`);
  for (const capability of requestedCapabilities) {
    if (!capability.startsWith(`${side}.`)) errors.push(`cross-side or unqualified capability ${capability}`);
    if (!available.has(capability)) errors.push(`capability is not implemented by ${contractId}: ${capability}`);
  }
  const missingDeclarations = usage.requiredCapabilities.filter(capability => !requestedCapabilities.includes(capability));
  for (const capability of missingDeclarations) errors.push(`script uses undeclared capability ${capability}`);
  return {
    side,
    contract: contractId,
    requestedCapabilities,
    observedUsage: usage,
    resolvedEntries: requestedCapabilities.flatMap(capability => available.get(capability)?.entries ?? []).sort(),
    errors,
    resolved: errors.length === 0,
  };
}

function analyzeUsage(side, source, rules) {
  const matches = rules.filter(rule => rule.pattern.test(source)).map(rule => ({ capability: rule.capability, evidence: rule.evidence }));
  return {
    side,
    requiredCapabilities: [...new Set(matches.map(match => match.capability))].sort(),
    evidence: matches,
  };
}

function clientUsageRules() {
  return [
    { capability: "client.core", pattern: /\bconsole\./, evidence: "console.*" },
    { capability: "client.ui", pattern: /\b(?:ui|Ui[A-Z]\w*|Vec[23])\b/, evidence: "ui / Ui* / Vec*" },
    { capability: "client.remote-channel", pattern: /\bremoteChannel\./, evidence: "remoteChannel.*" },
  ];
}

function serverUsageRules() {
  return [
    { capability: "server.world.events", pattern: /\bworld\.(?:on|next|currentTick)/, evidence: "world event/tick access" },
    { capability: "server.world.chat", pattern: /\bworld\.say\b|\.sendMessage\s*\(/, evidence: "world.say/player.sendMessage" },
    { capability: "server.world.entities", pattern: /\bworld\.(?:querySelector|querySelectorAll|createEntity)\b/, evidence: "world entity query/create" },
    { capability: "server.player", pattern: /\bplayer\.(?:id|name|position|velocity|grounded|health|snapshot)\b/, evidence: "RuntimePlayer read" },
    { capability: "server.player.write", pattern: /\bplayer\.(?:name|position|velocity)\s*=|\bplayer\.(?:applyImpulse|damage)\s*\(/, evidence: "RuntimePlayer mutation" },
    { capability: "server.remote-channel", pattern: /\bremoteChannel\./, evidence: "remoteChannel.*" },
  ];
}

function layer(id, category, responsibility, contracts, evidence) {
  return { id, category, responsibility, contracts, evidence };
}

function flow(id, from, to, protocol, payload) {
  return { id, from, to, protocol, payload };
}

function sourceDescriptor(path, source) {
  return { path, bytes: Buffer.byteLength(source), sha256: createHash("sha256").update(source).digest("hex") };
}

function groupBy(values, selectKey) {
  return values.reduce((groups, value) => {
    const key = selectKey(value);
    (groups[key] ??= []).push(value);
    return groups;
  }, {});
}

function weakestAvailability(entries) {
  const rank = { unsupported: 0, unknown: 1, declared: 2, partial: 3, confirmed: 4 };
  return entries.reduce((weakest, entry) => rank[entry.availability] < rank[weakest] ? entry.availability : weakest, "confirmed");
}

function weakestCompatibility(entries) {
  const rank = { missing: 0, emulated: 1, bridged: 2, native: 3 };
  return entries.reduce((weakest, entry) => rank[entry.compatibility] < rank[weakest] ? entry.compatibility : weakest, "native");
}
