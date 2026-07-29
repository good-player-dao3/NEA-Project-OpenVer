import type { GameCore } from './game-core';

export class CoreDamage {
  constructor(private gameCore: GameCore) {}

  getDamageById(id: number) {
    return this.gameCore.game.state.replica.damage.find(v => v.id === id) ?? null;
  }

  getSelfDamage() {
    return this.getDamageById(this.gameCore.game.state.secret.id);
  }
}
