export function parseBackendEvent(line) {
  const join = line.match(/^\[session\] join (.+)$/);
  if (join) return Object.freeze({ type: "player-join", sessionLabel: join[1] });
  const leave = line.match(/^\[session\] disconnected (.+)$/);
  if (leave) return Object.freeze({ type: "player-leave", sessionLabel: leave[1] });

  const remote = line.match(/^\[remote-channel:event\] (\S+) (.+)$/);
  if (!remote) return null;
  const packet = JSON.parse(remote[2]);
  const event = typeof packet?.args === "string" ? JSON.parse(packet.args) : packet;
  return Object.freeze({
    type: "client-event",
    sessionLabel: remote[1],
    tick: Number.isSafeInteger(packet?.tick) ? packet.tick : 0,
    event: structuredClone(event),
  });
}
