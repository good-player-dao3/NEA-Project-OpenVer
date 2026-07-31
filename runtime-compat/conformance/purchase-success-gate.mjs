export const purchaseSuccessGateContract = Object.freeze({
  evidence: Object.freeze([
    "dao3-docs-mirror/markdown/api/GameWorld/shopping.md",
    "origin/origin/origin/shell/MarketScriptShell.js",
    "origin/origin/origin/sync/ScriptWorldSync.js",
    "origin/server-protocols.json",
    "local-player/backend/box3-server.cjs",
  ]),
  eventFields: Object.freeze(["tick", "userId", "productId", "orderId"]),
  recoveredMarketDirections: Object.freeze(["server-to-player-openMarketplace", "server-to-market-ackPurchaseSuccessMsg"]),
  missingDirection: "purchase-success-to-server-script-runtime",
  launchState: "blocked",
  relatedEvidenceBlockedIngress: Object.freeze(["world.onChat", "storage.getGroupStorage"]),
});
