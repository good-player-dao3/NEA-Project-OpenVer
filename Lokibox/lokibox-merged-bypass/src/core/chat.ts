import type { GameCore } from './game-core';

export interface ChatMessage {
  clock: number;
  duration: number;
  i18nPrefix: string;
  i18nSuffix: string;
  text: string;
}

export class CoreChat {
  private lastText = '';
  private lastClock = 0;

  constructor(private gameCore: GameCore) {}

  /** 获取当前 tick 的最新聊天消息（仅新消息返回内容） */
  poll(): string | null {
    const chat = this.gameCore.game.state.chat as ChatMessage | null;
    if (!chat) return null;

    // 同一条消息只返回一次
    if (chat.clock === this.lastClock && chat.text === this.lastText) return null;

    this.lastClock = chat.clock;
    this.lastText = chat.text;
    return chat.text;
  }
}
