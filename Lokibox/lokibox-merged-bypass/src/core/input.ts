import type { GameCore } from './game-core';

export enum GameKey {
  KEY_A = 0,
  KEY_D = 1,
  KEY_W = 2,
  KEY_S = 3,
  ACTION0 = 6,
  ACTION1 = 7,
}

export class CoreInput {
  constructor(private gameCore: GameCore) {}
  applyAxisMovement(x: number, y: number) {
    this.gameCore.game.input._applyAxisMovement(x, y);
  }

  setKeyState(key: GameKey, state: boolean) {
    this.gameCore.game.state.input.keyState[key] = state ? 1 : 0;
  }
}
