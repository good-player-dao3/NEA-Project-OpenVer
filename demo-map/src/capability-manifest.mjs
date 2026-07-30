const ROOT_OWNERS = Object.freeze({
  server: Object.freeze({ world: "GameWorld", voxels: "GameVoxels", storage: "GameStorage", gui: "GameGUI", remoteChannel: "remoteChannel" }),
  client: Object.freeze({ input: "ClientInput", screen: "ClientScreen", ui: "UiNode", remoteChannel: "remoteChannel" }),
});

const ALIASES = Object.freeze({
  "client:ui.findChildByName": "client.UiNode.findChildByName",
  "client:screen.findChildByName": "client.UiNode.findChildByName",
  "client:screen.name": "client.UiNode.name",
  "client:screen.visible": "client.UiScreen.visible",
  "client:screen.events": "client.ClientScreen.events",
  "client:remoteChannel.events": "client.remoteChannel.events",
  "client:input.pointerLockEvents": "client.input.pointerLockEvents",
});

export function buildProjectCapabilityManifest(options) {
  const matrix = new Map(options.compatibilityMatrix.entries.map(entry => [entry.id, entry]));
  const current = new Map(options.currentRuntime.entries.map(entry => [entry.id, entry]));
  const serverModules = normalizeModules(options.serverModules, "server.js", options.serverSource);
  const clientModules = normalizeModules(options.clientModules, "client.js", options.clientSource);
  const serverOwners = inferModuleOwnerMaps("server", serverModules);
  const clientOwners = inferModuleOwnerMaps("client", clientModules);
  const serverScriptOwned = collectScriptOwnedSurfaces("server", serverModules, serverOwners, matrix, current);
  const clientScriptOwned = collectScriptOwnedSurfaces("client", clientModules, clientOwners, matrix, current);
  const requirements = [
    ...serverModules.flatMap(module => analyzeScript("server", module.source, options.serverCapabilities ?? [], matrix, current, module.name, serverOwners.get(normalizeModuleName(module.name)), serverScriptOwned)),
    ...clientModules.flatMap(module => analyzeScript("client", module.source, options.clientCapabilities ?? [], matrix, current, module.name, clientOwners.get(normalizeModuleName(module.name)), clientScriptOwned)),
  ].sort((left, right) => left.side.localeCompare(right.side) || left.usage.localeCompare(right.usage));
  const modules = analyzeModules({ server: serverModules, client: clientModules });
  const resources = analyzeResources(serverModules, clientModules, options.assets ?? [], options.entities ?? []);
  const ui = analyzeUi(clientModules, options.uiState ?? null, options.assets ?? []);
  const entities = analyzeEntities(serverModules, options.entities ?? [], options.assets ?? []);
  const dependencies = analyzeCrossRuntimeDependencies(requirements, clientModules, options.runtimeContracts ?? null);
  const diagnostics = [
    ...serverModules.flatMap(module => analyzeStaticUncertainty("server", module, serverOwners.get(normalizeModuleName(module.name)))),
    ...clientModules.flatMap(module => analyzeStaticUncertainty("client", module, clientOwners.get(normalizeModuleName(module.name)))),
  ].sort((left, right) => left.side.localeCompare(right.side) || left.module.localeCompare(right.module) || left.code.localeCompare(right.code));
  const blocked = requirements.filter(item => item.state === "blocked");
  const partial = requirements.filter(item => item.state === "partial");
  const scriptOwned = requirements.filter(item => item.state === "script-owned");
  const blockedModules = modules.filter(item => item.state === "blocked");
  const blockedResources = resources.filter(item => item.state === "blocked");
  const partialResources = resources.filter(item => item.state === "partial");
  const blockedEntities = entities.filter(item => item.state === "blocked");
  const partialEntities = entities.filter(item => item.state === "partial");
  const blockedUi = ui.filter(item => item.state === "blocked");
  const partialUi = ui.filter(item => item.state === "partial");
  const blockingDiagnostics = diagnostics.filter(item => item.state === "blocked");
  const blockedDependencies = dependencies.filter(item => item.state === "blocked");
  const partialDependencies = dependencies.filter(item => item.state === "partial");
  return Object.freeze({
    format: "nea-project-capability-manifest",
    version: 5,
    apiVersion: options.apiVersion,
    contracts: structuredClone(options.contracts),
    status: blocked.length + blockedModules.length + blockedResources.length + blockedEntities.length + blockedUi.length + blockingDiagnostics.length + blockedDependencies.length > 0 ? "blocked" : partial.length + partialResources.length + partialEntities.length + partialUi.length + partialDependencies.length > 0 ? "partial" : "ready",
    summary: Object.freeze({ requirements: requirements.length, ready: requirements.filter(item => item.state === "ready").length, partial: partial.length, blocked: blocked.length, scriptOwned: scriptOwned.length, modules: modules.length, blockedModules: blockedModules.length, resources: resources.length, partialResources: partialResources.length, blockedResources: blockedResources.length, uiNodes: ui.length, partialUi: partialUi.length, blockedUi: blockedUi.length, entities: entities.length, partialEntities: partialEntities.length, blockedEntities: blockedEntities.length, dependencies: dependencies.length, partialDependencies: partialDependencies.length, blockedDependencies: blockedDependencies.length, diagnostics: diagnostics.length, blockingDiagnostics: blockingDiagnostics.length }),
    requirements,
    modules,
    resources,
    ui,
    entities,
    dependencies,
    diagnostics,
  });
}

