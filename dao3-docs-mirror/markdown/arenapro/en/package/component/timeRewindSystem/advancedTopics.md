---
title: "Advanced Topics: A Deep Dive into the Source Code"
source: "https://docs.dao3.fun/arenapro/en/package/component/timeRewindSystem/advancedTopics.html"
---

# Advanced Topics: A Deep Dive into the Source Code

## The Rewind Component

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

This code defines a component for implementing a game's time rewind feature, designed with the ECS (Entity-Component-System) architecture. Here is a detailed explanation:

### Core Concepts

1. **Component's Role**:
  - Marks which game entities have time rewind capabilities.
  - Stores the configuration and data required for each entity to perform a time rewind.
  - Acts as a bridge between the System and the Entity.
2. **Design Principles**:
  - Strictly adheres to the ECS architecture: components only store data and do not contain business logic.
  - State data is managed centrally by the`TimeRewindSystem`.
  - Communicates with the system through an event mechanism.

### Key Parts Explained

#### 1. State Handler Interface (IStateHandler)

typescript

```
interface IStateHandler<T = any> {
  get: () => T; // Gets the current state value
  set: (value: T) => void; // Sets the state value
}
```

- Defines how to get and set various states of an entity (such as position, rotation, etc.).
- The generic`<T>`supports different types of state data.

#### 2. Component Configuration Interface (IRewindConfig)

typescript

```
interface IRewindConfig {
  stateHandlers: Record<string, IStateHandler>; // A collection of state handlers
  callbacks?: {
    // Optional callback functions
    onStart?: () => void; // Rewind starts
    onEnd?: () => void; // Rewind ends
    onProgress?: (progress: number) => void; // Progress update
  };
}
```

- `stateHandlers`: Defines which states need to be recorded and replayed (e.g.,`position`,`rotation`).
- `callbacks`: Events triggered at various points during the rewind process.

#### 3. Component Class (TimeRewindComponent)

typescript

```
@apclass()
export class TimeRewindComponent extends Component<GameEntity> {
  config: IRewindConfig = {
    stateHandlers: {},
    callbacks: {},
  };
}
```

- Uses the`@apclass()`decorator (which is likely framework-specific).
- Inherits from the base`Component`class.
- Contains a`config`property to store the above configuration.

### How It Works

1. The**System**will query all entities that have a`TimeRewindComponent`.
2. It gets and sets the entity's state through the component's`stateHandlers`.
3. It calls the component's callback functions to notify of state changes during the rewind process.

### Practical Application Example

typescript

```
// Add the time rewind component to an entity
const entity = new GameEntity();
const rewindComp = entity.addComponent(TimeRewindComponent);

// Configure the component
rewindComp.config = {
  stateHandlers: {
    position: {
      get: () => entity.position,
      set: (pos) => entity.position.copy(pos),
    },
    rotation: {
      get: () => entity.rotation,
      set: (rot) => entity.rotation.copy(rot),
    },
  },
  callbacks: {
    onStart: () => console.log("Rewind started"),
    onEnd: () => console.log("Rewind ended"),
  },
};
```

This component is the data carrier for the time rewind system. The actual recording and playback logic is implemented by the corresponding System.

## The Rewind System

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

  /**
   * System update function
   * Executes recording or playback operations based on the current state.
   *
   * Update flow:
   * 1. Check the current state of the system (recording/playback).
   * 2. Call the corresponding handler function based on the state.
   * 3. Handle any exceptions that may occur.
   *
   * @param {number} deltaTime - The frame interval time (in milliseconds).
   * @throws {Error} Throws an error when an issue occurs during state recording or playback.
   *
   * @example
   * // Call in the main game loop
   * timeRewindSystem.update(16.67); // Assuming 60 FPS
   */
  protected update(deltaTime: number): void {
    if (this.isRewinding) {
      this.rewindEntities();
    } else {
      this.recordEntities();
    }
  }
}
```

This code defines a system for managing time rewind functionality for multiple entities. Let's break down the key parts:

### Core Concepts

1. **System's Role**:
  - Centrally manages the recording and playback of states for all entities with the`TimeRewindComponent`.
  - Implements the core logic for the time rewind effect.
2. **Design Principles**:
  - **Single Responsibility**: The system's only job is to manage time rewind.
  - **Data-Driven**: It operates based on the state snapshots it collects.
  - **Decoupling**: It interacts with entities through the`TimeRewindComponent`, avoiding direct dependencies.
  - **Performance**: Uses a`Map`for efficient snapshot storage and retrieval, and includes a mechanism for cleaning up old data.
  - **Consistency**: Ensures that the state of entities remains accurate and continuous during the rewind process.

### Key Parts Explained

#### 1. State Snapshot Interface (IStateSnapshot)

typescript

```
interface IStateSnapshot {
  timestamp: number;
  states: Record<string, any>;
  entityId: string;
}
```

- Defines the structure for storing an entity's state at a specific moment in time.
- `timestamp`: The exact time the state was saved.
- `states`: A collection of all the states being tracked (e.g.,`{ position: {x,y,z}, rotation: {x,y,z,w} }`).
- `entityId`: Links the snapshot to a specific entity.

#### 2. System Class (TimeRewindSystem)

- Inherits from a base`NodeSystem`class.
- Manages the overall state of the rewind process (`isRewinding`).
- `snapshotMap`: A`Map`where the key is the entity's ID and the value is an array of its`IStateSnapshot`s. This is the "timeline" for each entity.
- `config`: Contains settings like how long to record (`maxRecordTime`), how often to save a snapshot (`recordInterval`), and the playback speed (`speedFactor`).
- `update(deltaTime)`: The main entry point, called every frame from the game loop. It decides whether to`recordEntities`or`rewindEntities`based on the`isRewinding`flag.

### Main Functions (Conceptual)

- `recordEntities()`:
  - Iterates through all entities managed by the system.
  - If enough time has passed since the last record (`recordInterval`), it gets the current state of each entity using the`get`functions defined in their`TimeRewindComponent`'s`stateHandlers`.
  - Creates a new`IStateSnapshot`with the current timestamp and state data.
  - Adds this snapshot to the entity's timeline in`snapshotMap`.
  - Calls`cleanupOldSnapshots()`to remove snapshots that are older than`maxRecordTime`.
- `rewindEntities()`:
  - Calculates the current point in time for the rewind based on`rewindStartTime`and`speedFactor`.
  - For each entity, it finds the two snapshots in its timeline that surround the current rewind time.
  - It then**interpolates**between these two snapshots to calculate the state (e.g., position, rotation) for the current moment. Linear interpolation (`lerp`) is a common method for this.
  - It uses the`set`functions from the`TimeRewindComponent`'s`stateHandlers`to apply the calculated interpolated state back to the entity.
  - Calls the`onProgress`callback.
  - When the rewind is finished, it sets`isRewinding`to`false`and calls the`onEnd`callback.

This system provides a complete, reusable, and efficient solution for implementing a time rewind feature in a game.
