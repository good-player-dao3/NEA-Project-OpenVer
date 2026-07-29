import { LokiAPI } from 'src/api/api';
import type { FriendInfo, FriendRequest } from 'src/api/schema';
import { EventBus } from 'src/utils/event-bus';

/**
 * FriendManager — 远程 Loki 好友单例。
 *
 * - fetch() / fetchRequests() 拉取服务端数据，缓存到内存
 * - startPolling(ms) 定时轮询好友申请，新请求 emit 'new-request'
 * - isFriend(username) 按 username 判断是否为好友
 * - addFriend / removeFriend 调 LokiAPI
 * - acceptRequest / rejectRequest 处理好友申请
 * - onChange / onNewRequest 订阅变更
 */
export class FriendManager {
  private friends: FriendInfo[] = [];
  private friendSet: Set<string> = new Set();
  private requests: FriendRequest[] = [];
  /** 等待中的请求（用于去重防抖） */
  private pendingRequests = new Set<string>();

  private api = LokiAPI.getInstance();
  private eventBus = new EventBus();
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  private static instance: FriendManager;
  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new FriendManager();
    }
    return this.instance;
  }

  /** 从服务端重新拉取好友列表 */
  async fetch() {
    try {
      const resp = await this.api.getFriends();
      if (resp.code === 'OK') {
        this.friends = resp.data.friends;
        this.friendSet = new Set(resp.data.friends.map(f => f.username));
        this.eventBus.emit('change', null);
      }
    } catch {
      // 网络错误静默，保留旧缓存
    }
  }

  /** 拉取待处理的好友申请，返回新请求（首次拉取不返回） */
  async fetchRequests(): Promise<FriendRequest[]> {
    try {
      const resp = await this.api.getFriendRequests();
      if (resp.code === 'OK') {
        const incoming = resp.data.requests;
        // 检测新请求：username 不在旧缓存中的
        const oldUsernames = new Set(this.requests.map(r => r.username));
        const fresh = incoming.filter(r => !oldUsernames.has(r.username));
        this.requests = incoming;
        this.eventBus.emit('change', null);
        return fresh;
      }
    } catch {
      // 静默
    }
    return [];
  }

  /** 启动定时轮询好友申请 */
  startPolling(intervalMs = 15000) {
    if (this.pollingTimer != null) return;
    this.fetch();
    this.fetchRequests();
    this.pollingTimer = setInterval(async () => {
      const fresh = await this.fetchRequests();
      for (const r of fresh) {
        this.eventBus.emit('new-request', r);
      }
    }, intervalMs);
  }

  /** 停止轮询 */
  stopPolling() {
    if (this.pollingTimer != null) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /** 获取缓存的申请列表 */
  getRequests(): readonly FriendRequest[] {
    return this.requests;
  }

  /** 接受好友申请 */
  async acceptRequest(requesterUsername: string) {
    await this.api.acceptFriend(requesterUsername);
    this.requests = this.requests.filter(
      r => r.username !== requesterUsername,
    );
    await this.fetch();
    this.eventBus.emit('change', null);
  }

  /** 拒绝好友申请 */
  async rejectRequest(requesterUsername: string) {
    await this.api.rejectFriend(requesterUsername);
    this.requests = this.requests.filter(
      r => r.username !== requesterUsername,
    );
    this.eventBus.emit('change', null);
  }

  /** 按 username 判断是否为好友 */
  isFriend(username: string): boolean {
    return this.friendSet.has(username);
  }

  /** 获取缓存的好友列表 */
  getFriends(): readonly FriendInfo[] {
    return this.friends;
  }

  /** 发送好友请求 */
  async addFriend(targetUsername: string) {
    if (this.pendingRequests.has(targetUsername)) return;
    this.pendingRequests.add(targetUsername);
    try {
      await this.api.requestFriend(targetUsername);
    } finally {
      this.pendingRequests.delete(targetUsername);
    }
  }

  /** 删除好友 */
  async removeFriend(targetUsername: string) {
    await this.api.deleteFriend(targetUsername);
    this.friends = this.friends.filter(f => f.username !== targetUsername);
    this.friendSet.delete(targetUsername);
    this.eventBus.emit('change', null);
  }

  /** 检查是否正在处理该用户的请求 */
  isPending(username: string): boolean {
    return this.pendingRequests.has(username);
  }

  onChange(fn: () => void) {
    this.eventBus.on('change', fn);
  }

  /** 订阅新好友申请事件（轮询检测到时触发） */
  onNewRequest(fn: (req: FriendRequest) => void) {
    this.eventBus.on('new-request', fn);
  }
}
