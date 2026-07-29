import { Core } from 'src/core/core';
import { LokiAPI } from 'src/api/api';
import { type PresencePlayer } from 'src/api/schema';
import { EventBus } from 'src/utils/event-bus';
import { Logger } from 'src/utils/logger';

const logger = new Logger('presence');
const HEARTBEAT_INTERVAL = 15_000;

/**
 * PresenceManager — LokiBox 用户在线发现。
 *
 * - Core ready 后自动启动，从 Core.mapId 取地图 ID
 * - 每 15 秒发送心跳，响应直接带回同地图玩家列表
 * - 通过 onChange 通知 UI 层更新
 */
export class PresenceManager {
  private static instance: PresenceManager;

  private api = LokiAPI.getInstance();
  private core = Core.getInstance();
  private eventBus = new EventBus();

  private players: PresencePlayer[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  static getInstance() {
    if (!this.instance) {
      this.instance = new PresenceManager();
    }
    return this.instance;
  }

  /** Core ready 后自动启动心跳 */
  init() {
    this.core.onReady(() => {
      const mapId = String(this.core.mapId);
      const playerId = this.core.secret?.id;
      this.start(mapId, playerId);
      logger.i('auto-start', mapId, playerId);
    });
  }

  /** 开始上报心跳 */
  private start(mapId: string, playerId?: number) {
    if (this.running) this.stop();

    this.running = true;

    const tick = () => {
      this.api
        .sendHeartbeat(mapId, playerId)
        .then(resp => {
          if (resp.code === 'OK') {
            this.players = resp.data.players;
            this.eventBus.emit('change', null);
          } else {
            logger.w('heartbeat error', resp.code, resp.message);
          }
        })
        .catch(e => {
          logger.w('heartbeat fail', e.message);
        });
    };

    tick();
    this.timer = setInterval(tick, HEARTBEAT_INTERVAL);
  }

  /** 停止心跳 */
  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
    this.players = [];
    this.eventBus.emit('change', null);
    logger.i('stop');
  }

  getPlayers(): readonly PresencePlayer[] {
    return this.players;
  }

  onChange(fn: () => void) {
    this.eventBus.on('change', fn);
  }

  get isRunning() {
    return this.running;
  }
}
