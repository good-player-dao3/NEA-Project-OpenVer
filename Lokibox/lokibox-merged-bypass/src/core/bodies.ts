import { QuaternionAdapter, Vector3Adapter } from 'src/utils/math';
import { type Body, type GameCore } from './game-core';
import { ReadonlyHook } from 'src/utils/hook';

/**
 * Bodies模块的Adapter.
 *
 * 警告: 任何返回值必须是简单类型或已定义的Adapter; 禁止直接返回Adapter的部分切片.
 */
export class CoreBodies {
  constructor(private gameCore: GameCore) {}

  get bodies() {
    const { bodies } = this.gameCore.game.state;
    return bodies.map((rawBody: Body) => {
      return new BodyAdapter(rawBody);
    });
  }

  getBodyById(id: number): BodyAdapter | null {
    const rawBody = this.gameCore.game.state.bodies.find(v => v.id === id);
    return rawBody ? new BodyAdapter(rawBody) : null;
  }

  getSelfBody() {
    const id = this.gameCore.game.state.secret.id;
    return this.getBodyById(id)!;
  }

  getPlayerBodies() {
    const { playerIndex } = this.gameCore.game.state;
    return this.bodies.filter(v => v.id in playerIndex);
  }
}

export class BodyAdapter {
  position: Vector3Adapter;
  velocity: Vector3Adapter;
  angularVelocity: Vector3Adapter;
  rotation: QuaternionAdapter;
  boundingBox: Vector3Adapter;
  halfExtents: Vector3Adapter;

  private flagsHook?: number = undefined;

  constructor(private body: Body) {
    this.position = new Vector3Adapter(body, 'px', 'py', 'pz');
    this.velocity = new Vector3Adapter(body, 'vx', 'vy', 'vz');
    this.angularVelocity = new Vector3Adapter(body, 'ax', 'ay', 'az');
    this.rotation = new QuaternionAdapter(body, 'qx', 'qy', 'qz', 'qw');
    this.boundingBox = new Vector3Adapter(body, 'rx', 'ry', 'rz');
    this.halfExtents = new Vector3Adapter(body, 'hsx', 'hsy', 'hsz');
  }
  get id() {
    return this.body.id;
  }

  get mass() {
    return this.body.mass;
  }

  get friction() {
    return this.body.friction;
  }

  get restitution() {
    return this.body.restitution;
  }

  get group() {
    return this.body.group;
  }

  get flags() {
    return this.body.flags;
  }

  hookFlags(v: number) {
    return new ReadonlyHook(this.body, 'flags', v).unhook;
  }

  hookBoundingBox(hx: number, hy: number, hz: number) {
    const u1 = new ReadonlyHook(this.body, 'rx', hx).unhook;
    const u2 = new ReadonlyHook(this.body, 'ry', hy).unhook;
    const u3 = new ReadonlyHook(this.body, 'rz', hz).unhook;
    return () => { u1(); u2(); u3(); };
  }
}
