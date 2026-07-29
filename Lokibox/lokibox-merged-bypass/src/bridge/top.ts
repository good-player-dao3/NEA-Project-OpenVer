/**
 * @module bridge/top Bridge 顶层页面 (dao3.fun/play) 侧的消息处理。
 *
 * 运行于游戏顶层页面。负责：
 * - 接收 iframe 发来的聊天消息，注入到游戏聊天框
 * - 响应 iframe 的 Authorization token 请求
 */

import { Logger } from 'src/utils/logger';
import { BridgeMessageType, type BridgeMessage } from './types';

// ─── Logger ───────────────────────────────────────────────

const logger = new Logger('bridge/top');

// ─── 允许的 iframe origin ─────────────────────────────────

const VIEW_ORIGIN = 'https://view.dao3.fun';

// ─── ChatBox ──────────────────────────────────────────────

/** 游戏内聊天框的 DOM 操作封装 */
class ChatBox {
  /** 缓存的 textarea 引用 */
  private textarea: HTMLTextAreaElement | null = null;
  /** textarea 上 React 内部属性的 key */
  private textareaKey: string | null = null;
  /** 缓存的发送按钮引用 */
  private button: HTMLButtonElement | null = null;
  /** 按钮上 React 内部属性的 key */
  private buttonKey: string | null = null;

  /** 查找 textarea 并缓存 React key */
  private resolveTextarea(): boolean {
    if (this.textarea && this.textareaKey) return true;

    const el = document.querySelector<HTMLTextAreaElement>(
      'textarea.IGC6rM'
    );
    if (!el) {
      logger.w('textarea.IGC6rM not found');
      return false;
    }

    const key = Object.keys(el).find(v =>
      v.startsWith('__reactProps$')
    );
    if (!key) {
      logger.w('React props key not found on textarea');
      return false;
    }

    this.textarea = el;
    this.textareaKey = key;
    return true;
  }

  /** 查找发送按钮并缓存 React key */
  private resolveButton(): boolean {
    if (this.button && this.buttonKey) return true;

    const el = document.querySelector<HTMLButtonElement>(
      'button.o8N5G3.Nhvoz8.WztsVN.Z7v8jn.block'
    );
    if (!el) {
      logger.w('Send button not found');
      return false;
    }

    const key = Object.keys(el).find(v =>
      v.startsWith('__reactProps$')
    );
    if (!key) {
      logger.w('React props key not found on button');
      return false;
    }

    this.button = el;
    this.buttonKey = key;
    return true;
  }

  /** 设置输入框文字（通过 React onChange） */
  setText(text: string): void {
    if (!this.resolveTextarea()) return;
    (this.textarea as any)[this.textareaKey!].onChange({
      target: { value: text },
    });
  }

  /** 点击发送按钮（通过 React onClick） */
  clickSend(): void {
    if (!this.resolveButton()) return;
    (this.button as any)[this.buttonKey!].onClick();
  }

  /** 发送一条聊天消息 */
  send(content: string): void {
    this.setText(content);
    this.clickSend();
    this.clear();
  }

  /** 清空输入框 */
  clear(): void {
    this.setText('');
  }
}

// ─── 消息处理 ─────────────────────────────────────────────

const chatBox = new ChatBox();

/**
 * 校验消息来源是否可信。
 * 仅接受来自 view.dao3.fun (iframe) 的消息。
 */
function isTrustedOrigin(origin: string): boolean {
  return origin === VIEW_ORIGIN;
}

function handleMessage(event: MessageEvent<BridgeMessage>): void {
  if (!isTrustedOrigin(event.origin)) return;

  const { data } = event;

  switch (data.type) {
    case BridgeMessageType.Chat:
      chatBox.send(data.content);
      break;

    case BridgeMessageType.GetAuth: {
      const auth = localStorage.getItem('AUTHORIZATION');
      event.source?.postMessage(
        {
          type: BridgeMessageType.ReturnAuth,
          auth,
        } satisfies BridgeMessage,
        { targetOrigin: VIEW_ORIGIN }
      );
      break;
    }

    default:
      logger.w('Unknown message type:', (data as any)?.type);
  }
}

// ─── 启动 ─────────────────────────────────────────────────

addEventListener('message', handleMessage);
logger.i('Bridge started');
