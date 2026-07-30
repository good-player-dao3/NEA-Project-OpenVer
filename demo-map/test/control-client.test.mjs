import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { getPlayerStateFromBackend, queuePlayerStateToBackend, sendChatMessageToBackend, sendClientEventToBackend, sendGuiCommandToBackend } from "../src/control-client.mjs";

test("control client rejects an invalid token and accepts an authenticated delivery", async () => {
  const received = [];
  const server = createServer(async (request, response) => {
    response.setHeader("content-type", "application/json");
    if (request.headers.authorization !== "Bearer expected") {
      response.statusCode = 401;
      response.end(JSON.stringify({ ok: false, error: "unauthorized" }));
      return;
    }
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    received.push(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    response.end(JSON.stringify({ ok: true }));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  await assert.rejects(
    sendClientEventToBackend({ port, token: "wrong", session: "local...0001", event: { type: "probe" } }),
    /unauthorized/,
  );
  await sendClientEventToBackend({ port, token: "expected", session: "local...0001", event: { type: "ack" } });
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));

  assert.deepEqual(received, [{ session: "local...0001", event: { type: "ack" } }]);
});

test("control client sends GUI commands and propagates native results", async () => {
  const received = [];
  const server = createServer(async (request, response) => {
    response.setHeader("content-type", "application/json");
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    received.push({ url: request.url, body: JSON.parse(Buffer.concat(chunks).toString("utf8")) });
    response.end(JSON.stringify({ ok: true, result: { text: "3" } }));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const result = await sendGuiCommandToBackend({ port, token: "expected", session: "local...0003", command: { operation: "getAttribute", selector: "#score", name: "text" } });
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  assert.deepEqual(result, { text: "3" });
  assert.deepEqual(received, [{ url: "/__nea/control/gui-command", body: { session: "local...0003", command: { operation: "getAttribute", selector: "#score", name: "text" } } }]);
});

test("control client sends broadcast and private chat messages", async () => {
  const received = [];
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    received.push({ url: request.url, body: JSON.parse(Buffer.concat(chunks).toString("utf8")) });
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ ok: true, delivered: 1 }));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await sendChatMessageToBackend({ port, token: "expected", message: { text: "broadcast", senderId: 0, private: false, duration: 0, hideFloat: false } });
  await sendChatMessageToBackend({ port, token: "expected", session: "local...0004", message: { text: "private", senderId: 0, private: true, duration: 0, hideFloat: false } });
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  assert.deepEqual(received, [
    { url: "/__nea/control/chat-message", body: { message: { text: "broadcast", senderId: 0, private: false, duration: 0, hideFloat: false } } },
    { url: "/__nea/control/chat-message", body: { session: "local...0004", message: { text: "private", senderId: 0, private: true, duration: 0, hideFloat: false } } },
  ]);
});

test("control client reads and queues authoritative player state", async () => {
  const writes = [];
  const server = createServer(async (request, response) => {
    response.setHeader("content-type", "application/json");
    if (request.headers.authorization !== "Bearer expected") {
      response.statusCode = 401;
      response.end(JSON.stringify({ ok: false, error: "unauthorized" }));
      return;
    }
    const url = new URL(request.url, "http://127.0.0.1");
    if (request.method === "GET") {
      response.end(JSON.stringify({ ok: true, state: { tick: 9, playerId: 7, position: [1, 2, 3], velocity: [4, 5, 6] } }));
      return;
    }
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    writes.push(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    response.statusCode = 202;
    response.end(JSON.stringify({ ok: true, queued: true }));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const state = await getPlayerStateFromBackend({ port, token: "expected", session: "local...0002" });
  await queuePlayerStateToBackend({ port, token: "expected", session: "local...0002", state: { position: [8, 9, 10], velocity: [1, 2, 3] } });
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  assert.deepEqual(state.position, [1, 2, 3]);
  assert.deepEqual(writes, [{ session: "local...0002", state: { position: [8, 9, 10], velocity: [1, 2, 3] } }]);
});
