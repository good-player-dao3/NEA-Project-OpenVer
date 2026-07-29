---
title: "Constructor"
source: "https://docs.dao3.fun/arenapro/en/package/component/api/EntityNode.html"
---

# Constructor

This extended node inherits from[EventEmitter](./EventEmitter.md).

#### EntityNode‹T = any›(entity:T): EntityNode

Instantiates an extended node class.

Components can only be attached to extended nodes.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| entity | Yes |  | T | A game entity, which can be any entity such as a character, item, UI element, etc. |

**Return Value**

| **Type** | **Description** |
| --- | --- |
| EntityNode | The extended node class |

## Static Properties

#### isMonitoringEnabled: boolean

Sets whether to enable global performance monitoring. Defaults to`true`.

When enabled, the`Component.update`method of all components will be tracked by the performance monitor to record and analyze their execution performance. Disabling this option can reduce performance overhead and is suitable for production environments or scenarios where performance monitoring is not required.

## Properties

#### Read-onlyuuid: string

Gets the UUID of this node.

#### Read-onlycomponents: Map‹string, Component‹T››

Gets all component instances on this node.

#### Read-onlyentity: entity‹T›

Gets the associated game entity.

#### enable: boolean

The enabled state of the node, which affects the per-frame update and the enabled state of components on the node.

## Static Methods

#### onPerformanceWarning(event: (event: IonPerformanceData) => void): void

Sets the global performance warning callback for components.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| event | Yes |  | (event: IonPerformanceData) => void | The callback method |

## Methods

#### addComponent‹U extends Component‹T››(componentConstructor: new (...args: any[]) => U, object?: Partial‹Omit‹U, keyof Component‹T›››): this

Adds a component of the specified type to this node.

[Using component constructor]

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| componentConstructor | Yes |  | new (...args: any[]) => U | The component constructor |
| object | No | {} | Partial‹Omit‹U, keyof Component‹T››› | Initial properties for the component, does not modify properties by default |

#### addComponent(componentName: string, object?: Record‹string, any›): this

Adds a component of the specified type to this node.

The child component class must have the`@apclass`decorator. Otherwise, the component instance cannot be obtained.

[Using component name]

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| componentName | Yes |  | string | The component name |
| object | No | {} | Record<string, any> | Initial properties for the component, does not modify properties by default |

#### getComponent(componentName: string): U | undefined

Gets a component of the specified type on this node.

[Using component name]

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| componentName | Yes |  | string | The component name |

#### getComponent‹U extends Component‹T››(componentConstructor: new (...args: any[]) => U): U | undefined

Gets a component of the specified type on this node.

[Using component constructor]

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| componentConstructor | Yes |  | new (...args: any[]) => U | The component constructor |

#### getComponentPerformance(componentName: string): IBasePerformanceData | null

Gets the performance data for a specified component on this node.

[Using component name]

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| componentName | Yes |  | string | The component name |

#### getComponentPerformance‹U extends Component‹T››(componentConstructor: new (...args: any[]) => U): IBasePerformanceData | null

Gets the performance data for a specified component on this node.

[Using component constructor]

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| componentConstructor | Yes |  | new (...args: any[]) => U | The component constructor |

#### getComponents(): Map‹string, Component‹T››

Gets all components on this node.

#### removeComponent(componentName: string): boolean

Removes a component of the specified type from the node.

[Using component name]

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| componentName | Yes |  | string | The component name |

#### removeComponent‹U extends Component‹T››(componentConstructor: new (...args: any[]) => U): boolean

Removes a component of the specified type from the node.

[Using component constructor]

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| componentConstructor | Yes |  | new (...args: any[]) => U | The component constructor |

#### removeComponentAll(): void

Removes all components from the node.

#### destroy(): void

Removes the node and all its components, and cleans up related resources.

## Functions

#### find‹U = any›(entityOrUUID:U): EntityNode‹U› | undefined

Gets a registered node instance from the global registry by entity or UUID.

- Priority: entity > uuid

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| entityOrUUID | Yes |  | U | The game entity or node UUID |
