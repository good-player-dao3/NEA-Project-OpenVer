console.log("NEA Script Lab server script loaded");

const beacon = world.querySelector(".demo-beacon");

world.onPlayerJoin(({ player }) => {
  player.name = `Explorer-${player.id.split("-").at(-1)}`;
  world.say(`${player.name} joined NEA Script Lab`);
  player.sendMessage("Server Script Runtime is active.");
  if (beacon) beacon.tags.add("active");
  remoteChannel.sendClientEvent(player, {
    type: "nea-demo:welcome",
    tick: world.currentTick,
    clientContract: "dao3-client-runtime/v1",
    serverContract: "nea-server-runtime/v1",
    collision: {
      boundsHalfExtents: Object.values(player.snapshot().collision.boundsHalfExtents),
      shapeHalfExtents: Object.values(player.snapshot().collision.shapeHalfExtents),
    },
    postureStatus: "standing confirmed; crouch/fly unresolved",
  });
});

world.onVoxelContact(({ player, voxel, axis, force }) => {
  if (voxel !== 631 || axis.y !== 1) return;
  if (force === null) console.warn("Historical contact force remains unresolved in the compatibility runtime.");
  player.velocity = { x: player.velocity.x, y: 10, z: player.velocity.z };
  remoteChannel.sendClientEvent(player, {
    type: "nea-demo:bounce",
    position: player.position.toArray(),
  });
});

world.onTriggerEnter(({ player, trigger }) => {
  if (trigger.tags.includes("checkpoint")) {
    remoteChannel.sendClientEvent(player, {
      type: "nea-demo:checkpoint",
      checkpointId: trigger.id,
    });
  }
  if (trigger.tags.includes("hazard")) {
    const health = player.damage(25);
    player.applyImpulse({ x: -4, y: 6, z: 0 });
    remoteChannel.sendClientEvent(player, {
      type: "nea-demo:hazard",
      hazardId: trigger.id,
      health,
    });
  }
});

world.onTriggerLeave(({ player, trigger }) => {
  if (!trigger.tags.includes("hazard")) return;
  remoteChannel.sendClientEvent(player, {
    type: "nea-demo:hazard-clear",
    hazardId: trigger.id,
  });
});

remoteChannel.onServerEvent(({ entity: player, args: event }) => {
  if (event?.type === "nea-demo:ready") {
    world.say(`${player.name} completed the Player handshake`);
    remoteChannel.sendClientEvent(player, {
      type: "nea-demo:ack",
      message: "server runtime received client ready",
    });
  }
  if (event?.type === "nea-demo:probe-interactions") {
    player.position = [25, 5, 38];
    player.velocity = [0, 0, 0];
    setTimeout(() => {
      player.position = [41, 5, 38];
      player.velocity = [0, 0, 0];
    }, 100);
  }
});

world.onTick(({ tick }) => {
  if (tick % 200 === 0) console.log(`runtime heartbeat tick=${tick}`);
});
