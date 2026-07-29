// ==UserScript==
// @name         Box-GO preservation capture
// @namespace    https://github.com/CodeManTeam/box-go
// @version      1.0.0
// @description  Capture Box3 WebSocket traffic and public resource metadata locally
// @match        https://dao3.fun/play/*
// @match        https://view.dao3.fun/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict';

  const page = typeof unsafeWindow === 'object' ? unsafeWindow : window;
  if (page.__BOX_GO_CAPTURE_INSTALLED__) return;
  Object.defineProperty(page, '__BOX_GO_CAPTURE_INSTALLED__', { value: true });

  const FORMAT_VERSION = 2;
  const MAX_MESSAGES = 20000;
  const MAX_PAYLOAD_BYTES = 64 * 1024 * 1024;
  const SENSITIVE_KEYS = /^(authorization|cookie|password|passwd|token|accessToken|refreshToken|session|sessionId|sid)$/i;
  const startedAtMs = Date.now();
  const socketIds = new WeakMap();
  const pending = new Set();
  let nextSequence = 0;
  let panel;
  let status;

  const state = {
    format: 'box-go-capture',
    version: FORMAT_VERSION,
    startedAt: new Date(startedAtMs).toISOString(),
    pageUrl: redactUrl(location.href),
    title: '',
    userAgent: navigator.userAgent,
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
    frame: page.top === page ? 'top' : 'iframe',
    sockets: [],
    messages: [],
    events: [],
    errors: [],
    bytes: 0,
    droppedMessages: 0,
    droppedBytes: 0,
  };

  function now() {
    return { at: Date.now(), offsetMs: Math.max(0, Math.round(performance.now())) };
  }

  function recordEvent(type, detail) {
    state.events.push({ type, ...now(), ...(detail || {}) });
    if (state.events.length > 1000) state.events.shift();
    updatePanel();
  }

  function reserveMessage(id, direction, kind, bytes) {
    if (state.messages.length >= MAX_MESSAGES || state.bytes + bytes > MAX_PAYLOAD_BYTES) {
      state.droppedMessages += 1;
      state.droppedBytes += bytes;
      updatePanel();
      return null;
    }
    const message = { seq: nextSequence++, id, direction, kind, bytes, ...now() };
    state.messages.push(message);
    state.bytes += bytes;
    updatePanel();
    return message;
  }

  function captureData(id, direction, data) {
    if (typeof data === 'string') {
      const encodedBytes = new TextEncoder().encode(data).byteLength;
      const message = reserveMessage(id, direction, 'text', encodedBytes);
      if (message) message.data = redactText(data);
      return;
    }
    if (data instanceof page.ArrayBuffer || Object.prototype.toString.call(data) === '[object ArrayBuffer]') {
      captureBytes(id, direction, new Uint8Array(data));
      return;
    }
    if (page.ArrayBuffer.isView(data) || ArrayBuffer.isView(data)) {
      captureBytes(id, direction, new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
      return;
    }
    if (data instanceof page.Blob || Object.prototype.toString.call(data) === '[object Blob]') {
      const message = reserveMessage(id, direction, 'binary', data.size);
      if (!message) return;
      const task = data.arrayBuffer()
        .then(buffer => { message.base64 = toBase64(new Uint8Array(buffer)); })
        .catch(error => { message.captureError = String(error); })
        .finally(() => pending.delete(task));
      pending.add(task);
      return;
    }
    const text = String(data);
    const message = reserveMessage(id, direction, 'unknown', text.length);
    if (message) message.data = text.slice(0, 1000);
  }

  function captureBytes(id, direction, bytes) {
    const message = reserveMessage(id, direction, 'binary', bytes.byteLength);
    if (message) message.base64 = toBase64(bytes);
  }

  function toBase64(bytes) {
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  }

  function redactUrl(value) {
    try {
      const url = new URL(String(value), location.href);
      for (const key of [...url.searchParams.keys()]) {
        if (SENSITIVE_KEYS.test(key)) url.searchParams.set(key, '[redacted]');
      }
      return url.toString();
    } catch (_) {
      return String(value);
    }
  }

  function redactText(value) {
    try {
      return JSON.stringify(redactObject(JSON.parse(value)));
    } catch (_) {
      return value
        .replace(/((?:authorization|token|sessionId|sid)["']?\s*[:=]\s*["']?)[^"'&,\s}]+/gi, '$1[redacted]')
        .replace(/(Bearer\s+)[A-Za-z0-9._~+\/-]+=*/gi, '$1[redacted]');
    }
  }

  function redactObject(value, seen = new WeakSet()) {
    if (!value || typeof value !== 'object') return value;
    if (seen.has(value)) return '[circular]';
    seen.add(value);
    if (Array.isArray(value)) return value.map(item => redactObject(item, seen));
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = SENSITIVE_KEYS.test(key) ? '[redacted]' : redactObject(item, seen);
    }
    return result;
  }

  const OriginalWebSocket = page.WebSocket;
  const originalSend = OriginalWebSocket.prototype.send;

  class CapturingWebSocket extends OriginalWebSocket {
    constructor(url, protocols) {
      if (protocols === undefined) super(url);
      else super(url, protocols);
      const id = state.sockets.length;
      socketIds.set(this, id);
      state.sockets.push({
        id,
        url: redactUrl(url),
        protocols: Array.isArray(protocols) ? protocols : protocols ? [protocols] : [],
        createdAt: new Date().toISOString(),
        ...now(),
      });
      ensurePanel();
      OriginalWebSocket.prototype.addEventListener.call(this, 'open', () => recordEvent('socket-open', { id, protocol: this.protocol }));
      OriginalWebSocket.prototype.addEventListener.call(this, 'message', event => captureData(id, 'receive', event.data));
      OriginalWebSocket.prototype.addEventListener.call(this, 'close', event => recordEvent('socket-close', {
        id, code: event.code, clean: event.wasClean, reason: String(event.reason || '').slice(0, 500),
      }));
      OriginalWebSocket.prototype.addEventListener.call(this, 'error', () => recordEvent('socket-error', { id }));
    }
  }

  OriginalWebSocket.prototype.send = function (data) {
    const id = socketIds.get(this);
    if (id !== undefined) captureData(id, 'send', data);
    return originalSend.call(this, data);
  };
  page.WebSocket = CapturingWebSocket;

  function resourceSnapshot() {
    const seen = new Set();
    return performance.getEntriesByType('resource').flatMap(entry => {
      const url = redactUrl(entry.name);
      if (seen.has(url)) return [];
      seen.add(url);
      return [{
        name: url,
        initiatorType: entry.initiatorType,
        startTime: Math.round(entry.startTime),
        duration: Math.round(entry.duration),
        transferSize: entry.transferSize || 0,
        encodedBodySize: entry.encodedBodySize || 0,
        decodedBodySize: entry.decodedBodySize || 0,
      }];
    });
  }

  async function snapshot() {
    await Promise.allSettled([...pending]);
    state.title = document.title;
    return {
      ...state,
      endedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAtMs,
      resources: resourceSnapshot(),
      privacy: {
        textAndUrlsRedacted: true,
        containsRawBinaryFrames: true,
        warning: 'Keep captures private until binary authentication frames have been reviewed.',
      },
    };
  }

  async function download() {
    setStatus('Box-GO preparing export...');
    const output = await snapshot();
    const blob = new Blob([JSON.stringify(output)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `box-go-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    recordEvent('export', { messages: state.messages.length });
  }

  function clear() {
    state.messages.length = 0;
    state.events.length = 0;
    state.errors.length = 0;
    state.bytes = 0;
    state.droppedMessages = 0;
    state.droppedBytes = 0;
    recordEvent('capture-cleared');
  }

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function updatePanel() {
    if (!status) return;
    const mib = (state.bytes / 1048576).toFixed(1);
    const dropped = state.droppedMessages ? `  dropped:${state.droppedMessages}` : '';
    status.textContent = `Box-GO  ws:${state.sockets.length}  frames:${state.messages.length}  ${mib}MiB${dropped}`;
    status.style.color = state.droppedMessages ? '#ffb454' : '#9fe8b0';
  }

  function ensurePanel() {
    if (panel) return;
    const mount = () => {
      if (panel || !document.body) return;
      panel = document.createElement('div');
      panel.style.cssText = 'position:fixed;z-index:2147483647;right:12px;bottom:12px;display:flex;gap:7px;align-items:center;background:#101414;color:#9fe8b0;border:1px solid #456;padding:7px 9px;font:12px/1.4 Consolas,monospace;box-shadow:0 2px 8px #0008';
      status = document.createElement('span');
      const exportButton = document.createElement('button');
      exportButton.textContent = 'Export';
      exportButton.title = 'Export this frame capture as JSON';
      exportButton.addEventListener('click', download);
      const clearButton = document.createElement('button');
      clearButton.textContent = 'Clear';
      clearButton.title = 'Discard captured frames from memory';
      clearButton.addEventListener('click', clear);
      panel.append(status, exportButton, clearButton);
      document.body.appendChild(panel);
      updatePanel();
    };
    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', mount, { once: true });
  }

  page.addEventListener('error', event => {
    state.errors.push({ type: 'error', message: String(event.message || 'unknown').slice(0, 1000), ...now() });
  });
  page.addEventListener('unhandledrejection', event => {
    state.errors.push({ type: 'unhandledrejection', message: String(event.reason || 'unknown').slice(0, 1000), ...now() });
  });
  document.addEventListener('visibilitychange', () => recordEvent('visibility', { value: document.visibilityState }));
  page.addEventListener('pagehide', () => recordEvent('pagehide'));
})();
