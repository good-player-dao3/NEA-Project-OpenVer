import { Matrix4, Quaternion, Vector3, Vector4 } from 'src/utils/math';
import type { GameCore } from './game-core';

export enum CameraMode {
  FOLLOW = 0,
  FIXED,
  FPS,
}

export class CoreCamera {
  constructor(gameCore: GameCore) {
    this.camera = gameCore.game.state.camera;
    this.secretCamera = gameCore.game.state.secret.replica.camera;
    this.local = gameCore.game.state.local;
  }

  private camera;
  private secretCamera;
  private local;

  get rotation() {
    const [x, y, z, w] = this.camera.rotation;
    return new Quaternion(x, y, z, w);
  }

  get targetId() {
    return this.secretCamera.targetId;
  }

  set targetId(v: number) {
    this.secretCamera.targetId = v;
  }

  get mode(): CameraMode {
    return this.secretCamera.mode;
  }

  set mode(v: CameraMode) {
    this.secretCamera.mode = v;
  }

  get fovY() {
    return this.secretCamera.fovY;
  }

  set fovY(v: number) {
    this.secretCamera.fovY = v;
  }

  get viewProjection() {
    return new Matrix4(this.camera.viewProjection);
  }

  get viewport() {
    return this.camera.viewport;
  }

  get forward() {
    const { view: v } = this.camera;
    //矩阵 forward-row
    return new Vector3(-v[2], -v[6], -v[10]);
  }

  get eye() {
    const [x, y, z] = this.camera.eye;
    return new Vector3(x, y, z);
  }

  get yaw() {
    return this.local.yaw;
  }

  set yaw(v: number) {
    this.local.yaw = v;
  }

  get pitch() {
    return this.local.pitch;
  }

  set pitch(v: number) {
    this.local.pitch = v;
  }
}
