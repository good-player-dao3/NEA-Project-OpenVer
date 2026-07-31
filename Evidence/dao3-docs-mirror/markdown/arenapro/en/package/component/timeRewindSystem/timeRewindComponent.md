---
title: "Beginner's Guide: Using the Time Rewind System"
source: "https://docs.dao3.fun/arenapro/en/package/component/timeRewindSystem/timeRewindComponent.html"
---

# Beginner's Guide: Using the Time Rewind System

This example demonstrates the following effect:

![](https://static.codemao.cn/pickduck/Sk0yqo1pyg.gif?hash=lm4S9GG6MmwZgPgrSsDVeN9EusVk)

## Server-side Code

**App.ts**

typescript

```
import { EntityNode } from "@dao3fun/component";
import { TimeRewindSystem } from "./TimeRewindSystem";
import { TimeRewindComponent } from "./TimeRewindComponent";

/**
 * Default system configuration
 * @property {number} maxRecordTime - Maximum rewind time (in milliseconds).
 * @property {number} recordInterval - Time interval for recording state (in milliseconds).
 * @property {number} speedFactor - Playback speed factor, used to control playback speed.
 */
const DEFAULT_CONFIG: ISystemConfig = {
  maxRecordTime: 7500,
  recordInterval: 10,
  speedFactor: 1,
};

console.clear();
world.useOBB = true;

// Initialize the system
const sys = initTimeRewindSystem();

// Get and configure entities
const entities = world.querySelectorAll(".time");
for (const entity of entities) {
  const node = createTimeRewindNode(entity);
  sys.addEntityNode(node);
}

// Start the initial rewind
setTimeout(() => sys.startRewind(), DEFAULT_CONFIG.maxRecordTime);

/**
 * System configuration object
 */
interface ISystemConfig {
  /** Maximum rewind time (in milliseconds) */
  maxRecordTime: number;
  /** Time interval for recording state (in milliseconds) */
  recordInterval: number;
  /** Speed factor */
  speedFactor: number;
}

/**
 * Initializes the time rewind system
 * @param {Partial<ISystemConfig>} config - Optional system configuration parameters
 * @returns {TimeRewindSystem} A configured instance of the time rewind system
 */
function initTimeRewindSystem(
  config: Partial<ISystemConfig> = {}
): TimeRewindSystem {
  const sys = new TimeRewindSystem();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  sys.config = {
    maxRecordTime: finalConfig.maxRecordTime,
    recordInterval: finalConfig.recordInterval,
    speedFactor: finalConfig.speedFactor,
  };

  sys.onProgress = (progress: number) => {
    remoteChannel.broadcastClientEvent({
      type: "timeRewindProgress",
      progress,
    });
  };
  sys.onEnd = () => {
    remoteChannel.broadcastClientEvent({ type: "timeRewindEnd" });
    setTimeout(() => sys.startRewind(), finalConfig.maxRecordTime);
  };

  return sys;
}

/**
 * Creates a state handler configuration
 * @param {EntityNode} node - The entity node
 * @returns A state handler configuration object
 */
function createStateHandlers(node: EntityNode) {
  return {
    position: {
      get: () => node.entity.position,
      set: (value: GameVector3) =>
        node.entity.position.set(value.x, value.y, value.z),
    },
    meshOrientation: {
      get: () => node.entity.meshOrientation,
      set: (value: GameQuaternion) =>
        node.entity.meshOrientation.set(value.w, value.x, value.y, value.z),
    },
  };
}

/**
 * Creates a callback function configuration
 * @param {EntityNode} node - The entity node
 * @returns A callback function configuration object
 */
function createCallbacks(node: EntityNode) {
  return {
    onStart: () => {
      node.entity.fixed = true;
      node.entity.gravity = false;
      node.entity.collides = false;
    },
    onEnd: () => {
      node.entity.fixed = false;
      node.entity.gravity = true;
      node.entity.collides = true;
    },
  };
}

/**
 * Creates and configures a time rewind node for an entity
 * @param {GameEntity} entity - The game entity
 * @returns {EntityNode} The configured entity node
 */
function createTimeRewindNode(entity: GameEntity): EntityNode {
  const node = new EntityNode(entity);
  node.addComponent(TimeRewindComponent);

  const trc = node.getComponent(TimeRewindComponent);
  if (trc) {
    trc.config = {
      stateHandlers: createStateHandlers(node),
      callbacks: createCallbacks(node),
    };
  }

  return node;
}
```

**TimeRewindComponent.ts**

typescript

```
import { _decorator, Component } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * Type definition for state getters and setters
 */
export interface IStateHandler<T = any> {
  /** Get the state value */
  get: () => T;
  /** Set the state value */
  set: (value: T) => void;
}

/**
 * Configuration interface for the time rewind component
 * @interface IRewindConfig
 */
export interface IRewindConfig {
  /** A map of state handlers, including methods for getting and setting state */
  stateHandlers: Record<string, IStateHandler>;
  /** Rewind event callbacks */
  callbacks?: {
    /** Callback function for when rewinding starts */
    onStart?: () => void;
    /** Callback function for when rewinding ends */
    onEnd?: () => void;
    /** Callback function for rewind progress updates */
    onProgress?: (progress: number) => void;
  };
}

/**
 * Time Rewind Component
 * Used to identify if an entity has rewind functionality and to store rewind-related configuration.
 *
 * This component follows ECS architecture design principles:
 * 1. The component only stores data, not business logic.
 * 2. State data is managed centrally by the TimeRewindSystem.
 * 3. The component notifies the system of state changes through events.
 *
 * @class TimeRewindComponent
 * @extends {Component<GameEntity>}
 */
@apclass()
export class TimeRewindComponent extends Component<GameEntity> {
  /**
   * Configuration options for the time rewind component
   */
  config: IRewindConfig = {
    stateHandlers: {},
    callbacks: {},
  };
}
```

**TimeRewindSystem.ts**

typescript

```
import { _decorator, NodeSystem } from "@dao3fun/component";
import { TimeRewindComponent } from "./TimeRewindComponent";

/**
 * Interface definition for a state snapshot
 * Used to store an entity's state data at a specific point in time.
 *
 * Snapshot design principles:
 * 1. Time identification: Each snapshot must have a unique timestamp.
 * 2. State integrity: Contains all states of the entity that need to be rewound at that point in time.
 * 3. Entity association: Establishes a correspondence with a specific entity through entityId.
 * 4. Data independence: Snapshot data is independent of the entity's current state.
 *
 * @interface IStateSnapshot
 * @property {number} timestamp - The timestamp of the snapshot, recording the specific time the state was saved.
 * @property {Record<string, any>} states - The state data contained in the snapshot, where the key is the state name and the value is the state value.
 * @property {string} entityId - The entity ID, used to identify which entity the state belongs to.
 */
interface IStateSnapshot {
  /** The timestamp of the snapshot */
  timestamp: number;
  /** The state data contained in the snapshot */
  states: Record<string, any>;
  /** The entity ID */
  entityId: string;
}

/**
 * Time Rewind System
 * Used to centrally manage the rewind functionality of multiple entities, achieving a time-rewind effect in the game.
 *
 * System design principles:
 * 1. Single responsibility: Focuses on managing the recording and playback of entity states.
 * 2. Data-driven: Stores and restores entity states through snapshots.
 * 3. Component decoupling: Works with TimeRewindComponent to achieve separation of concerns.
 * 4. Performance optimization: Uses a Map to store snapshots and supports periodic cleanup of expired data.
 * 5. State consistency: Ensures the continuity and accuracy of entity states during the rewind process.
 *
 * Core functionalities:
 * 1. State recording: Periodically saves entity state snapshots.
 * 2. State playback: Supports rewinding entity states along a timeline.
 * 3. Interpolation calculation: Achieves smooth transitions between states.
 * 4. Memory management: Automatically cleans up expired snapshot data.
 *
 * @extends {NodeSystem}
 */
export class TimeRewindSystem extends NodeSystem {
  /** Whether rewinding is in progress */
  private isRewinding: boolean = false;
  /** Stores state snapshots for all entities, using a Map to improve query efficiency */
  private snapshotMap: Map<string, IStateSnapshot[]> = new Map();
  /** Timestamp of the last state recording, used to control recording frequency */
  private lastRecordTime: number = 0;
  /** Rewind start time */
  private rewindStartTime: number = 0;
  /** Rewind end time */
  private rewindEndTime: number = 0;
  /**
   * Default configuration for the system
   * @property {number} maxRecordTime - Maximum rewind time (in milliseconds).
   * @property {number} recordInterval - Time interval for recording state (in milliseconds).
   * @property {number} speedFactor - Playback speed factor, used to control playback speed.
   */
  config = {
    maxRecordTime: 6000,
    recordInterval: 50,
    speedFactor: 1,
  };

  /** System update callback */
  onProgress: (progress: number) => void = () => {};
  /** Rewind end callback */
  onEnd: () => void = () => {};

  /**
   * System update function
   * Executes recording or playback operations based on the current state.
   *
   * @param {number} deltaTime - The frame interval time (in milliseconds).
   */
  protected update(deltaTime: number): void {
    if (this.isRewinding) {
      this.rewindEntities();
    } else {
      this.recordEntities();
    }
  }

  /**
   * Records the state of all entities managed by the system
   */
  private recordEntities(): void {
    const now = Date.now();
    if (now - this.lastRecordTime < this.config.recordInterval) {
      return;
    }

    this.lastRecordTime = now;

    for (const node of this.entities) {
      const component = node.getComponent(TimeRewindComponent);
      if (!component) continue;

      const states: Record<string, any> = {};
      for (const key in component.config.stateHandlers) {
        states[key] = component.config.stateHandlers[key].get();
      }

      const snapshots = this.snapshotMap.get(node.uuid) || [];
      snapshots.push({
        timestamp: now,
        states,
        entityId: node.uuid,
      });
      this.snapshotMap.set(node.uuid, snapshots);
    }

    this.cleanupOldSnapshots();
  }

  /**
   * Cleans up snapshots that are older than the maximum record time
   */
  private cleanupOldSnapshots(): void {
    const now = Date.now();
    for (const [entityId, snapshots] of this.snapshotMap.entries()) {
      const filteredSnapshots = snapshots.filter(
        (s) => now - s.timestamp < this.config.maxRecordTime
      );
      this.snapshotMap.set(entityId, filteredSnapshots);
    }
  }

  /**
   * Rewinds the state of all entities managed by the system
   */
  private rewindEntities(): void {
    const now = Date.now();
    const elapsedTime = (now - this.rewindStartTime) * this.config.speedFactor;
    const rewindTime = this.rewindEndTime - elapsedTime;

    if (rewindTime <= this.rewindEndTime - this.config.maxRecordTime) {
      this.stopRewind();
      return;
    }

    for (const node of this.entities) {
      this.rewindEntity(node, rewindTime);
    }

    const progress = (elapsedTime / this.config.maxRecordTime) * 100;
    this.onProgress(Math.min(progress, 100));
  }

  /**
   * Rewinds the state of a single entity
   * @param {EntityNode} node - The entity node to rewind
   * @param {number} rewindTime - The target time to rewind to
   */
  private rewindEntity(node: EntityNode, rewindTime: number): void {
    const snapshots = this.snapshotMap.get(node.uuid);
    if (!snapshots || snapshots.length < 2) return;

    const futureIndex = snapshots.findIndex((s) => s.timestamp >= rewindTime);
    if (futureIndex <= 0) return;

    const past = snapshots[futureIndex - 1];
    const future = snapshots[futureIndex];
    const t =
      (rewindTime - past.timestamp) / (future.timestamp - past.timestamp);

    const component = node.getComponent(TimeRewindComponent);
    if (!component) return;

    for (const key in component.config.stateHandlers) {
      const pastState = past.states[key];
      const futureState = future.states[key];
      const interpolatedState = this.interpolate(pastState, futureState, t);
      component.config.stateHandlers[key].set(interpolatedState);
    }
  }

  /**
   * Starts the time rewind process
   */
  public startRewind(): void {
    if (this.isRewinding) return;

    this.isRewinding = true;
    this.rewindStartTime = Date.now();
    this.rewindEndTime = this.rewindStartTime;

    for (const node of this.entities) {
      const component = node.getComponent(TimeRewindComponent);
      component?.config.callbacks?.onStart?.();
    }
  }

  /**
   * Stops the time rewind process
   */
  public stopRewind(): void {
    if (!this.isRewinding) return;

    this.isRewinding = false;
    for (const node of this.entities) {
      const component = node.getComponent(TimeRewindComponent);
      component?.config.callbacks?.onEnd?.();
    }
    this.onEnd();
  }

  /**
   * Interpolates between two states
   * @param {any} start - The start state
   * @param {any} end - The end state
   * @param {number} t - The interpolation factor
   * @returns {any} The interpolated state
   */
  private interpolate(start: any, end: any, t: number): any {
    if (typeof start === "number") {
      return start + (end - start) * t;
    }

    if (typeof start === "object" && start !== null) {
      if (typeof start.lerp === "function") {
        return start.lerp(end, t);
      }

      const result: Record<string, any> = {};
      for (const key in start) {
        result[key] = this.interpolate(start[key], end[key], t);
      }
      return result;
    }

    return start;
  }
}
```

## Client-side Code

app.js

javascript

```
const progressBar = new ui.UiBox({
  id: "progress-bar",
  scale: [0, 0.05],
  position: [0.5, 0.1],
  pivot: [0.5, 0.5],
  color: [0, 1, 0],
});
screen.add(progressBar);

remoteChannel.onClientEvent(({ type, progress }) => {
  switch (type) {
    case "timeRewindProgress":
      progressBar.scale.x = progress / 100;
      break;
    case "timeRewindEnd":
      progressBar.scale.x = 0;
      break;
  }
});
```

```

```
