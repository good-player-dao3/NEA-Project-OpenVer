import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeHistoricalClientEvent,
  encodeHistoricalServerEvent,
  HistoricalClientRemoteChannelFixture,
} from "../conformance/client-remote-channel.mjs";

test("RemoteChannel encodes event payloads as ticked JSON strings", () => {
  const packet = encodeHistoricalServerEvent(37, { type: "demo", value: [1, true, null] });
  assert.deepEqual(packet, {
    tick: 37,
    args: '{"type":"demo","value":[1,true,null]}',
  });
  assert.deepEqual(decodeHistoricalClientEvent(packet), {
    tick: 37,
    event: { type: "demo", value: [1, true, null] },
  });
  assert.throws(() => encodeHistoricalServerEvent(1, 1n), TypeError);
});

test("RemoteChannel queues packets until the client isolate starts", () => {
  const fixture = new HistoricalClientRemoteChannelFixture();
  const received = [];
  fixture.onClientEvent(event => received.push(event));
  assert.equal(fixture.receivePacket({ tick: 4, args: '{"queued":true}' }), false);
  assert.deepEqual(fixture.diagnostics(), { started: false, pendingPackets: 1, listeners: 1 });
  fixture.start();
  assert.deepEqual(received, [{ queued: true }]);
  assert.deepEqual(fixture.diagnostics(), { started: true, pendingPackets: 0, listeners: 1 });
});

test("RemoteChannel drops malformed JSON and supports listener removal and clear", () => {
  const fixture = new HistoricalClientRemoteChannelFixture();
  const first = [];
  const second = [];
  const firstListener = event => first.push(event);
  const secondListener = event => second.push(event);
  fixture.onClientEvent(firstListener);
  fixture.onClientEvent(secondListener);
  fixture.start();
  assert.equal(fixture.receivePacket({ tick: 1, args: "not-json" }), false);
  assert.equal(fixture.receivePacket({ tick: 2, args: '{"value":1}' }), true);
  fixture.removeEventListener(firstListener);
  fixture.receivePacket({ tick: 3, args: '{"value":2}' });
  fixture.clear();
  fixture.receivePacket({ tick: 4, args: '{"value":3}' });
  assert.deepEqual(first, [{ value: 1 }]);
  assert.deepEqual(second, [{ value: 1 }, { value: 2 }]);
});