function analyzeCrossRuntimeDependencies(requirements, clientModules, runtimeContracts) {
  if (!runtimeContracts) return [];
  const flows = new Map((runtimeContracts.flows ?? []).map(flow => [flow.id, flow]));
  const transport = runtimeContracts.transport ?? {};
  const authoritativeRuntime = runtimeContracts.authoritativeRuntime ?? {};
  const result = [];
  const addTransport = (id, flowId, protocolFamily, requiredBy) => {
    const flow = flows.get(flowId);
    const protocolReady = transport.id === "mudb-transport/v1" && transport.protocolAbi === "nea-protocol-abi/v1" && (transport.requiredProtocols ?? []).includes(protocolFamily);
    const flowReady = flow?.protocol && (flow.protocol === protocolFamily || flow.protocol.startsWith(`${protocolFamily}.`));
    const state = protocolReady && flowReady ? "ready" : "blocked";
    result.push(Object.freeze({ id, category: "transport", layers: Object.freeze([flow?.from ?? "unknown", "mudb-transport", flow?.to ?? "unknown"]), contract: transport.id ?? null, protocol: flow?.protocol ?? null, flow: flowId, requiredBy: Object.freeze([...new Set(requiredBy)].sort()), state, reason: state === "ready" ? null : `Required transport flow is not confirmed: ${flowId}.` }));
  };
  if (clientModules.length > 0) addTransport("transport:client-module-delivery", "client-module-delivery", "player.game-net", clientModules.map(module => `module:${module.name}`));
  const clientEvents = requirements.filter(item => item.canonicalId === "client.remoteChannel.sendServerEvent");
  if (clientEvents.length > 0) addTransport("transport:client-event", "client-event", "player.remote-channel", clientEvents.map(item => `${item.module}:${item.usage}`));
  const serverEvents = requirements.filter(item => item.canonicalId === "server.remoteChannel.sendClientEvent");
  if (serverEvents.length > 0) addTransport("transport:server-event", "server-event", "player.remote-channel", serverEvents.map(item => `${item.module}:${item.usage}`));
  const guiRequirements = requirements.filter(item => item.capability === "server.gui");
  if (guiRequirements.length > 0) addTransport("transport:gui", "gui-command", "player.gui", guiRequirements.map(item => `${item.module}:${item.usage}`));
  const authoritativeWriteMembers = new Set([
    "server.GameEntity.position",
    "server.GameEntity.velocity",
  ]);
  const authoritativeCallMembers = new Set([
    "server.GamePlayerEntity.forceRespawn",
  ]);
  const authoritativeWrites = requirements.filter(item => item.owner === "GamePlayerEntity" && (
    (item.operation === "write" && authoritativeWriteMembers.has(item.canonicalId))
    || (item.operation === "call" && authoritativeCallMembers.has(item.canonicalId))
  ));
  if (authoritativeWrites.length > 0) {
    const flow = flows.get("authoritative-state");
    const ready = authoritativeRuntime.id === "nea-authoritative-runtime/v1" && authoritativeRuntime.bodyProfileRequired === true && authoritativeRuntime.bodyProfileSizeStatus === "confirmed" && flow?.protocol === "nea-control.player-state";
    result.push(Object.freeze({ id: "authoritative:state-write", category: "authoritative-state", layers: Object.freeze([flow?.from ?? "server-script-runtime", flow?.to ?? "authoritative-game-runtime"]), contract: authoritativeRuntime.id ?? null, protocol: flow?.protocol ?? null, flow: "authoritative-state", requiredBy: Object.freeze(authoritativeWrites.map(item => `${item.module}:${item.usage}`).sort()), state: ready ? "ready" : "blocked", reason: ready ? null : "Authoritative state-write flow or confirmed Player body profile is unavailable." }));
  }
  return result.sort((left, right) => left.id.localeCompare(right.id));
}

function analyzeScript(side, source, capabilities, matrix, current, moduleName, inferredOwners, scriptOwnedSurfaces = new Set()) {
  const usages = scanUsages(side, source, inferredOwners);
  return usages.map(item => {
    const canonicalId = resolveCanonicalId(side, item.usage, matrix, current, item.owner);
    const declaration = canonicalId ? matrix.get(canonicalId) : null;
    const localExtension = canonicalId ? null : resolveLocalExtension(side, item.usage, item.owner, current);
    const scriptOwned = canonicalId === null && localExtension === null && scriptOwnedSurfaces.has(item.usage);
    const bindingSelection = selectCurrentBinding(declaration, current, item.owner);
    const binding = bindingSelection?.binding ?? current.get(canonicalId) ?? localExtension;
    const capability = binding?.capability ?? declaration?.capability ?? null;
    const missingCapability = capability !== null && !capabilities.includes(capability);
    const executable = declaration?.executable === true || binding?.availability === "confirmed" || localExtension !== null || scriptOwned;
    const compatibility = scriptOwned ? "script-owned" : bindingSelection?.localBinding.status ?? binding?.compatibility ?? binding?.status ?? declaration?.status ?? (localExtension ? "extension" : "unclassified");
    const state = scriptOwned ? "script-owned" : !executable || missingCapability ? "blocked" : compatibility === "partial" || compatibility === "extension" || (!declaration && binding) ? "partial" : "ready";
    const reasons = [];
    if (canonicalId && !declaration && binding) reasons.push(`Executable recovered canonical surface is not present in the documented declaration matrix: ${canonicalId}.`);
    else if (!canonicalId && localExtension) reasons.push(`Executable local extension is not a canonical DAO3 declaration: ${localExtension.id}.`);
    else if (scriptOwned) reasons.push("Project script-owned surface established by a static assignment in the project module graph; it is not a DAO3 Runtime ABI claim.");
    else if (!canonicalId) reasons.push("No canonical DAO3 ABI declaration was resolved for this usage.");
    else if (declaration?.status === "unavailable" && declaration.unavailableReason) reasons.push(declaration.unavailableReason);
    else if (!executable) reasons.push(`Canonical ABI is ${compatibility} and has no executable local binding.`);
    if (missingCapability) reasons.push(`Required capability is not granted: ${capability}.`);
    for (const gap of bindingSelection?.localBinding.gaps ?? []) if (!reasons.includes(gap)) reasons.push(gap);
    return Object.freeze({ side, module: moduleName, usage: item.usage, owner: item.owner, operation: item.operation, canonicalId, localExtensionId: localExtension?.id ?? null, compatibility, capability, state, reasons });
  });
}

