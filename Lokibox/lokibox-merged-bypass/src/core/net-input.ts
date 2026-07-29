import { type GameCore, type NetInputArg } from './game-core';

/**
 * NetInput 拦截器。
 *
 * active=true  → 替换 `game.net._protocol.server.message.input`，
 *                所有发往服务器的移动/输入包被缓存，不发送。
 * active=false → 恢复原始函数，按顺序 flush 所有缓存的包。
 *
 * 用于 Blink：按住时停止发包，松手瞬间闪现到实际位置。
 * 用于 FakeLag：缓存后按 tick 延迟逐个 drain，制造滞后。
 */
export class NetInputInterceptor {
  private originalFn: ((n: NetInputArg) => void) | null = null;
  private cached: NetInputArg[] = [];
  private owner: string | null = null;
  private readonly maxCached = 600;

  constructor(private gameCore: GameCore) {}

  setActive(active: boolean, owner = 'legacy'): boolean {
    if (active) {
      if (this.originalFn) return this.owner === owner;
      this.cached = [];
      this.owner = owner;
      this.originalFn = this.gameCore.game.net._protocol.server.message.input;
      this.gameCore.game.net._protocol.server.message.input = (arg: NetInputArg) => {
        if (this.cached.length >= this.maxCached) {
          this.cached.shift();
        }
        this.cached.push(arg);
      };
      return true;
    } else {
      if (!this.originalFn) return true;
      if (this.owner !== owner && owner !== 'legacy') return false;
      this.gameCore.game.net._protocol.server.message.input = this.originalFn;
      for (const arg of this.cached) {
        this.originalFn(arg);
      }
      this.cached = [];
      this.originalFn = null;
      this.owner = null;
      return true;
    }
  }

  /** 缓存队列长度 */
  get queued(): number {
    return this.cached.length;
  }

  get activeOwner(): string | null {
    return this.owner;
  }

  /** 取出一条缓存的包并通过原始函数发送，用于 FakeLag 延迟发包。返回 true 表示发送了一条。 */
  drainOne(): boolean {
    const arg = this.cached.shift();
    if (!arg || !this.originalFn) return false;
    this.originalFn(arg);
    return true;
  }
}
