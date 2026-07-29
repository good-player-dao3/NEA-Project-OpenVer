import assert from "node:assert/strict";
import test from "node:test";
import { parseBackendEvent } from "../src/backend-events.mjs";

test("parses Player joins and unwraps remote-channel args", () => {
  assert.deepEqual(parseBackendEvent("[session] join local-...1234"), {
    type: "player-join",
    sessionLabel: "local-...1234",
  });
  assert.deepEqual(parseBackendEvent('[remote-channel:event] local-...1234 {"tick":7,"args":"{\\"type\\":\\"nea-demo:ready\\"}"}'), {
    type: "client-event",
    sessionLabel: "local-...1234",
    tick: 7,
    event: { type: "nea-demo:ready" },
  });
  assert.deepEqual(parseBackendEvent("[session] disconnected local-...1234"), {
    type: "player-leave",
    sessionLabel: "local-...1234",
  });
  assert.equal(parseBackendEvent("[game-terrain] ready"), null);
});
