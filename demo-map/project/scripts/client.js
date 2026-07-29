console.log("[NEA Demo] historical Player client script loaded");

const runtimeStatus = UiText.create();
runtimeStatus.name = "NeaRuntimeStatus";
runtimeStatus.textContent = [
  "NEA Client Runtime: active",
  "contract: dao3-client-runtime/v1",
  "server: connecting",
].join("\n");
runtimeStatus.textFontSize = 16;
runtimeStatus.textColor.copy(Vec3.create({ r: 255, g: 255, b: 255 }));
runtimeStatus.textStrokeColor.copy(Vec3.create({ r: 0, g: 0, b: 0 }));
runtimeStatus.textStrokeThickness = 2;
runtimeStatus.textXAlignment = "Left";
runtimeStatus.textYAlignment = "Top";
runtimeStatus.autoWordWrap = false;
runtimeStatus.anchor.copy(Vec2.create({ x: 0, y: 0 }));
runtimeStatus.position.offset.copy(Vec2.create({ x: 20, y: 20 }));
runtimeStatus.size.offset.copy(Vec2.create({ x: 560, y: 150 }));
runtimeStatus.parent = ui;

remoteChannel.sendServerEvent({
  type: "nea-demo:ready",
  runtimeApiVersion: "0.1.0"
});

remoteChannel.onClientEvent(event => {
  if (event?.type === "nea-demo:welcome") {
    console.log(`[NEA Demo] welcome received at server tick ${event.tick}`);
    const collision = event.collision;
    runtimeStatus.textContent = [
      "NEA Client Runtime: active",
      `client: ${event.clientContract}`,
      `server: ${event.serverContract} @ tick ${event.tick}`,
      `bounds: ${collision.boundsHalfExtents.join(" / ")}`,
      `shape: ${collision.shapeHalfExtents.join(" / ")}`,
      `posture shapes: ${event.postureStatus}`,
    ].join("\n");
  }
  if (event?.type === "nea-demo:ack") {
    console.log(`[NEA Demo] ${event.message}`);
  }
  if (event?.type === "nea-demo:bounce") {
    console.log(`[NEA Demo] server physics bounce at ${event.position.join(",")}`);
  }
  if (event?.type === "nea-demo:checkpoint") {
    console.log(`[NEA Demo] checkpoint reached: ${event.checkpointId}`);
  }
  if (event?.type === "nea-demo:hazard") {
    console.log(`[NEA Demo] hazard ${event.hazardId}, health=${event.health}`);
  }
  if (event?.type === "nea-demo:hazard-clear") {
    console.log(`[NEA Demo] left hazard ${event.hazardId}`);
  }
});
