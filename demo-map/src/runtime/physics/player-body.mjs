import { Vector3 } from "../vector3.mjs";
import { playerAabb } from "./aabb.mjs";

export class PlayerPhysicsBody {
  constructor(options = {}) {
    const profile = requirePlayerBodyProfile(options.profile);
    this.position = Vector3.from(options.position ?? [0, 0, 0]);
    this.velocity = Vector3.from(options.velocity ?? [0, 0, 0]);
    this.profile = profile;
    this.boundsHalfExtents = profile.boundsHalfExtents;
    this.shapeHalfExtents = profile.shapeHalfExtents;
    this.halfExtents = this.shapeHalfExtents;
    this.dimensions = profile.shapeDimensions;
    this.grounded = false;
    this.contacts = new Map();
    this.triggers = new Map();
  }

  collisionSnapshot() {
    const bounds = playerAabb(this.position, this.boundsHalfExtents);
    const shape = playerAabb(this.position, this.shapeHalfExtents);
    return Object.freeze({
      profileId: this.profile.profileId,
      origin: this.profile.origin,
      originStatus: this.profile.originStatus,
      sizeStatus: this.profile.sizeStatus,
      boundsHalfExtents: Object.freeze({ ...this.boundsHalfExtents }),
      shapeHalfExtents: Object.freeze({ ...this.shapeHalfExtents }),
      halfExtents: Object.freeze({ ...this.shapeHalfExtents }),
      dimensions: Object.freeze({ ...this.dimensions }),
      aabb: bounds,
      shapeAabb: shape,
    });
  }
}

function requirePlayerBodyProfile(value) {
  if (!value || typeof value !== "object") throw new Error("PlayerPhysicsBody requires an explicit player body profile");
  if (value.origin !== "body-center") throw new Error(`Unsupported player body origin: ${value.origin}`);
  const boundsHalfExtents = requireHalfExtents(value.boundsHalfExtents ?? value.halfExtents, "boundsHalfExtents");
  const shapeHalfExtents = requireHalfExtents(value.shapeHalfExtents ?? value.halfExtents, "shapeHalfExtents");
  if (["x", "y", "z"].some(axis => shapeHalfExtents[axis] > boundsHalfExtents[axis])) throw new Error("Player body shapeHalfExtents must fit inside boundsHalfExtents");
  return Object.freeze({
    profileId: String(value.profileId),
    origin: value.origin,
    originStatus: String(value.originStatus),
    sizeStatus: String(value.sizeStatus),
    boundsHalfExtents,
    shapeHalfExtents,
    boundsDimensions: dimensions(boundsHalfExtents),
    shapeDimensions: dimensions(shapeHalfExtents),
    evidence: String(value.evidence ?? ""),
  });
}

function requireHalfExtents(value, name) {
  if (!value || ![value.x, value.y, value.z].every(component => Number.isFinite(component) && component > 0)) {
    throw new Error(`Player body profile ${name} must be positive finite numbers`);
  }
  return Object.freeze({ x: value.x, y: value.y, z: value.z });
}

function dimensions(halfExtents) {
  return Object.freeze({ width: halfExtents.x * 2, height: halfExtents.y * 2, depth: halfExtents.z * 2 });
}