function collectScriptOwnedSurfaces(side, modules, ownersByModule, matrix, current) {
  const result = new Set();
  for (const module of modules) {
    const inferredOwners = ownersByModule.get(normalizeModuleName(module.name));
    for (const item of scanUsages(side, module.source, inferredOwners)) {
      if (item.operation !== "write") continue;
      const canonicalId = resolveCanonicalId(side, item.usage, matrix, current, item.owner);
      const localExtension = canonicalId ? null : resolveLocalExtension(side, item.usage, item.owner, current);
      if (canonicalId === null && localExtension === null) result.add(item.usage);
    }
  }
  return result;
}

function selectCurrentBinding(declaration, current, inferredOwner) {
  const bindings = declaration?.localBindings?.map(localBinding => ({ localBinding, binding: current.get(localBinding.localId) })).filter(item => item.binding) ?? [];
  const preferredOwner = { GamePlayerEntity: "RuntimePlayer", GameEntity: "RuntimeEntity" }[inferredOwner];
  return bindings.find(item => item.binding.owner === preferredOwner) ?? bindings[0] ?? null;
}

function scanUsages(side, source, inferredOwners = new Map()) {
  const usages = new Map();
  const add = (usage, owner = null, operation = "read") => usages.set(`${owner ?? ""}:${usage}:${operation}`, { usage, owner, operation });
  const roots = Object.keys(ROOT_OWNERS[side]);
  const variables = mergeOwnerMaps(inferVariableOwners(side, source), inferredOwners);
  const memberPattern = new RegExp(`\\b(${roots.join("|")})\\.([A-Za-z_$][\\w$]*)`, "g");
  for (const match of source.matchAll(memberPattern)) if (!variables.has(match[1])) add(`${match[1]}.${match[2]}`, null, memberOperation(source, match.index + match[0].length));
  for (const [name, owners] of variables) {
    const pattern = new RegExp(`\\b${escapeRegex(name)}\\.([A-Za-z_$][\\w$]*)`, "g");
    for (const match of source.matchAll(pattern)) for (const owner of owners) add(`${name}.${match[1]}`, owner, memberOperation(source, match.index + match[0].length));
  }
  if (side === "client") {
    for (const match of source.matchAll(/\b(Ui[A-Za-z_$][\w$]*)\.create\b/g)) add(`${match[1]}.create`, null, "call");
    for (const match of source.matchAll(/\b(UiScreen)\.getAllScreen\b/g)) add(`${match[1]}.getAllScreen`, null, "call");
  }
  const literalRootPattern = new RegExp(`\\b(${roots.join("|")})\\s*\\[\\s*(["'])([A-Za-z_$][\\w$]*)\\2\\s*\\]`, "g");
  for (const match of source.matchAll(literalRootPattern)) add(`${match[1]}.${match[3]}`, null, memberOperation(source, match.index + match[0].length));
  for (const [name, owners] of variables) {
    const pattern = new RegExp(`\\b${escapeRegex(name)}\\s*\\[\\s*(["'])([A-Za-z_$][\\w$]*)\\1\\s*\\]`, "g");
    for (const match of source.matchAll(pattern)) for (const owner of owners) add(`${name}.${match[2]}`, owner, memberOperation(source, match.index + match[0].length));
  }
  return [...usages.values()].sort((left, right) => left.usage.localeCompare(right.usage) || String(left.owner).localeCompare(String(right.owner)) || left.operation.localeCompare(right.operation));
}

function memberOperation(source, offset) {
  const whitespace = source.slice(offset).match(/^\s*/)?.[0].length ?? 0;
  const remaining = source.slice(offset + whitespace);
  if (remaining.startsWith("(")) return "call";
  if (/^(?:\+\+|--|(?:\+|-|\*|\/|%|\*\*|&&|\|\||\?\?)?=(?!=|>))/.test(remaining)) return "write";
  return "read";
}

function resolveCanonicalId(side, usage, matrix, current, inferredOwner = null) {
  const alias = ALIASES[`${side}:${usage}`];
  if (alias && (matrix.has(alias) || current.has(alias))) return alias;
  const [root, member] = usage.split(".");
  const owner = inferredOwner ?? ROOT_OWNERS[side][root] ?? root;
  const preferred = `${side}.${owner}.${member}`;
  if (matrix.has(preferred)) return preferred;
  const direct = `${side}.${root}.${member}`;
  if (matrix.has(direct)) return direct;
  if (current.get(direct)?.availability === "confirmed") return direct;
  const owners = owner === "GamePlayerEntity" ? new Set([owner, "GameEntity"]) : new Set([owner, root]);
  const candidates = [...matrix.values()].filter(entry => entry.side === side && entry.name === member && owners.has(entry.owner));
  if (candidates.length === 1) return candidates[0].id;
  const recoveredCandidates = [...current.values()].filter(entry => entry.side === side && entry.name === member && owners.has(entry.owner) && entry.availability === "confirmed");
  return recoveredCandidates.length === 1 ? recoveredCandidates[0].id : null;
}

