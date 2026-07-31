---
title: "Constructor"
source: "https://docs.dao3.fun/arenapro/en/package/component/api/NodeSystem.html"
---

# Constructor

#### NodeSystem‹T = any›(): NodeSystem

Instantiates a node system class.

**Return Value**

| **Type** | **Description** |
| --- | --- |
| NodeSystem | The node system class |

## Properties

#### uuid: string

Gets the UUID of the system.

#### Read-onlyentities: node‹T›[]

Gets the list of extended nodes for this system.

#### enable: boolean

The enabled state of this system.

## Methods

#### destroy(): void

Removes the current system instance.

This will execute the system's`onDisable`and`onDestroy`methods.

#### onEntityNodeAdded(entityNode: EntityNode): void

Called when an entity node is successfully added to the system.

You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

#### onEntityNodeRemoved(entityNode: EntityNode): void

Called when an entity node is successfully removed from the system.

You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

#### onLoad(): void

The system initialization function, called before the system is registered in the registry.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

#### update(deltaTime: number): void

If the system is enabled, this is called every frame after all components'`update`.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

**Parameters**

| **Type** | **Description** |
| --- | --- |
| deltaTime | The time difference since the last update, in milliseconds |

#### postUpdate(deltaTime: number): void

If the system is enabled, this is called every frame after all components'`lateUpdate`.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

**Parameters**

| **Type** | **Description** |
| --- | --- |
| deltaTime | The time difference since the last update, in milliseconds |

#### onEnable(): void

Called when the system is enabled, triggered when the system's`enable`property changes from`false`to`true`.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

#### onDisable(): void

Called when the system is disabled, triggered when the system's`enable`property changes from`true`to`false`.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.

#### onDestroy(): void

Called when the system is destroyed, this is the last lifecycle method before the system is completely cleaned up.

This is a lifecycle method; the parent class may not have an implementation. You can only call the parent class's implementation within this method; you cannot call this method directly elsewhere.
