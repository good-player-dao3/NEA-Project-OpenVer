import type { GameCore } from './game-core';

export class CoreSecret {
  constructor(private gameCore: GameCore) {}

  get id() {
    return this.gameCore.game.state.secret.id;
  }

  
}
