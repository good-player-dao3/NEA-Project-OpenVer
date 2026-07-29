---
title: "Event Communication Guide"
source: "https://docs.dao3.fun/arenapro/en/package/component/api/EventEmitter.html"
---

# Event Communication Guide

Currently, four types of event messaging mechanisms are supported: global events, node events, custom events, and server-side game world events. The following is a detailed introduction to the usage of these four types of event messages.

### Global Events

typescript

```
/**
 * Global event bus instance, supporting custom events by creators.
 *
 * Emitter is a global event management instance used to uniformly manage event triggering and listening throughout the application.
 * It allows registering or removing event listeners through methods like `on`, `once`, `off`, and supports event triggering and notification.
 *
 * Example usage:
 * ```typescript
 * // Register an event listener to print the event text when a 'say' event is received.
 * Emitter.on('say', (text) => {
 *   console.log(text);
 * });
 *
 * // Trigger the 'say' event and pass the event text.
 * Emitter.emit('say', 'Hello, world!');
 * ```
 */
export const Emitter = new EventEmitter();
```

### Node Events

typescript

```
/**
 * Each node is equipped with an independent message event emitter, used for event passing and communication between components under that node, without interfering with other nodes.
 *
 * @example
 * ```typescript
 * const node = new EntityNode(world.querySelector("#entityName")!);
 * node.on('say', (text) => {
 *   console.log(text);
 * });
 * ```
 */
export class EntityNode<T = any> extends EventEmitter;
```

### Custom Events

typescript

```
/**
 * Event message management, supporting custom events by creators.
 *
 * EventEmitter is an event management class used to manage event triggering and listening in an application.
 * It allows registering or removing event listeners through methods like `on`, `once`, `off`, and supports event triggering and notification.
 *
 * Example usage:
 * ```typescript
 * // Create an event emitter instance
 * const emitter = new EventEmitter();
 *
 * // Register an event listener to print the event text when a 'say' event is received
 * emitter.on('say', (text) => {
 *   console.log(text);
 * });
 *
 * // Trigger the 'say' event and pass the event text
 * emitter.emit('say', 'Hello, world!');
 * ```
 */
export class EventEmitter extends BaseEventEmitter<string>;
```

### Server-side Game World Events

typescript

```
/**
 * Instantiation of server-side world game events.
 *
 * GameWorldEvent is a {@link GameWorld} world management related event instance, used to handle events related to the game world.
 * It allows registering or removing event listeners through methods like `on`, `once`, `off`, and supports event triggering and notification.
 *
 * Example usage:
 * ```typescript
 * // Register an event listener to trigger when a player joins the game
 * GameWorldEvent.on(world.onPlayerJoin, ({ entity }) => {
 *   console.log(entity.player.name);
 * });
 * ```
 */
export const GameWorldEvent = new GameEvent<GameEventChannel<any>>(world);
```

---

# Constructor

#### EventEmitter(): EventEmitter

Instantiates an event message class.

**Return Value**

| **Type** | **Description** |
| --- | --- |
| EventEmitter | Event class |

# Methods

#### on(eventName: string, callback: (...args: any[]) => void, target?: any): this

Registers an event listener.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| eventName | Yes |  | string | Event name |
| callback | Yes |  | (...args: any[]) => void | Callback function |
| target | No | this | any | Target object |

#### once(eventName: string, callback: (...args: any[]) => void, target?: any): this

Registers a one-time event listener, which is automatically removed after being triggered.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| eventName | Yes |  | string | Event name |
| callback | Yes |  | (...args: any[]) => void | Callback function |
| target | No | this | any | Target object |

#### off(eventName: string, callback: (...args: any[]) => void, target?: any): this

Removes an event listener.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| eventName | Yes |  | string | Event name |
| callback | Yes |  | (...args: any[]) => void | Callback function |
| target | No | this | any | Target object |

#### emit(eventName: string, ...args: any[]): this

Triggers an event.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| eventName | Yes |  | string | Event name |
| ...args | Yes |  | any[] | Argument list |

#### dispatchEvent(event: IEvent): this

Dispatches an event object, and all listeners for that event type will be notified.

This method is not available in the`GameEventClass`class.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| IEvent.type | Yes |  | string | Event type, used to identify the kind of event |
| IEvent.target | No | this | any | Event target, optional property, represents the element or object that triggered the event |
| [x: string]: any | No |  | object | Other arbitrary values |

#### hasEventListener(eventName: string): boolean

Checks if there are listeners for a specific event.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| eventName | Yes |  | string | Event name |

**Return Value**

| **Type** | **Description** |
| --- | --- |
| boolean | Whether there are listeners |

#### removeAll(): boolean

Removes all event listeners.

#### targetOff(target: any): this

Removes all event listeners for a specified target.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| target | Yes |  | any | Target object |
