/**
 * @module Core
 * Box3客户端core的wrapper。
 */

import { unsafeWindow } from '$';
import { Logger } from 'src/utils/logger';
import { EventBus } from 'src/utils/event-bus';
import { type GameCore } from 'src/core/game-core';
import { CoreBodies } from './bodies';
import { CoreSecret } from './secret';
import { CoreCamera } from './camera';
import { CorePlayers } from './players';
import { CoreDamage } from './damage';
import { CoreInput } from './input';
import { CoreRaycast } from './raycast';
import { CoreVoxels } from './voxels';
import { CoreRemoteChannel } from './remote';
import { NetInputInterceptor } from './net-input';
import { CoreChat } from './chat';

const logger = new Logger('core');

export class Core {
  private static instance: Core;
  /**
   * 从浏览器中捕获的raw core。
   *
   * 警告：在src/core之外，严禁任何对raw的直接调用
   */
  private gameCore!: GameCore;
  ready: boolean = false;

  bodies!: CoreBodies;

  secret!: CoreSecret;

  camera!: CoreCamera;

  players!: CorePlayers;

  damage!: CoreDamage;

  input!: CoreInput;

  raycast!: CoreRaycast;

  voxels!: CoreVoxels;

  remote!: CoreRemoteChannel;

  netInput!: NetInputInterceptor;

  chat!: CoreChat;

  private constructor() {
    this.event.on('ready', this.adaptProperties.bind(this));
  }

  event = new EventBus();

  /**
   * 原型监听Helper。
   *
   * 通过修改原型，监听对象上关键词的设立，反向抓出raw core
   * @param param 监听关键字
   * @returns raw core
   */
  private static listenPrototype(param: string) {
    const instance = Core.getInstance();

    // 检查是否已经定义过
    if (Object.getOwnPropertyDescriptor(Object.prototype, param)) {
      return;
    }

    Object.defineProperty(Object.prototype, param, {
      set() {
        // @ts-ignore
        delete Object.prototype[param];
        const gameCore = this as GameCore;
        instance.gameCore = gameCore; // 缓存 core 对象
        (unsafeWindow as any).core = gameCore;
        gameCore.onGameReady.handlers.push(() =>
          setTimeout(() => {
            instance.ready = true;
            Core.getInstance().event.emit('ready', instance);
            logger.i('Core loaded: ', gameCore);
          }, 500)
        );
      },
      configurable: true,
    });
  }

  onReady(fn: (core: Core) => void) {
    if (this.ready) {
      fn(this);
    } else {
      this.event.on('ready', fn);
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Core();
    }
    return this.instance;
  }

  static loadCore() {
    let param: string;
    if (window.location.pathname.startsWith('/p')) {
      param = 'isAdmin';
    } else if (window.location.pathname.startsWith('/e')) {
      param = 'permissionController';
    } else {
      return;
    }

    if (param) {
      Core.listenPrototype(param);
    }
  }

  private adaptProperties() {
    this.bodies = new CoreBodies(this.gameCore);
    this.secret = new CoreSecret(this.gameCore);
    this.camera = new CoreCamera(this.gameCore);
    this.players = new CorePlayers(this.gameCore);
    this.damage = new CoreDamage(this.gameCore);
    this.input = new CoreInput(this.gameCore);
    this.voxels = new CoreVoxels(this.gameCore);
    this.raycast = new CoreRaycast(this.gameCore, this.bodies, this.camera, this.voxels);
    this.remote = new CoreRemoteChannel(this.gameCore);
    this.netInput = new NetInputInterceptor(this.gameCore);
    this.chat = new CoreChat(this.gameCore);
  }

  onTick(fn: () => void) {
    let handlers: Function[] | null = null;

    this.onReady(() => {
      handlers = this.gameCore!.game.onTick.handlers;
      handlers.push(fn);
    });

    return () => {
      if (handlers) {
        const index = handlers.findIndex(v => v === fn);
        handlers.splice(index, 1);
      }
    };
  }

  get tick() {
    return this.gameCore.game.state.clock.tick;
  }

  get clock() {
    return this.gameCore.game.state.clock.clock;
  }

  get ping() {
    return this.gameCore.game.state.clock.ping;
  }

  get mapId() {
    return this.gameCore.game.state.config.mapInfo.contentId;
  }
}

Core.loadCore();
