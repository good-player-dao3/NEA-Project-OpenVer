import assert from "node:assert/strict";
import test from "node:test";
import { EventSignal } from "../src/runtime/event-signal.mjs";

test("event tokens implement cancel resume and active semantics", () => {
  const signal = new EventSignal();
  const received = [];
  const handler = event => received.push(event);
  const first = signal.on(handler);
  const second = signal.on(handler);
  assert.equal(first.active(), true);
  signal.emit(1);
  first.cancel();
  assert.equal(first.active(), false);
  signal.emit(2);
  first.resume();
  assert.equal(first.active(), true);
  signal.emit(3);
  second.cancel();
  signal.emit(4);
  assert.deepEqual(received, [1, 1, 2, 3, 3, 4]);
});

test("cleared event tokens cannot resume", () => {
  const signal = new EventSignal();
  const token = signal.on(() => {});
  signal.clear();
  token.resume();
  assert.equal(token.active(), false);
});
