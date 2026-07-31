---
title: "Component Lifecycle"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/lifecycle.html"
---

# Component Lifecycle

> **Important Note:**The execution order of lifecycle functions is fixed. Creators should handle the corresponding game logic at the appropriate lifecycle stage. Incorrect execution timing may lead to dependency issues between components.

![](https://static.codemao.cn/pickduck/HyH4xoin1g.png?hash=FsUtJcE2yBbKnn-btkwZrCzoc68g)

The component lifecycle refers to the series of preset events that a script component goes through from its creation to its destruction. These events define the component's behavior at different stages, helping creators effectively manage game logic and resources. Here is a detailed explanation of the component lifecycle:

### 1. Initialization Phase

- **onLoad()**: Called when the component is instantiated. This is the best time for resource loading and data initialization. It can be considered the "birth" of the component, at which point it begins to prepare to enter the game world.**It is called only once during the entire lifecycle.**

### 2. Enabling Phase

- **onEnable()**: Called when the component is enabled, after`onLoad`and before`start`. It is typically used for operations that need to be performed when the component is activated, such as registering event listeners or starting timers.

### 3. Preparation Phase

- **start()**: Called when the component is first enabled. Even if the component is subsequently disabled and re-enabled, this method will not be called again. This is the ideal time for setting initial states, registering event listeners, and other similar operations. It can be considered the moment the component "officially starts work."**It is called only once during the entire lifecycle.**

### 4. Update Phase

- **update(deltaTime)**: Called once per frame, used to implement frame update logic. The`deltaTime`parameter represents the time elapsed (in milliseconds) since the previous frame and can be used for time-related calculations, such as animations and movement. This is the core part of the game logic, updated every frame.
- **lateUpdate(deltaTime)**:`update`is executed before all animation updates. However, if we need to perform some additional operations after effects (like animations, particles, physics, etc.) have been updated, or if we want to perform other operations after all components'`update`methods have been executed, we need to use the`lateUpdate`callback.

### 5. Disabling and Destruction Phase

- **onDisable()**: Called when the component is disabled. It is typically used for unregistering event listeners, pausing animations or timers, and other similar operations. This can be understood as the component being "temporarily off duty," no longer participating in the game world's interactions.
- **onDestroy()**: Called when the component is destroyed. This is the last chance for resource cleanup, such as releasing memory or unregistering global event listeners. It can be considered the "end" of the component, as it will be completely removed from the game world.**It is called only once during the entire lifecycle.**

In summary, the component lifecycle is like a component's "life journey." By making proper use of these lifecycle callback functions, creators can manage game logic and resources in a more orderly manner, ensuring the smooth operation of the game. Each stage has its specific purpose and meaning, and correctly understanding and applying these lifecycle methods is crucial for developing high-quality games.
