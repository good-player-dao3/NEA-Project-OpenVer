---
title: "构造函数"
source: "https://docs.dao3.fun/arenapro/zh/package/component/api/NodeSystem.html"
---

# 构造函数

#### NodeSystem‹T = any›(): NodeSystem

实例化一个节点系统类

**返回值**

| **类型** | **说明** |
| --- | --- |
| NodeSystem | 节点系统类 |

## 属性

#### uuid: string

获得系统的 uuid。

#### 只读entities: node‹T›[]

获取该系统的扩展节点列表。

#### enable: boolean

该系统启用状态。

## 方法

#### destroy(): void

移除当前系统实例。

会执行系统的`onDisable`和`onDestroy`方法

#### onEntityNodeAdded(entityNode: EntityNode): void

当实体节点成功被添加到系统时调用。

你只能在该方法内部调用父类的实现，不可在其它地方直接调用该方法。

#### onEntityNodeRemoved(entityNode: EntityNode): void

当实体节点成功被移除到系统时调用。

你只能在该方法内部调用父类的实现，不可在其它地方直接调用该方法。

#### onLoad(): void

系统初始化函数，在系统被注册到注册表之前调用

该方法为生命周期方法，父类未必会有实现。并且你只能在该方法内部调用父类的实现，不可在其它地方直接调用该方法。

#### update(deltaTime: number): void

如果该系统启用，在每一帧中在所有组件的 update 之后被调用

该方法为生命周期方法，父类未必会有实现。并且你只能在该方法内部调用父类的实现，不可在其它地方直接调用该方法。

**返回值**

| **类型** | **说明** |
| --- | --- |
| deltaTime | 自上次更新以来的时间差，单位为毫秒 |

#### postUpdate(deltaTime: number): void

如果该系统启用，在每一帧中在所有组件的 lateUpdate 之后被调用

该方法为生命周期方法，父类未必会有实现。并且你只能在该方法内部调用父类的实现，不可在其它地方直接调用该方法。

**返回值**

| **类型** | **说明** |
| --- | --- |
| deltaTime | 自上次更新以来的时间差，单位为毫秒 |

#### onEnable(): void

系统启用时调用，当系统的 enable 属性从 false 变为 true 时触发。

该方法为生命周期方法，父类未必会有实现。并且你只能在该方法内部调用父类的实现，不可在其它地方直接调用该方法。

#### onDisable(): void

系统禁用时调用，当系统的 enable 属性从 true 变为 false 时触发。

该方法为生命周期方法，父类未必会有实现。并且你只能在该方法内部调用父类的实现，不可在其它地方直接调用该方法。

#### onDestroy(): void

系统销毁时调用，在系统被完全清理之前的最后一个生命周期方法。

该方法为生命周期方法，父类未必会有实现。并且你只能在该方法内部调用父类的实现，不可在其它地方直接调用该方法。
