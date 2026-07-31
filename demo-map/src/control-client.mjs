export async function sendClientEventToBackend(options) {
  const response = await fetch(`http://127.0.0.1:${options.port}/__nea/control/send-client-event`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${options.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ session: options.session, event: options.event }),
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend control bridge failed with HTTP ${response.status}`);
  return result;
}

export async function sendChatMessageToBackend(options) {
  const response = await fetch(`http://127.0.0.1:${options.port}/__nea/control/chat-message`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${options.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ...(options.session === undefined ? {} : { session: options.session }),
      message: options.message,
    }),
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend chat bridge failed with HTTP ${response.status}`);
  return result;
}

export async function getPlayerStateFromBackend(options) {
  const url = new URL(`http://127.0.0.1:${options.port}/__nea/control/player-state`);
  url.searchParams.set("session", options.session);
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${options.token}` },
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend state bridge failed with HTTP ${response.status}`);
  return result.state;
}

export async function queuePlayerStateToBackend(options) {
  const response = await fetch(`http://127.0.0.1:${options.port}/__nea/control/player-state`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${options.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ session: options.session, state: options.state }),
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend state bridge failed with HTTP ${response.status}`);
  return result;
}

export async function queueDamageStateToBackend(options) {
  const response = await fetch(`http://127.0.0.1:${options.port}/__nea/control/damage-state`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${options.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ...(options.session === undefined ? {} : { session: options.session }),
      ...(options.entityId === undefined ? {} : { entityId: options.entityId }),
      state: options.state,
      events: options.events,
    }),
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend damage bridge failed with HTTP ${response.status}`);
  return result;
}

export async function destroyEntityOnBackend(options) {
  const response = await fetch(`http://127.0.0.1:${options.port}/__nea/control/entity-destroy`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${options.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ entityId: options.entityId }),
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend entity destroy bridge failed with HTTP ${response.status}`);
  return result;
}

export async function createEntityOnBackend(options) {
  const response = await fetch(`http://127.0.0.1:${options.port}/__nea/control/entity-create`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${options.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ entity: options.entity }),
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend entity create bridge failed with HTTP ${response.status}`);
  return result;
}

export async function queueEntityStateToBackend(options) {
  const response = await fetch(`http://127.0.0.1:${options.port}/__nea/control/entity-state`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${options.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ entityId: options.entityId, state: options.state }),
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend entity state bridge failed with HTTP ${response.status}`);
  return result;
}

export async function sendGuiCommandToBackend(options) {
  const response = await fetch(`http://127.0.0.1:${options.port}/__nea/control/gui-command`, {
    method: "POST",
    headers: { authorization: `Bearer ${options.token}`, "content-type": "application/json" },
    body: JSON.stringify({ session: options.session, command: options.command }),
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend GUI bridge failed with HTTP ${response.status}`);
  return result.result;
}

export async function openDialogOnBackend(options) {
  const response = await fetch(`http://127.0.0.1:${options.port}/__nea/control/dialog`, {
    method: "POST",
    headers: { authorization: `Bearer ${options.token}`, "content-type": "application/json" },
    body: JSON.stringify({ session: options.session, config: options.config }),
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend dialog bridge failed with HTTP ${response.status}`);
  return result.result;
}

export async function cancelDialogsOnBackend(options) {
  const response = await fetch(`http://127.0.0.1:${options.port}/__nea/control/dialog-cancel-all`, {
    method: "POST",
    headers: { authorization: `Bearer ${options.token}`, "content-type": "application/json" },
    body: JSON.stringify({ session: options.session }),
    signal: options.signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error ?? `Backend dialog cancellation bridge failed with HTTP ${response.status}`);
  return result.cancelled;
}
