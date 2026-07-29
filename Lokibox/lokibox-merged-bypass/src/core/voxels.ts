import type { Vector3 } from 'src/utils/math';
import type { GameCore } from './game-core';

export class CoreVoxels {
  constructor(private gameCore: GameCore) {}

  set(x: number, y: number, z: number, id: number) {
    return this.gameCore.game.voxel._setVoxel(x, y, z, id);
  }

  get(x: number, y: number, z: number) {
    return this.gameCore.game.voxel.getVoxel(x, y, z);
  }

  inbound(position: Vector3) {
    const [bx, by, bz] = this.gameCore.game.state.voxel.shape;
    const { x, y, z } = position;

    return 0 <= x && x < bx && 0 <= y && y < by && 0 <= z && z < bz;
  }
}
