import type { Vector3 } from 'src/utils/math';
import type { CoreBodies } from './bodies';
import type { GameCore } from './game-core';
import type { CoreCamera } from './camera';
import type { CoreVoxels } from './voxels';

export class CoreRaycast {
  constructor(
    private gameCore: GameCore,
    private bodies: CoreBodies,
    private camera: CoreCamera,
    private voxels: CoreVoxels,
  ) {}
  createRaycast(options: Partial<RaycastOptions>) {
    this.createRaycasts([options]);
  }
  createRaycasts(options: Partial<RaycastOptions>[]) {
    const self = this.bodies.getSelfBody();

    const events = [];

    for (const o of options) {
      const tick = o.tick ?? this.gameCore.game.state.clock.tick;
      events.push({
        buttonState: o.buttonState ?? 1,
        prevButtonState: 0,
        position: o.position
          ? o.position.parseArray()
          : self.position.toVector3().parseArray(),
        rayHitEntity: o.hitEntityId ?? 0,
        rayDirection: o.direction
          ? o.direction.parseArray()
          : this.camera.forward.parseArray(),
        rayHitNormal: o.hitNormal
          ? o.hitNormal.parseArray()
          : ([0, 1, 0] as [number, number, number]),
        rayHitVoxelX: o.hitVoxel ? o.hitVoxel.x : 0,
        rayHitVoxelY: o.hitVoxel ? o.hitVoxel.y : 0,
        rayHitVoxelZ: o.hitVoxel ? o.hitVoxel.z : 0,
        rayOrigin: o.origin
          ? o.origin.parseArray()
          : self.position.toVector3().parseArray(),
        rayTime: o.distance ?? 0,
        tick,
      });
    }

    this.gameCore.game.net._protocol.server.message.input({
      pauseCount: 0,
      tick: this.gameCore.game.state.clock.tick,
      events,
      input: {
        bodies: this.gameCore.game.state.bodies,
        inputAngle: 0,
        inputCameraAngle: 0,
        inputPitch: 0,
        inputState: 1,
      },
    });
  }

  DELTA = 0.01;

  simulate(origin: Vector3, direction: Vector3) {
    const delta = direction.normalize().scale(this.DELTA);
    const _origin = origin.clone();

    let hitPosition;

    do {
      _origin.addEq(delta);
      if (
        this.voxels.get(
          Math.floor(_origin.x),
          Math.floor(_origin.y),
          Math.floor(_origin.z)
        ) !== 0
      ) {
        hitPosition = _origin.clone();
        break;
      }
    } while (this.voxels.inbound(_origin));

    return hitPosition || null;
  }
}
interface RaycastOptions {
  position: Vector3;
  hitEntityId: number;
  direction: Vector3;
  hitNormal: Vector3;
  origin: Vector3;
  hitVoxel: Vector3;
  distance: number;
  tick: number;
  buttonState: number;
}
