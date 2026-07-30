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
