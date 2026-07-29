---
title: "Node Time"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/time.html"
---

# Node Time

`NodeTime`is a game time management system primarily responsible for:

- Maintaining the game's time update loop
- Controlling the update order of components and systems
- Managing time scaling and time warping effects

## Getting Started

### 1. Basic Operations

typescript

```
// Check if the time system is running
const isRunning = NodeTime.isRunning();

// Start the time system
NodeTime.start();

// Stop the time system
NodeTime.stop();
```

### 2. Time Scaling

Time scaling can control the flow rate of game time:

typescript

```
// Normal speed
NodeTime.setTimeScale(1);

// Slow-motion effect
NodeTime.setTimeScale(0.5);

// Fast-forward effect
NodeTime.setTimeScale(2);

// Get the current time scale
const currentScale = NodeTime.getTimeScale();
```

## Delayed Task System

### 1. Creating a Delayed Task

typescript

```
// Create a task that executes after 3 seconds
const taskId = NodeTime.setTimeout(() => {
  console.log("Executed after 3 seconds");
}, 3000);

// Cancel the task
NodeTime.clearTimeout(taskId);
```

## Advanced Features

### 2. Time Warp Effect

typescript

```
// Parameter 1: Time warp intensity
// Parameter 2: Duration (in milliseconds)
NodeTime.applyTimeWarp(2, 1000); // Double the time flow rate for 1 second
```

## Practical Examples

### 1. Creating a Simple Countdown System

typescript

```
class CountdownSystem {
  private remainingTime: number;

  constructor(duration: number) {
    this.remainingTime = duration;
  }

  update(deltaTime: number) {
    this.remainingTime -= deltaTime;

    if (this.remainingTime <= 0) {
      console.log("Countdown finished!");
      return true;
    }

    console.log(
      `Time remaining: ${Math.ceil(this.remainingTime / 1000)} seconds`
    );
    return false;
  }
}

// Usage example
const countdown = new CountdownSystem(5000); // 5-second countdown
```

### 2. Creating a Slow-Motion Effect

typescript

```
function createSlowMotionEffect(duration: number) {
  // Enter slow motion
  NodeTime.setTimeScale(0.2);

  // Set a timer to restore normal speed
  NodeTime.setTimeout(() => {
    NodeTime.setTimeScale(1);
  }, duration);
}

// Usage example
createSlowMotionEffect(2000); // 2-second slow-motion effect
```

## Notes

1. Refreshing affects the update frequency of all global nodes, so use it with caution.
2. The maximum time interval for a single update is limited to 1000ms (1 second).
3. When using the time warp effect, it is recommended to use a moderate intensity value (1.0 - 3.0).

## 7. Advanced Applications

### 1. Combining Time Effects

typescript

```
function createTimeEffect() {
  // First, use a time warp
  NodeTime.applyTimeWarp(2, 1000);

  // Then, set a delayed task to create a continuous effect
  NodeTime.setTimeout(() => {
    NodeTime.setTimeScale(0.5);

    NodeTime.setTimeout(() => {
      NodeTime.setTimeScale(1);
    }, 2000);
  }, 1000);
}
```
