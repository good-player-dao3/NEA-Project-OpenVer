import assert from "node:assert/strict";
import test from "node:test";
import { FixedStepPlayerPhysics } from "../src/runtime/physics/fixed-step-physics.mjs";
import { playerAabb } from "../src/runtime/physics/aabb.mjs";
import { PlayerPhysicsBody } from "../src/runtime/physics/player-body.mjs";
import { VoxelCollisionWorld } from "../src/runtime/physics/voxel-collision-world.mjs";

test("high-speed falling stops on a one-voxel floor", () => {
  const physics = physicsWith([{ position: [0, 0, 0], blockId: 129 }], { maxFallSpeed: 1_000 });
  const body = playerBody({ position: [0.5, 10, 0.5], velocity: [0, -500, 0] });
  const result = physics.step(body, 0.05);
  assert.ok(Math.abs(body.position.y - 1.9) < 1e-9);
  assert.equal(body.velocity.y, 0);
  assert.equal(body.grounded, true);
  assert.equal(result.entered[0].normal.y, 1);
});

test("player AABB uses body center and exact profile half extents without hidden expansion", () => {
  const body = playerBody({ position: [10, 20, 30] });
  assert.deepEqual(playerAabb(body.position, body.halfExtents), {
    minX: 9.7,
    maxX: 10.3,
    minY: 19.1,
    maxY: 20.9,
    minZ: 29.7,
    maxZ: 30.3,
  });
  assert.deepEqual(body.collisionSnapshot(), {
    profileId: "physics-test-center-box",
    origin: "body-center",
    originStatus: "confirmed",
    sizeStatus: "unverified",
    boundsHalfExtents: { x: 0.3, y: 0.9, z: 0.3 },
    shapeHalfExtents: { x: 0.3, y: 0.9, z: 0.3 },
    halfExtents: { x: 0.3, y: 0.9, z: 0.3 },
    dimensions: { width: 0.6, height: 1.8, depth: 0.6 },
    aabb: {
      minX: 9.7,
      maxX: 10.3,
      minY: 19.1,
      maxY: 20.9,
      minZ: 29.7,
      maxZ: 30.3,
    },
    shapeAabb: {
      minX: 9.7,
      maxX: 10.3,
      minY: 19.1,
      maxY: 20.9,
      minZ: 29.7,
      maxZ: 30.3,
    },
  });
});

test("broadphase bounds do not enlarge the contact shape", () => {
  const world = new VoxelCollisionWorld({ voxels: [{ position: [2, 1, 0], blockId: 95 }] });
  const physics = new FixedStepPlayerPhysics(world, { gravity: 0 });
  const body = new PlayerPhysicsBody({
    position: [0.5, 1, 0.5],
    velocity: [100, 0, 0],
    profile: {
      profileId: "split-bounds-shape",
      origin: "body-center",
      originStatus: "confirmed",
      sizeStatus: "partial",
      boundsHalfExtents: { x: 0.5, y: 0.9, z: 0.5 },
      shapeHalfExtents: { x: 0.3, y: 0.9, z: 0.3 },
    },
  });
  physics.step(body, 0.05);
  assert.equal(body.position.x, 1.7);
  assert.equal(body.velocity.x, 0);
});

test("horizontal movement stops at a voxel wall", () => {
  const physics = physicsWith([{ position: [2, 1, 0], blockId: 95 }], { gravity: 0 });
  const body = playerBody({ position: [0.5, 1, 0.5], velocity: [100, 0, 0] });
  physics.step(body, 0.05);
  assert.equal(body.position.x, 1.7);
  assert.equal(body.velocity.x, 0);
});

test("ground contacts enter once and separate after takeoff", () => {
  const physics = physicsWith([{ position: [0, 0, 0], blockId: 631 }]);
  const body = playerBody({ position: [0.5, 1.9, 0.5] });
  const first = physics.step(body, 0.05);
  const second = physics.step(body, 0.05);
  body.velocity.y = 10;
  const third = physics.step(body, 0.05);
  assert.equal(first.entered.length, 1);
  assert.equal(second.entered.length, 0);
  assert.equal(second.collisions.length, 1);
  assert.equal(third.separated.length, 1);
  assert.equal(body.grounded, false);
});

