import { Core } from 'src/core/core';
import { EventBus } from 'src/utils/event-bus';

/**
 * ExclusionManager — 排除列表单例。
 *
 * - 维护一个 bodyId 集合表示排除目标
 * - 中键点击时，独立计算最近的非排除玩家并加入列表
 * - AimAssist / KillAura 在 tick 时调用 isFriend 跳过排除目标
 */
export class ExclusionManager {
  private friendList: number[] = [];

  private core = Core.getInstance();

  private eventBus = new EventBus();

  private static instance: ExclusionManager;
  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new ExclusionManager();
    }
    return this.instance;
  }

  /**
   * 初始化中键监听。
   * 应在 core ready 之后调用。
   */
  init() {
    this.core.onReady(() => {
      addEventListener('mousedown', (e: MouseEvent) => {
        if (e.button === 1) {
          this.addTarget();
        }
      });
    });
  }

  /** 寻找最近的非好友玩家并加入好友列表 */
  addTarget() {
    const self = this.core.bodies.getSelfBody();
    if (!self) return;

    let nearest: number | null = null;
    let minDist = Infinity;

    for (const body of this.core.bodies.getPlayerBodies()) {
      if (body.id === self.id) continue;
      if (this.isFriend(body.id)) continue;

      const sd = body.position.toVector3().sqrDist(
        self.position.toVector3(),
      );

      if (sd < minDist) {
        minDist = sd;
        nearest = body.id;
      }
    }

    if (nearest !== null) {
      this.addFriend(nearest);
    }
  }

  addFriend(bodyId: number) {
    if (!this.isFriend(bodyId)) {
      this.friendList.push(bodyId);
      this.eventBus.emit('change', null);
    }
  }

  removeFriend(bodyId: number) {
    const i = this.friendList.findIndex(v => v === bodyId);
    if (i !== -1) {
      this.friendList.splice(i, 1);
      this.eventBus.emit('change', null);
    }
  }

  isFriend(bodyId: number) {
    return this.friendList.includes(bodyId);
  }

  getFriends(): readonly number[] {
    return this.friendList;
  }

  onChange(fn: () => void) {
    this.eventBus.on('change', fn);
  }

  /** 替换完整列表 */
  setAll(data: number[]) {
    this.friendList = [...data];
    this.eventBus.emit('change', null);
  }
}
