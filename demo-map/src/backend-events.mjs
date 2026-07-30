export function parseBackendEvent(line) {
  const join = line.match(/^\[session\] join (.+)$/);
  if (join) return Object.freeze({ type: "player-join", sessionLabel: join[1] });
  const leave = line.match(/^\[session\] disconnected (.+)$/);
  if (leave) return Object.freeze({ type: "player-leave", sessionLabel: leave[1] });

  const entityMap = line.match(/^\[game-net:entity-map\] (.+)$/);
  if (entityMap) {
    const packet = JSON.parse(entityMap[1]);
    if (!Array.isArray(packet?.entities)) throw new Error("game-net entity map requires entities");
    return Object.freeze({ type: "entity-map", entities: structuredClone(packet.entities) });
  }

  const input = line.match(/^\[game-net:input\] (\S+) (.+)$/);
  if (input) {
    const packet = JSON.parse(input[2]);
    if (!Array.isArray(packet?.events)) throw new Error("game-net input packet requires events");
    return Object.freeze({
      type: "input-events",
      sessionLabel: input[1],
      packet: structuredClone(packet),
    });
  }

  const gui = line.match(/^\[gui:message\] (\S+) (.+)$/);
  if (gui) {
    const packet = JSON.parse(gui[2]);
    if (typeof packet?.name !== "string" || typeof packet?.payload !== "string") throw new Error("GUI message requires name and JSON payload");
    return Object.freeze({
      type: "gui-message",
      sessionLabel: gui[1],
      name: packet.name,
      payload: structuredClone(JSON.parse(packet.payload)),
    });
  }

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
