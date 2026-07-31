export const chatDeliveryLifecycleContract = Object.freeze({
  historicalSources: Object.freeze([
    "origin/origin/origin/shell/ScriptShell.js:413",
    "origin/origin/origin/sync/ScriptEntitySync.js:56",
    "origin/origin/origin/sync/ScriptWorldSync.js:65",
  ]),
  invalidEndpointPolicy: "silent-drop",
  playerRemovalOrder: Object.freeze(["world.onPlayerLeave", "player.onDestroy", "world.onEntityDestroy"]),
  unresolved: Object.freeze(["MAX_CHATS_PER_TICK value", "Player display acknowledgement"]),
});
