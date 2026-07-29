---
title: "Properties"
source: "https://docs.dao3.fun/arenapro/en/package/component/api/Component.html"
---

# Properties

#### weight: number

The weight of the component. The smaller the value, the greater the weight. Components are sorted by weight during updates.

Default: 0

#### Read-onlynode: node‹T›

Gets the extended node associated with this component.

#### enable: boolean

The enabled state of this component.

## Methods

#### destroy(): void

Removes the current component instance from the current node.

This will execute the component's`onDisable`and`onDestroy`methods.

#### onLoad(): void

Called when attached to a node or when its node is activated for the first time.`onLoad`is always called before any`start`methods, which can be used to schedule the initialization order of scripts.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

#### start(): void

If the component is enabled for the first time, this is called before all components'`update`. It is typically used for logic that needs to be executed after all components'`onLoad`initializations are complete.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

#### update(deltaTime: number): void

If the component is enabled,`update`is called every frame (60 FPS).

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

**Parameters**

| **Type** | **Description** |
| --- | --- |
| deltaTime | The time difference since the last update, in milliseconds |

#### lateUpdate(deltaTime: number): void

If the component is enabled,`lateUpdate`is called after all components on the node have finished their`update`.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

**Parameters**

| **Type** | **Description** |
| --- | --- |
| deltaTime | The time difference since the last update, in milliseconds |

#### onEnable(): void

Called when this component is enabled and its node is also active.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

#### onDisable(): void

Called when this component is disabled or its node becomes inactive.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

#### onDestroy(): void

Called when this component is destroyed.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

## Decorator Function

#### apclass‹T extends { new (...args: any[]): Component }›(constructor:T): void

The purpose of this decorator function is to ensure that the passed constructor is a subclass of the`Component`class and to automatically register it in`registryComponent`, so we can register components directly using the class name.
