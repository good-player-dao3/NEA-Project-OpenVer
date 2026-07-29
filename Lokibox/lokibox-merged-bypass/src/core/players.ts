import { Vector3 } from 'src/utils/math';
import type { Player, PlayerInput, GameCore, StatePlayer } from './game-core';
import { ReadonlyHook } from 'src/utils/hook';
import { EventBus } from 'src/utils/event-bus';

export class CorePlayers {
  constructor(private gameCore: GameCore) {
    this.hookPlayerList();
  }

  private hookPlayerList() {
    const state = this.gameCore.game.state;
    state.playerIndex = new Proxy(state.playerIndex, {
      set: (target, prop, value) => {
        const result = Reflect.set(target, prop, value);
        this.event.emit('player-join', value);
        return result;
      },

      deleteProperty: (target, prop) => {
        const old = target[Number(prop)];
        const result = Reflect.deleteProperty(target, prop);
        this.event.emit('player-leave', old);
        return result;
      },
    });
  }

  private event = new EventBus();

  getPlayerById(id: number) {
    const r = this.gameCore.game.state.players.find(v => v.id === id);
    const r2 = this.gameCore.game.state.replica.players.find(v => v.id === id);
    if (r && r2) {
      return new PlayerAdapter(r, r2);
    } else {
      return null;
    }
  }

  getAllPlayers() {
    return this.gameCore.game.state.players.map(statePlayer => {
      const replicaPlayer = this.gameCore.game.state.replica.players.find(
        p => p.id === statePlayer.id
      )!;
      return new PlayerAdapter(statePlayer, replicaPlayer);
    });
  }

  onPlayerJoin(fn: () => void) {
    this.event.on('player-join', fn);
  }

  onPlayerLeave(fn: () => void) {
    this.event.on('player-leave', fn);
  }

  onPlayerChange(fn: () => void) {
    this.event.on('player-leave', fn);
    this.event.on('player-join', fn);
  }

  getPlayerInputById(id: number) {
    const r = this.gameCore.game.state.playerInputs.find(v => v.id === id);
    if (r) {
      return new PlayerInputAdapter(r);
    } else {
      return null;
    }
  }

  getSelfPlayer() {
    return this.getPlayerById(this.gameCore.game.state.secret.id)!;
  }
}

class PlayerInputAdapter {
  constructor(private raw: PlayerInput) {}

  get cameraForward() {
    const yaw = ((128 + this.raw.cameraAngle) / 255) * Math.PI * 2;
    const pitch = ((128 - this.raw.pitch) / 255) * Math.PI;
    return new Vector3(
      Math.cos(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.sin(yaw) * Math.cos(pitch)
    );
  }

  get angle() {
    return this.raw.angle;
  }

  set angle(v: number) {
    this.raw.angle = v;
  }
}

export class PlayerAdapter {
  flagsHook?: number;
  constructor(
    private statePlayer: StatePlayer,
    private replicaPlayer: Player
  ) {}

  get flags() {
    return this.statePlayer.flags;
  }

  hookFlags(v: number) {
    return new ReadonlyHook(this.statePlayer, 'flags', v).unhook;
  }

  hookWalkSpeed(v: number) {
    return new ReadonlyHook(this.statePlayer, 'walkSpeed', v).unhook;
  }

  hookWalkAcceleration(v: number) {
    return new ReadonlyHook(this.statePlayer, 'walkAcceleration', v).unhook;
  }

  hookRunSpeed(v: number) {
    return new ReadonlyHook(this.statePlayer, 'runSpeed', v).unhook;
  }

  hookRunAcceleration(v: number) {
    return new ReadonlyHook(this.statePlayer, 'runAcceleration', v).unhook;
  }

  hookPhysGround(v: boolean) {
    return new ReadonlyHook(this.statePlayer, 'physGround', v).unhook;
  }

  hookJumpPower(v: number) {
    return new ReadonlyHook(this.statePlayer, 'jumpPower', v).unhook;
  }

  get name() {
    return this.replicaPlayer.name;
  }

  get avatarHash() {
    return this.replicaPlayer.avatar_hash;
  }

  get id() {
    return this.statePlayer.id;
  }
}
