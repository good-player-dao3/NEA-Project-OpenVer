/**
 * @module bridge/iframe Bridge iframe 侧 (view.dao3.fun) 的消息发送。
 *
 * 运行于游戏 iframe 内。负责：
 * - 向顶层页面发送聊天消息
 * - 向顶层页面请求 Authorization token
 */

import {
  BridgeMessageType,
  type BridgeMessage,
  type ChatMessage,
  type GetAuthMessage,
} from './types';

// ─── Origin ───────────────────────────────────────────────

const TOP_ORIGIN = 'https://dao3.fun';

// ─── 消息构建 ─────────────────────────────────────────────

function post<T extends BridgeMessage>(message: T): void {
  window.top?.postMessage(message, TOP_ORIGIN);
}

// ─── 公开 API ─────────────────────────────────────────────

/**
 * 向游戏内聊天框发送一条聊天消息。
 * @param content 聊天内容
 */
export function send(content: string): void {
  post<ChatMessage>({
    type: BridgeMessageType.Chat,
    content,
  });
}

/**
 * 向顶层页面请求 AUTHORIZATION token。
 * @returns Promise 解析为 token 字符串或 null
 */
export function getAuthorization(): Promise<string | null> {
  return new Promise(resolve => {
    const handler = (e: MessageEvent<BridgeMessage>) => {
      if (e.data.type === BridgeMessageType.ReturnAuth) {
        removeEventListener('message', handler);
        resolve(e.data.auth);
      }
    };

    addEventListener('message', handler);

    post<GetAuthMessage>({
      type: BridgeMessageType.GetAuth,
    });
  });
}
