---
title: "Intermediate Topics: Core Concepts and Implementation of the Rewind System"
source: "https://docs.dao3.fun/arenapro/en/package/component/timeRewindSystem/intermediateTopics.html"
---

# Intermediate Topics: Core Concepts and Implementation of the Rewind System

## 1. System Overview

The time rewind system is used to implement a time-rewind effect in the game, allowing for the recording and playback of entity state changes. Its main features include:

- **State Recording**: Automatically records the position and orientation of entities.
- **State Playback**: Supports rewinding and replaying previous states.
- **Physics Control**: Automatically manages physical properties during the rewind process.

## 2. Quick Start

### 2.1 Initializing the System

typescript

```
import { TimeRewindSystem } from "./TimeRewindSystem";

// Initialize with default configuration
const sys = initTimeRewindSystem();

// Or initialize with custom configuration
const sys = initTimeRewindSystem({
  maxRecordTime: 10000, // Record for 10 seconds
  recordInterval: 20, // Record every 20ms
  speedFactor: 1.5, // 1.5x playback speed
});
```

### 2.2 Adding Entities

typescript

```
// Method 1: Single entity
const entity = world.querySelector("#time");
const node = createTimeRewindNode(entity);
sys.addEntityNode(node);

// Method 2: Batch add
const entities = world.querySelectorAll(".time");
entities.forEach((entity) => {
  const node = createTimeRewindNode(entity);
  sys.addEntityNode(node);
});
```

### 2.3 Controlling Rewind

typescript

```
// Start rewinding
sys.startRewind();

// Stop rewinding
sys.stopRewind();
```

## 3. Configuration Options Explained

### 3.1 System Configuration

typescript

```
interface ISystemConfig {
  maxRecordTime: number; // Maximum recording time (in milliseconds)
  recordInterval: number; // Recording interval (in milliseconds)
  speedFactor: number; // Playback speed multiplier
}
```

### 3.2 State Handlers

typescript

```
const stateHandlers = {
  position: {
    get: () => entity.position,
    set: (value) => entity.position.set(value.x, value.y, value.z),
  },
  meshOrientation: {
    get: () => entity.meshOrientation,
    set: (value) =>
      entity.meshOrientation.set(value.w, value.x, value.y, value.z),
  },
};
```

### 3.3 Callback Functions

typescript

```
const callbacks = {
  onStart: () => {
    // Handling when rewind starts
  },
  onEnd: () => {
    // Handling when rewind ends
  },
};
```

## 4. Event Listening

### 4.1 Progress Listening

typescript

```
sys.onProgress = (progress: number) => {
  console.log(`Rewind progress: ${progress}%`);
};
```

### 4.2 End Listening

typescript

```
sys.onEnd = () => {
  console.log("Rewind finished");
};
```

## 5. Best Practices

### 5.1 Performance Optimization

- Set`recordInterval`reasonably to avoid overly frequent state recording.
- Only add the component to entities that need to be rewound.
- Adjust`maxRecordTime`based on actual needs.

### 5.2 Entity Tagging

It is recommended to use tags to mark entities that need to be rewound.

### 5.3 Error Handling

typescript

```
try {
  const node = createTimeRewindNode(entity);
  sys.addEntityNode(node);
} catch (error) {
  console.error("Failed to add rewind node:", error);
}
```

## 6. Notes

1. Ensure that entities have the correct physics property settings.
2. The physical properties of an entity will be temporarily modified during the rewind process.
3. The system automatically handles remote synchronization events.
4. The entity will be restored to its original physical properties after the rewind is complete.