function resolveLocalExtension(side, usage, inferredOwner, current) {
  if (!inferredOwner) return null;
  const member = usage.split(".")[1];
  const localOwner = { GameEntity: "RuntimeEntity", GamePlayerEntity: "RuntimePlayer" }[inferredOwner] ?? inferredOwner;
  const candidates = [...current.values()].filter(entry => entry.side === side && entry.owner === localOwner && entry.name === member && !(entry.implements?.length > 0));
  return candidates.length === 1 ? candidates[0] : null;
}

function inferVariableOwners(side, source) {
  const result = new Map();
  const add = (name, owner) => {
    const owners = result.get(name) ?? new Set();
    owners.add(owner);
    result.set(name, owners);
  };
  if (side === "server") {
    for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*world\.(?:querySelector|createEntity)\s*\(/g)) add(match[1], "GameEntity");
    const entityCollections = new Set();
    for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*world\.querySelectorAll\s*\(/g)) entityCollections.add(match[1]);
    for (const match of source.matchAll(/\bfor\s*\(\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s+of\s+([A-Za-z_$][\w$]*)\s*\)/g)) if (entityCollections.has(match[2])) add(match[1], "GameEntity");
    inferCollectionCallbacks(source, "world.querySelectorAll", entityCollections, "GameEntity", add);
    inferCollectionFindResults(source, "world.querySelectorAll", entityCollections, "GameEntity", add);
    for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\.player\b/g)) add(match[1], "GamePlayerEntity");
    const eventSources = new Set(["world", ...result.keys()]);
    inferEventPayloadOwners(source, eventSources, add);
  } else {
    for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(Ui[A-Za-z_$][\w$]*)\.create\s*\(/g)) add(match[1], match[2]);
    for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:ui|screen|[A-Za-z_$][\w$]*)\.findChildByName\s*\(/g)) add(match[1], "UiNode");
    const screenCollections = new Set();
    for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*UiScreen\.getAllScreen\s*\(/g)) screenCollections.add(match[1]);
    for (const match of source.matchAll(/\bfor\s*\(\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s+of\s+([A-Za-z_$][\w$]*)\s*\)/g)) if (screenCollections.has(match[2])) add(match[1], "UiScreen");
    inferCollectionCallbacks(source, "UiScreen.getAllScreen", screenCollections, "UiScreen", add);
    inferCollectionFindResults(source, "UiScreen.getAllScreen", screenCollections, "UiScreen", add);
  }
  const aliases = [...source.matchAll(/\b(?:(?:const|let|var)\s+)?([A-Za-z_$][\w$]*)\s*=(?!=)\s*([A-Za-z_$][\w$]*)\b/g)]
    .map(match => ({ target: match[1], source: match[2] }));
  for (let pass = 0; pass < aliases.length; pass += 1) {
    let changed = false;
    for (const alias of aliases) {
      for (const owner of result.get(alias.source) ?? []) {
        const owners = result.get(alias.target) ?? new Set();
        if (!owners.has(owner)) {
          add(alias.target, owner);
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
  return result;
}

function inferCollectionCallbacks(source, directCall, collections, owner, add) {
  const methods = "forEach|map|filter|find|some|every";
  const direct = new RegExp(`${escapeRegex(directCall)}\\s*\\([^;]*?\\)\\s*\\.\\s*(?:${methods})\\s*\\(\\s*(?:async\\s*)?\\(?\\s*([A-Za-z_$][\\w$]*)`, "g");
  for (const match of source.matchAll(direct)) add(match[1], owner);
  for (const collection of collections) {
    const referenced = new RegExp(`\\b${escapeRegex(collection)}\\s*\\.\\s*(?:${methods})\\s*\\(\\s*(?:async\\s*)?\\(?\\s*([A-Za-z_$][\\w$]*)`, "g");
    for (const match of source.matchAll(referenced)) add(match[1], owner);
  }
}

function inferCollectionFindResults(source, directCall, collections, owner, add) {
  const direct = new RegExp(`\\b(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*${escapeRegex(directCall)}\\s*\\([^;]*?\\)\\s*\\.\\s*find\\s*\\(`, "g");
  for (const match of source.matchAll(direct)) add(match[1], owner);
  for (const collection of collections) {
    const referenced = new RegExp(`\\b(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*${escapeRegex(collection)}\\s*\\.\\s*find\\s*\\(`, "g");
    for (const match of source.matchAll(referenced)) add(match[1], owner);
  }
}

function inferEventPayloadOwners(source, eventSources, add) {
  const handlerNames = new Set();
  for (const eventSource of eventSources) {
    const direct = new RegExp(`\\b${escapeRegex(eventSource)}\\s*\\.\\s*(?:on|next)[A-Z][A-Za-z_$0-9]*\\s*\\(\\s*(?:async\\s*)?\\(?\\s*\\{([^}]+)\\}\\s*\\)?\\s*=>`, "g");
    for (const match of source.matchAll(direct)) addEventPayloadFields(match[1], add);
    const named = new RegExp(`\\b${escapeRegex(eventSource)}\\s*\\.\\s*(?:on|next)[A-Z][A-Za-z_$0-9]*\\s*\\(\\s*([A-Za-z_$][\\w$]*)\\s*\\)`, "g");
    for (const match of source.matchAll(named)) handlerNames.add(match[1]);
  }
  for (const handlerName of handlerNames) {
    const declaration = new RegExp(`\\bfunction\\s+${escapeRegex(handlerName)}\\s*\\(\\s*\\{([^}]+)\\}`, "g");
    for (const match of source.matchAll(declaration)) addEventPayloadFields(match[1], add);
    const assigned = new RegExp(`\\b(?:const|let|var)\\s+${escapeRegex(handlerName)}\\s*=\\s*(?:async\\s*)?\\(?\\s*\\{([^}]+)\\}\\s*\\)?\\s*=>`, "g");
    for (const match of source.matchAll(assigned)) addEventPayloadFields(match[1], add);
  }
}

function addEventPayloadFields(fields, add) {
  for (const field of fields.split(",")) {
    const [property, alias] = field.trim().split(/\s*:\s*/);
    const name = alias ?? property;
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) continue;
    if (property === "player" || property === "clicker") add(name, "GamePlayerEntity");
    if (property === "entity" || property === "other") add(name, "GameEntity");
  }
}

function inferModuleOwnerMaps(side, modules) {
  const ownersByModule = new Map(modules.map(module => [normalizeModuleName(module.name), inferVariableOwners(side, module.source)]));
  const modulesByName = new Map(modules.map(module => [normalizeModuleName(module.name), module]));
  for (let pass = 0; pass < modules.length + 1; pass += 1) {
    let changed = false;
    for (const module of modules) {
      const moduleName = normalizeModuleName(module.name);
      const owners = ownersByModule.get(moduleName);
      for (const imported of scanNamedImports(module.source)) {
        const targetName = resolveModuleSpecifier(moduleName, imported.specifier, modulesByName.keys());
        const target = modulesByName.get(targetName);
        if (!target) continue;
        const targetExports = inferExports(target.source, ownersByModule.get(targetName));
        const exportedOwners = targetExports.get(imported.imported);
        if (!exportedOwners) continue;
        for (const owner of exportedOwners) changed = addOwner(owners, imported.local, owner) || changed;
      }
      for (const imported of scanDefaultImports(module.source)) {
        const targetName = resolveModuleSpecifier(moduleName, imported.specifier, modulesByName.keys());
        const target = modulesByName.get(targetName);
        if (!target) continue;
        const targetExports = inferExports(target.source, ownersByModule.get(targetName));
        const exportedOwners = targetExports.get("default");
        if (!exportedOwners) continue;
        for (const owner of exportedOwners) changed = addOwner(owners, imported.local, owner) || changed;
      }
      for (const imported of scanCommonJsImports(module.source)) {
        const targetName = resolveModuleSpecifier(moduleName, imported.specifier, modulesByName.keys());
        const target = modulesByName.get(targetName);
        if (!target) continue;
        const targetExports = inferExports(target.source, ownersByModule.get(targetName));
        const exportedOwners = targetExports.get(imported.imported);
        if (!exportedOwners) continue;
        for (const owner of exportedOwners) changed = addOwner(owners, imported.local, owner) || changed;
      }
    }
    if (!changed) break;
  }
  return ownersByModule;
}

function inferExports(source, owners) {
  const result = new Map();
  const add = (exported, local) => {
    const values = owners?.get(local);
    if (values) result.set(exported, new Set(values));
  };
  for (const match of source.matchAll(/\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) add(match[1], match[1]);
  for (const match of source.matchAll(/\bexport\s*\{([^}]+)\}/g)) {
    for (const item of match[1].split(",")) {
      const [local, exported] = item.trim().split(/\s+as\s+/);
      if (local) add(exported ?? local, local);
    }
  }
  for (const match of source.matchAll(/\bexport\s+default\s+([A-Za-z_$][\w$]*)\b/g)) add("default", match[1]);
  for (const match of source.matchAll(/\bmodule\.exports\s*=\s*([A-Za-z_$][\w$]*)\b/g)) add("default", match[1]);
  for (const match of source.matchAll(/\b(?:module\.exports|exports)\.([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\b/g)) add(match[1], match[2]);
  for (const match of source.matchAll(/\bmodule\.exports\s*=\s*\{([^}]+)\}/g)) {
    for (const item of match[1].split(",")) {
      const [exported, local] = item.trim().split(/\s*:\s*/);
      if (exported && /^[A-Za-z_$][\w$]*$/.test(local ?? exported)) add(exported, local ?? exported);
    }
  }
  return result;
}

function scanNamedImports(source) {
  const result = [];
  for (const match of source.matchAll(/\bimport\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g)) {
    for (const item of match[1].split(",")) {
      const [imported, local] = item.trim().split(/\s+as\s+/);
      if (imported) result.push({ imported, local: local ?? imported, specifier: match[2] });
    }
  }
  return result;
}

function scanDefaultImports(source) {
  const result = [];
  for (const match of source.matchAll(/\bimport\s+([A-Za-z_$][\w$]*)\s+from\s*["']([^"']+)["']/g)) result.push({ local: match[1], specifier: match[2] });
  return result;
}

function scanCommonJsImports(source) {
  const result = [];
  for (const match of source.matchAll(/\b(?:const|let|var)\s*\{([^}]+)\}\s*=\s*require\s*\(\s*["']([^"']+)["']\s*\)/g)) {
    for (const item of match[1].split(",")) {
      const [imported, local] = item.trim().split(/\s*:\s*/);
      if (imported) result.push({ imported, local: local ?? imported, specifier: match[2] });
    }
  }
  for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*require\s*\(\s*["']([^"']+)["']\s*\)/g)) result.push({ imported: "default", local: match[1], specifier: match[2] });
  return result;
}

