import type { GameCore } from './game-core';

export class CoreRemoteChannel {
  private gameCore: GameCore | null = null;

  constructor(gameCore: GameCore) {
    this.gameCore = gameCore;
  }

  private get channel() {
    return this.gameCore?.game?.clientScript?.scriptRemoteChannel?.remoteChannel ?? null;
  }

  get available(): boolean {
    const ch = this.channel;
    return ch !== null && typeof ch.onClientEvent === 'function';
  }

  onClientEvent(fn: (type: string, args: any) => void): void {
    const ch = this.channel;
    if (!ch || typeof ch.onClientEvent !== 'function') return;
    ch.onClientEvent((e) => fn(e.type, e.args));
  }

  sendServerEvent(type: string, args: any): void {
    const ch = this.channel;
    if (!ch || typeof ch.sendServerEvent !== 'function') return;
    ch.sendServerEvent({ type, args });
  }
}
