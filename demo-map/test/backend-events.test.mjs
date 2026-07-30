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
  assert.deepEqual(parseBackendEvent(`[gui:message] local-...1234 ${JSON.stringify({ name: "buy", payload: JSON.stringify({ id: 2 }) })}`), {
    type: "gui-message",
    sessionLabel: "local-...1234",
    name: "buy",
    payload: { id: 2 },
  });
  assert.deepEqual(parseBackendEvent('[game-net:entity-map] {"entities":[{"entityIndex":2,"entityId":1000002}]}'), {
    type: "entity-map",
    entities: [{ entityIndex: 2, entityId: 1000002 }],
  });
  assert.deepEqual(parseBackendEvent('[game-net:input] local-...1234 {"tick":12,"events":[{"tick":11,"buttonState":1,"prevButtonState":0}]}'), {
    type: "input-events",
    sessionLabel: "local-...1234",
    packet: { tick: 12, events: [{ tick: 11, buttonState: 1, prevButtonState: 0 }] },
  });
  assert.deepEqual(parseBackendEvent("[session] disconnected local-...1234"), {
    type: "player-leave",
    sessionLabel: "local-...1234",
  });
  assert.equal(parseBackendEvent("[game-terrain] ready"), null);
});