function analyzeStaticUncertainty(side, module, inferredOwners = new Map()) {
  const diagnostics = [];
  const add = (code, message) => diagnostics.push(Object.freeze({ side, module: module.name, code, state: "blocked", message }));
  if (/\beval\s*\(/.test(module.source)) add("dynamic-eval", "eval() prevents static capability proof.");
  if (/\b(?:new\s+)?Function\s*\(/.test(module.source)) add("dynamic-function", "Function construction prevents static capability proof.");
  if (side === "server" && /\b(?:import\s+(?!\()|export\s+)/.test(module.source)) add("unsupported-server-module-syntax", "The local server Runtime executes synchronized modules as CommonJS and cannot execute ESM import/export syntax.");
  for (const match of module.source.matchAll(/\bimport\s*\(([^)]+)\)/g)) if (!/^\s*["'][^"']+["']\s*$/.test(match[1])) add("dynamic-import", "Dynamic import specifier is not a string literal.");
  const names = new Set([...Object.keys(ROOT_OWNERS[side]), ...inferredOwners.keys()]);
  for (const name of names) {
    const pattern = new RegExp(`\\b${escapeRegex(name)}\\s*\\[\\s*([^\]"'][^\]]*)\\]`, "g");
    if (pattern.test(module.source)) add("dynamic-member", `Computed member access cannot be resolved statically: ${name}[...].`);
  }
  return dedupeDiagnostics(diagnostics);
}

function mergeOwnerMaps(...maps) {
  const result = new Map();
  for (const map of maps) for (const [name, owners] of map ?? []) for (const owner of owners) addOwner(result, name, owner);
  return result;
}

function addOwner(map, name, owner) {
  const owners = map.get(name) ?? new Set();
  const size = owners.size;
  owners.add(owner);
  map.set(name, owners);
  return owners.size !== size;
}

function dedupeDiagnostics(values) {
  return [...new Map(values.map(value => [`${value.code}:${value.message}`, value])).values()];
}

function normalizeModules(modules, fallbackName, fallbackSource) {
  const values = Array.isArray(modules)
    ? modules
    : fallbackSource === undefined || fallbackSource === null || fallbackSource === ""
      ? []
      : [{ name: fallbackName, source: fallbackSource }];
  return values.map(module => Object.freeze({ name: String(module.name), source: String(module.source ?? "") })).sort((left, right) => left.name.localeCompare(right.name));
}

function analyzeModules(modulesBySide) {
  const output = [];
  for (const [side, modules] of Object.entries(modulesBySide)) {
    const names = new Set(modules.map(module => normalizeModuleName(module.name)));
    for (const module of modules) {
      for (const specifier of scanModuleSpecifiers(module.source)) {
        const resolved = resolveModuleSpecifier(module.name, specifier, names);
        const expected = moduleRequestPath(module.name, specifier);
        output.push(Object.freeze({ side, module: module.name, specifier, resolved, state: resolved === null ? "blocked" : "ready", reason: resolved === null ? `Referenced module is missing from the synchronized module set: ${expected}.` : null }));
      }
    }
  }
  return output.sort((left, right) => left.side.localeCompare(right.side) || left.module.localeCompare(right.module) || left.specifier.localeCompare(right.specifier));
}

function analyzeResources(serverModules, clientModules, assets, entities) {
  const available = new Map(assets.map(asset => {
    if (typeof asset === "string") return [asset, { name: asset }];
    const name = asset.name ?? asset.path ?? asset.id;
    return name ? [name, asset] : null;
  }).filter(Boolean));
  const availableByContentAddress = new Map(assets.flatMap(asset => typeof asset === "object" && typeof asset.contentAddress === "string" ? [[asset.contentAddress, asset]] : []));
  const result = new Map();
  const add = (kind, reference, source) => {
    const explicitProjectReference = reference.startsWith("asset:");
    const assetName = explicitProjectReference ? reference.slice(6) : reference;
    const contentAddress = kind === "audio" ? audioContentAddress(reference) : null;
    const asset = available.get(assetName) ?? (contentAddress ? availableByContentAddress.get(contentAddress) : null);
    let state;
    let availability;
    let runtimeSupport;
    let reason;
    if (asset) {
      availability = "packaged";
      if (kind === "audio" && asset.runtimeBinding === "player-block-audio") {
        state = "ready";
        runtimeSupport = "player-block-audio";
        reason = null;
      } else if (kind === "client-asset" && asset.runtimeBinding === "player-picture-image") {
        state = "ready";
        runtimeSupport = "player-picture-image";
        reason = null;
      } else if (kind === "mesh" && asset.runtimeBinding !== "validated-mesh") {
        state = source.startsWith("entity:") ? "blocked" : "partial";
        runtimeSupport = source.startsWith("entity:") ? "unavailable" : "script-local-unless-bound";
        reason = source.startsWith("entity:")
          ? `Packaged mesh has no captured and validated Player projection binding: ${assetName}.`
          : `Packaged mesh remains script-local until a captured and validated Player projection binding exists: ${assetName}.`;
      } else if (kind === "mesh") {
        state = "ready";
        runtimeSupport = "validated-mesh";
        reason = null;
      } else {
        state = "partial";
        runtimeSupport = "unavailable";
        reason = `Project asset is packaged, but no generic DAO3 asset resolver is executable for ${kind}: ${assetName}.`;
      }
    } else if (explicitProjectReference || (kind === "mesh" && source.startsWith("entity:"))) {
      state = "blocked";
      availability = "missing";
      runtimeSupport = "unavailable";
      reason = `Referenced project asset is missing: ${assetName}.`;
    } else if (kind === "mesh") {
      state = "partial";
      availability = "unresolved";
      runtimeSupport = "script-local-unless-bound";
      reason = `Unknown mesh remains script-local; no geometry, bounds, physics body, or authoritative projection is fabricated: ${assetName}.`;
    } else if (/^https?:\/\//.test(reference)) {
      state = "partial";
      availability = "external";
      runtimeSupport = "browser-network";
      reason = "External resource is not preserved locally and network retrieval is not guaranteed.";
    } else {
      state = "blocked";
      availability = "unresolved";
      runtimeSupport = "unavailable";
      reason = `Resource reference cannot be resolved to a packaged asset: ${reference}.`;
    }
    result.set(`${kind}:${reference}:${source}`, Object.freeze({ kind, reference, source, assetName, availability, runtimeSupport, state, reason }));
  };
  for (const module of clientModules) {
    for (const match of module.source.matchAll(/\bAudio\s*\(\s*(["'])(.*?)\1/g)) add("audio", match[2], module.name);
    for (const match of module.source.matchAll(/\b(?:src|image)\s*[:=]\s*(["'])(.*?)\1/g)) add("client-asset", match[2], module.name);
  }
  for (const module of serverModules) for (const match of module.source.matchAll(/\bmesh\s*:\s*(["'])(.*?)\1/g)) add("mesh", match[2], module.name);
  for (const entity of entities) if (typeof entity.mesh === "string" && entity.mesh.length > 0) add("mesh", entity.mesh, `entity:${entity.id ?? entity.name ?? "unknown"}`);
  return [...result.values()].sort((left, right) => left.kind.localeCompare(right.kind) || left.reference.localeCompare(right.reference));
}

function audioContentAddress(reference) {
  const match = /(?:^|\/)block\/(Qm[1-9A-HJ-NP-Za-km-z]{44})(?:\.mp3)?(?:[?#].*)?$/.exec(reference);
  return match?.[1] ?? null;
}

function analyzeUi(clientModules, uiState, assets) {
  const result = [];
  const uiTree = uiState?.uiTree ?? {};
  const pictureAssets = uiState?.pictureAssets ?? {};
  const availablePictures = new Map(assets.flatMap(asset => typeof asset === "object" && asset.runtimeBinding === "player-picture-image" && typeof asset.name === "string" ? [[asset.name, asset]] : []));
  const nodesByName = new Map();
  for (const node of Object.values(uiTree)) {
    const values = nodesByName.get(node.name) ?? [];
    values.push(node);
    nodesByName.set(node.name, values);
    const image = typeof node.value?.data?.image === "string" && node.value.data.image.length > 0 ? node.value.data.image : null;
    let state = "ready";
    let reason = null;
    let imageAvailability = image === null ? "not-required" : "missing";
    if (image !== null && pictureAssets[image] && availablePictures.has(image)) {
      state = "ready";
      imageAvailability = "verified-local-picture";
    } else if (image !== null && pictureAssets[image]) {
      state = "partial";
      imageAvailability = "metadata-only";
      reason = `UI picture metadata is recovered, but its generic local content binding is not verified: ${image}.`;
    } else if (image !== null && /^https?:\/\//.test(image)) {
      state = "partial";
      imageAvailability = "external";
      reason = "External UI image is not preserved locally and network retrieval is not guaranteed.";
    } else if (image !== null) {
      state = "blocked";
      reason = `UI image reference is missing from the recovered picture asset set: ${image}.`;
    }
    result.push(Object.freeze({ side: "client", source: "project", id: node.id, name: node.name, nodeType: node.value?.type ?? node.type, parentId: node.parentId, image, imageAvailability, state, reason }));
  }
  for (const module of clientModules) {
    const nodes = new Map();
    const coveredLookups = new Set();
    for (const match of module.source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(Ui[A-Za-z_$][\w$]*)\.create\s*\(/g)) nodes.set(match[1], { side: "client", module: module.name, variable: match[1], type: match[2], source: "create", lookupName: null, receiver: match[2], matchIds: [], state: "ready", reason: null, properties: new Set() });
    for (const match of module.source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\.findChildByName\s*\(\s*(?:(["'])(.*?)\3|([^)]*))\)/g)) {
      if (nodes.has(match[1])) continue;
      const receiver = match[2];
      const literal = match[3] !== undefined;
      const lookupName = literal ? match[4] : null;
      const classification = classifyUiLookup(receiver, literal, lookupName, uiState, uiTree, nodesByName);
      const callOffset = match.index + match[0].indexOf(`${receiver}.findChildByName`);
      coveredLookups.add(callOffset);
      nodes.set(match[1], { side: "client", module: module.name, variable: match[1], type: "UiNode", source: "lookup", lookupName, receiver, ...classification, properties: new Set() });
    }
    let occurrence = 0;
    for (const match of module.source.matchAll(/\b([A-Za-z_$][\w$]*)\.findChildByName\s*\(\s*(?:(["'])(.*?)\2|([^)]*))\)/g)) {
      if (coveredLookups.has(match.index)) continue;
      const receiver = match[1];
      const literal = match[2] !== undefined;
      const lookupName = literal ? match[3] : null;
      const classification = classifyUiLookup(receiver, literal, lookupName, uiState, uiTree, nodesByName);
      result.push(Object.freeze({ side: "client", module: module.name, occurrence: ++occurrence, type: "UiNode", source: "lookup-call", lookupName, receiver, ...classification, properties: [] }));
    }
    for (const node of nodes.values()) {
      const pattern = new RegExp(`\\b${escapeRegex(node.variable)}\\.([A-Za-z_$][\\w$]*)`, "g");
      for (const match of module.source.matchAll(pattern)) node.properties.add(match[1]);
      result.push(Object.freeze({ ...node, properties: [...node.properties].sort() }));
    }
  }
  return result.sort((left, right) => String(left.module ?? "").localeCompare(String(right.module ?? "")) || String(left.variable ?? left.id ?? "").localeCompare(String(right.variable ?? right.id ?? "")));
}

function classifyUiLookup(receiver, literal, lookupName, uiState, uiTree, nodesByName) {
  const candidates = literal ? nodesByName.get(lookupName) ?? [] : [];
  const visibleCandidates = receiver === "screen" && uiState ? candidates.filter(node => isUiDescendant(uiTree, node.id, uiState.defaultScreenId)) : candidates;
  if (!literal) return { matchIds: [], state: "blocked", reason: "Dynamic findChildByName argument cannot be verified before launch." };
  if (!uiState) return { matchIds: [], state: "blocked", reason: `Static UI lookup requires a packaged gameUI.reset tree: ${lookupName}.` };
  if (visibleCandidates.length === 0) return { matchIds: [], state: "blocked", reason: `Static UI node is missing from the packaged tree: ${lookupName}.` };
  if (receiver !== "ui" && receiver !== "screen") return { matchIds: visibleCandidates.map(node => node.id).sort(), state: "partial", reason: `UI node exists, but the receiver subtree cannot be proven statically: ${receiver}.findChildByName(${JSON.stringify(lookupName)}).` };
  return { matchIds: visibleCandidates.map(node => node.id).sort(), state: "ready", reason: null };
}

function isUiDescendant(uiTree, nodeId, ancestorId) {
  let current = uiTree[nodeId];
  const visited = new Set();
  while (current && !visited.has(current.id)) {
    if (current.id === ancestorId) return true;
    visited.add(current.id);
    current = uiTree[current.parentId];
  }
  return false;
}

function analyzeEntities(serverModules, projectEntities, assets) {
  const bindings = new Map(assets.map(asset => [asset.name ?? asset.path ?? asset.id, asset]));
  const projectEntity = (entity, index) => {
    const mesh = typeof entity.mesh === "string" && entity.mesh.length > 0 ? entity.mesh : null;
    const binding = mesh ? resolveAssetBinding(bindings, mesh) : null;
    const validated = binding?.runtimeBinding === "validated-mesh";
    return Object.freeze({
    source: "project",
    id: String(entity.id ?? `entity-${index + 1}`),
    kind: entity.kind ?? "entity",
    mesh,
    projection: mesh ? validated ? "validated-mesh-binding" : "requires-validated-mesh-binding" : "package-entity",
    state: mesh && !validated ? "blocked" : "ready",
    reason: mesh && !validated ? `Project entity mesh has no captured and validated Player projection binding: ${mesh}.` : null,
  });
  };
  const result = projectEntities.map(projectEntity);
  for (const module of serverModules) {
    let index = 0;
    for (const match of module.source.matchAll(/\bworld\.createEntity\s*\(\s*\{([\s\S]*?)\}\s*\)/g)) {
      const id = /\bid\s*:\s*(["'])(.*?)\1/.exec(match[1])?.[2] ?? null;
      const mesh = /\bmesh\s*:\s*(["'])(.*?)\1/.exec(match[1])?.[2] ?? null;
      const binding = mesh ? resolveAssetBinding(bindings, mesh) : null;
      result.push(Object.freeze({ source: "script", module: module.name, occurrence: ++index, id, kind: "entity", mesh, projection: mesh && binding?.runtimeBinding === "validated-mesh" ? "validated-mesh-binding" : mesh ? "script-local-unless-bound" : "script-local-unless-bound", state: mesh && binding?.runtimeBinding === "validated-mesh" ? "ready" : "partial", reason: mesh && binding?.runtimeBinding !== "validated-mesh" ? `Script-created mesh entity remains script-local until a validated binding exists: ${mesh}.` : null }));
    }
  }
  return result.sort((left, right) => left.source.localeCompare(right.source) || String(left.id ?? left.module).localeCompare(String(right.id ?? right.module)));
}

function resolveAssetBinding(bindings, reference) {
  return bindings.get(reference.startsWith("asset:") ? reference.slice(6) : reference);
}

function scanModuleSpecifiers(source) {
  const values = new Set();
  for (const match of source.matchAll(/\bimport\s+(?:[^"']+?\s+from\s+)?["']([^"']+)["']/g)) values.add(match[1]);
  for (const match of source.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)) values.add(match[1]);
  return [...values];
}

function resolveModuleSpecifier(from, specifier, moduleNames) {
  const names = moduleNames instanceof Set ? moduleNames : new Set(moduleNames);
  const value = moduleRequestPath(from, specifier);
  if (names.has(value)) return value;
  const index = `${value}/index.js`;
  return names.has(index) ? index : null;
}

function moduleRequestPath(from, specifier) {
  const base = normalizeModuleName(from).split("/");
  base.pop();
  const request = String(specifier);
  if (request.startsWith("/")) base.length = 0;
  else if (!request.startsWith(".")) {
    base.length = 0;
    base.push("node_modules");
  }
  for (const part of request.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") base.pop();
    else base.push(part);
  }
  return base.join("/");
}

function normalizeModuleName(value) {
  return String(value).replace(/\\/g, "/").replace(/^\.\//, "");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