test("surface materials apply restitution and different friction", () => {
  const bounce = physicsWith(
    [{ position: [0, 0, 0], blockId: 631 }],
    { gravity: 0, materials: { "631": { restitution: 0.8, friction: 1 } } },
  );
  const bouncingBody = playerBody({ position: [0.5, 2, 0.5], velocity: [0, -10, 0] });
  bounce.step(bouncingBody, 0.1);
  assert.equal(bouncingBody.position.y, 1.9);
  assert.equal(bouncingBody.velocity.y, 8);
  assert.equal(bouncingBody.grounded, true);

  const stone = physicsWith([{ position: [0, 0, 0], blockId: 129 }], {
    materials: { "129": { friction: 10 } },
  });
  const ice = physicsWith([{ position: [0, 0, 0], blockId: 147 }], {
    materials: { "147": { friction: 0.25 } },
  });
  const stoneBody = playerBody({ position: [0.5, 1.9, 0.5], velocity: [8, 0, 0] });
  const iceBody = playerBody({ position: [0.5, 1.9, 0.5], velocity: [8, 0, 0] });
  stone.step(stoneBody, 0.05);
  ice.step(iceBody, 0.05);
  assert.ok(stoneBody.velocity.x < iceBody.velocity.x);
});

test("grounded players step onto a half-height static collider", () => {
  const physics = physicsWith([], {
    gravity: 0,
    stepHeight: 0.6,
    colliders: [{ id: "step", min: [1, 1, 0], max: [2, 1.5, 1], tags: ["step"] }],
  });
  const body = playerBody({ position: [0.5, 1.9, 0.5], velocity: [10, 0, 0] });
  body.grounded = true;
  physics.step(body, 0.1);
  assert.equal(body.position.y, 2.4);
  assert.ok(body.position.x > 1);
  assert.equal(body.grounded, true);
});

test("the recovered default step height is 1.25 voxels", () => {
  const physics = physicsWith([], {
    gravity: 0,
    stepHeight: 1.25,
    colliders: [{ id: "historical-step", min: [1, 1, 0], max: [2, 2.25, 1], tags: ["step"] }],
  });
  const body = playerBody({ position: [0.5, 1.9, 0.5], velocity: [10, 0, 0] });
  body.grounded = true;
  physics.step(body, 0.1);
  assert.ok(Math.abs(body.position.y - 3.15) < 1e-9);
  assert.ok(body.position.x > 1);
  assert.equal(body.grounded, true);
});

test("trigger volumes emit enter and leave once", () => {
  const physics = physicsWith([], {
    gravity: 0,
    triggers: [{ id: "checkpoint", min: [1, 0, 0], max: [2, 3, 1], tags: ["checkpoint"] }],
  });
  const body = playerBody({ position: [0.5, 0, 0.5], velocity: [10, 0, 0] });
  const entered = physics.step(body, 0.1);
  body.velocity.x = 0;
  const stayed = physics.step(body, 0.1);
  body.velocity.x = 20;
  const left = physics.step(body, 0.1);
  assert.deepEqual(entered.triggerEntered.map(trigger => trigger.id), ["checkpoint"]);
  assert.equal(stayed.triggerEntered.length, 0);
  assert.deepEqual(left.triggerLeft.map(trigger => trigger.id), ["checkpoint"]);
});

function physicsWith(voxels, options = {}) {
  const world = new VoxelCollisionWorld({
    voxels,
    materials: options.materials,
    colliders: options.colliders,
    triggers: options.triggers,
  });
  return new FixedStepPlayerPhysics(world, options);
}

function playerBody(options = {}) {
  return new PlayerPhysicsBody({
    ...options,
    profile: {
      profileId: "physics-test-center-box",
      origin: "body-center",
      originStatus: "confirmed",
      sizeStatus: "unverified",
      boundsHalfExtents: { x: 0.3, y: 0.9, z: 0.3 },
      shapeHalfExtents: { x: 0.3, y: 0.9, z: 0.3 },
      evidence: "center-origin conformance fixture",
    },
  });
}

