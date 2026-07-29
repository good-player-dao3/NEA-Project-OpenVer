import { EventBus } from './event-bus';

export type ToastType = 'info' | 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: number;
}

/**
 * ToastManager — 全局 toast 通知单例。
 *
 * 用法：
 *   ToastManager.getInstance().show('操作成功', 'success');
 *   ToastManager.getInstance().show('网络错误', 'error', 5000);
 */
export class ToastManager {
  private eventBus = new EventBus();
  private nextId = 0;

  private static instance: ToastManager;
  private constructor() {}

  static getInstance(): ToastManager {
    if (!this.instance) {
      this.instance = new ToastManager();
    }
    return this.instance;
  }

  /** 显示一条 toast。duration 默认 3000ms */
  show(message: string, type: ToastType = 'info', duration = 3000): void {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration,
      createdAt: Date.now(),
    };
    this.eventBus.emit('toast', toast);
  }

  /** 订阅新 toast 事件 */
  onToast(fn: (toast: Toast) => void): void {
    this.eventBus.on('toast', fn);
  }
}
