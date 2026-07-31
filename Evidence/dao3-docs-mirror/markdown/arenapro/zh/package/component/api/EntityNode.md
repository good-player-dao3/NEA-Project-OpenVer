---
title: "构造函数"
source: "https://docs.dao3.fun/arenapro/zh/package/component/api/EntityNode.html"
---

# 构造函数

该扩展节点继承至[EventEmitter](./EventEmitter.md)。

#### EntityNode‹T = any›(entity:T): EntityNode

实例化一个扩展节点类

组件只能挂载在扩展节点上。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| entity | 是 |  | T | 游戏实体，可以是任意实体，例如角色、道具、ui 等 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| EntityNode | 扩展节点类 |

## 静态属性

#### isMonitoringEnabled: boolean

设置是否启用全局性能监控。 默认为 true。

当启用时，所有组件的 Component.update 方法将被性能监控器跟踪， 以便记录和分析其执行性能。关闭此选项可以减少性能开销，适用于生产环境或不需要性能监控的场景。

## 属性

#### 只读uuid: string

获取该节点的 uuid。

#### 只读components: Map‹string, Component‹T››

获取该节点下所有组件实例。

#### 只读entity: entity‹T›

获取关联的游戏实体。

#### enable: boolean

节点启用状态，会影响每帧刷新和节点下的组件启用状态。

## 静态方法

#### onPerformanceWarning(event: (event: IonPerformanceData) => void): void

设置全局组件的性能警告回调。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| event | 是 |  | (event: IonPerformanceData) => void | 回调方法 |

## 方法

#### addComponent‹U extends Component‹T››(componentConstructor: new (...args: any[]) => U, object?: Partial‹Omit‹U, keyof Component‹T›››): this

向该节点增加指定类型的组件。

【使用组件构造函数】

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| componentConstructor | 是 |  | new (...args: any[]) => U | 组件构造函数 |
| object |  | {} | Partial‹Omit‹U, keyof Component‹T››› | 组件初始化属性，默认不修改属性 |

#### addComponent(componentName: string, object?: Record‹string, any›): this

向该节点增加指定类型的组件。

子组件类须加上@apclass 修饰器。否则无法获取组件实例。

【使用组件名】

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| componentName | 是 |  | string | 组件名 |
| object |  | {} | Record<string, any> | 组件初始化属性，默认不修改属性 |

#### getComponent(componentName: string): U | undefined

获取该节点下指定类型的组件。

【使用组件名】

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| componentName | 是 |  | string | 组件名 |

#### getComponent‹U extends Component‹T››(componentConstructor: new (...args: any[]) => U): U | undefined

获取该节点下指定类型的组件。

【使用组件构造函数】

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| componentConstructor | 是 |  | new (...args: any[]) => U | 组件构造函数 |

#### getComponentPerformance(componentName: string): IBasePerformanceData | null

获取该节点下指定的组件性能数据。

【使用组件名】

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| componentName | 是 |  | string | 组件名 |

#### getComponentPerformance‹U extends Component‹T››(componentConstructor: new (...args: any[]) => U): IBasePerformanceData | null

获取该节点下指定的组件性能数据。

【使用组件构造函数】

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| componentConstructor | 是 |  | new (...args: any[]) => U | 组件构造函数 |

#### getComponents(): Map‹string, Component‹T››

获取该节点下所有组件。

#### removeComponent(componentName: string): boolean

移除节点下指定类型的组件。

【使用组件名】

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| componentName | 是 |  | string | 组件名 |

#### removeComponent‹U extends Component‹T››(componentConstructor: new (...args: any[]) => U): boolean

移除节点下指定类型的组件。

【使用组件构造函数】

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| componentConstructor | 是 |  | new (...args: any[]) => U | 组件构造函数 |

#### removeComponentAll(): void

移除节点下所有组件。

#### destroy(): void

移除节点及其所有组件，并清理相关资源。

## 函数

#### find‹U = any›(entityOrUUID:U): EntityNode‹U› | undefined

根据 entity 或 uuid 从全局注册表中获取一个已注册的节点实例。

- 优先级：entity > uuid

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| entityOrUUID | 是 |  | U | 游戏实体或节点 uuid |
