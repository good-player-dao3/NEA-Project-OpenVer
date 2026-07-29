/**
 * @module bridge/types Bridge 消息协议类型定义。
 *
 * Bridge 模块负责 iframe (view.dao3.fun) 与顶层页面 (dao3.fun) 之间的
 * postMessage 通信。所有消息必须包含 type 字段，并通过 origin 校验。
 */

// ─── 消息类型常量 ────────────────────────────────────────

export const BridgeMessageType = {
  /** iframe → top: 发送聊天消息到游戏内 */
  Chat: 'chat',
  /** iframe → top: 请求顶层页面的 AUTHORIZATION token */
  GetAuth: 'get-auth',
  /** top → iframe: 返回 AUTHORIZATION token */
  ReturnAuth: 'return-auth',
} as const;

export type BridgeMessageType =
  (typeof BridgeMessageType)[keyof typeof BridgeMessageType];

// ─── 消息载荷 ────────────────────────────────────────────

export interface ChatMessage {
  type: typeof BridgeMessageType.Chat;
  content: string;
}

export interface GetAuthMessage {
  type: typeof BridgeMessageType.GetAuth;
}

export interface ReturnAuthMessage {
  type: typeof BridgeMessageType.ReturnAuth;
  auth: string | null;
}

/** 所有 Bridge 消息的联合类型 */
export type BridgeMessage = ChatMessage | GetAuthMessage | ReturnAuthMessage;

// ─── Origin 校验常量 ─────────────────────────────────────

/** 允许的来源 */
export const TRUSTED_ORIGINS = [
  'https://dao3.fun',
  'https://view.dao3.fun',
] as const;
