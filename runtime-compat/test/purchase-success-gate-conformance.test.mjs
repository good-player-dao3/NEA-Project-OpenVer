import assert from "node:assert/strict";
import test from "node:test";
import { purchaseSuccessGateContract } from "../conformance/purchase-success-gate.mjs";

test("purchase success gate preserves recovered fields and missing ingress direction", () => {
  assert.deepEqual(purchaseSuccessGateContract.eventFields, ["tick", "userId", "productId", "orderId"]);
  assert.equal(purchaseSuccessGateContract.missingDirection, "purchase-success-to-server-script-runtime");
  assert.equal(purchaseSuccessGateContract.launchState, "blocked");
});
