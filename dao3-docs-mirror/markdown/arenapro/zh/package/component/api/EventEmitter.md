---
title: "事件通讯说明"
source: "https://docs.dao3.fun/arenapro/zh/package/component/api/EventEmitter.html"
---

# 事件通讯说明

当前支持四种类型的事件消息机制，分别为全局事件、节点事件、自定义事件以及服务端游戏世界事件。以下是针对这四种事件消息使用方法的详细介绍。

### 全局事件

typescript

```
/**
 * 全局事件总线实例化，支持由创作者自定义事件。
 *
 * Emitter 是一个全局管理事件实例，用于在整个应用中统一管理事件的触发和监听。
 * 它允许通过 `on`、`once`、`off` 等方法注册或移除事件监听器，并支持事件的触发和通知。
 *
 * 示例用法：
 * ```typescript
 * // 注册事件监听器，当收到say事件时，打印事件文本
 * Emitter.on('say', (text) => {
 *   console.log(text);
 * });
 *
 * // 触发say事件，并传入事件文本
 * Emitter.emit('say', 'Hello, world!');
 * ```
 */
export const Emitter = new EventEmitter();
```

### 节点事件

typescript

```
/**
 * 每个节点都配备独立的消息事件器，用于实现该节点下组件间的事件传递与通信，且与其他节点互不干扰。
 *
 * @example
 * ```typescript
 * const node = new EntityNode(world.querySelector("#实体名称")!);
 * node.on('say', (text) => {
 *   console.log(text);
 * });
 * ```
 */
export class EntityNode<T = any> extends EventEmitter ;
```

### 自定义事件

typescript

```
/**
 * 事件消息管理，支持由创作者自定义事件。
 *
 * EventEmitter 是一个管理事件类，用于在应用中管理事件的触发和监听。
 * 它允许通过 `on`、`once`、`off` 等方法注册或移除事件监听器，并支持事件的触发和通知。
 *
 * 示例用法：
 * ```typescript
 * // 创建一个事件发射器实例
 * const emitter = new EventEmitter();
 *
 * // 注册事件监听器，当收到say事件时，打印事件文本
 * emitter.on('say', (text) => {
 *   console.log(text);
 * });
 *
 * // 触发say事件，并传入事件文本
 * emitter.emit('say', 'Hello, world!');
 * ```
 */
export class EventEmitter extends BaseEventEmitter<string>;
```

### 服务端游戏世界事件

typescript

```
/**
 * 服务端世界游戏事件的实例化。
 *
 * GameWorldEvent 是一个 {@link GameWorld} 世界管理相关事件实例，用于处理与游戏世界相关的事件。
 * 它允许通过 `on`、`once`、`off` 等方法注册或移除事件监听器，并支持事件的触发和通知。
 *
 * 示例用法：
 * ```typescript
 * // 注册事件监听器，当玩家加入游戏时触发
 * GameWorldEvent.on(world.onPlayerJoin, ({ entity }) => {
 *   console.log(entity.player.name);
 * });
 * ```
 */
export const GameWorldEvent = new GameEvent<GameEventChannel<any>>(world);
```

---

# 构造函数

#### EventEmitter(): EventEmitter

实例化一个事件消息类

**返回值**

| **类型** | **说明** |
| --- | --- |
| EventEmitter | 事件类 |

# 方法

#### on(eventName: string, callback: (...args: any[]) => void, target?: any): this

注册事件监听

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| eventName | 是 |  | string | 事件名称 |
| callback | 是 |  | (...args: any[]) => void | 回调函数 |
| target |  | this | any | 目标对象 |

#### once(eventName: string, callback: (...args: any[]) => void, target?: any): this

注册单次事件监听，触发后自动移除

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| eventName | 是 |  | string | 事件名称 |
| callback | 是 |  | (...args: any[]) => void | 回调函数 |
| target |  | this | any | 目标对象 |

#### off(eventName: string, callback: (...args: any[]) => void, target?: any): this

移除事件监听

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| eventName | 是 |  | string | 事件名称 |
| callback | 是 |  | (...args: any[]) => void | 回调函数 |
| target |  | this | any | 目标对象 |

#### emit(eventName: string, ...args: any[]): this

触发事件

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| eventName | 是 |  | string | 事件名称 |
| ...args | 是 |  | any[] | 参数列表 |

#### dispatchEvent(event: IEvent): this

派发一个事件对象，所有监听该事件类型的监听器都会被通知。

GameEventClass 类下无此方法。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| IEvent.type | 是 |  | string | 事件类型，用于标识事件的种类 |
| IEvent.target |  | this | any | 事件目标，可选属性，表示触发该事件的元素或对象 |
| [x: string]: any |  |  | object | 其他任意值 |

#### hasEventListener(eventName: string): boolean

检查是否有特定事件的监听者

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| eventName | 是 |  | string | 事件名称 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| boolean | 是否有监听者 |

#### removeAll(): boolean

移除所有事件监听

#### targetOff(target: any): this

移除指定目标的所有事件监听

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| target | 是 |  | any | 目标对象 |
