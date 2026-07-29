---
title: "Node Event System"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/event-node.html"
---

# Node Event System

The node event system is an important mechanism for communication between components, providing a loosely coupled way for components to interact.

## Basic Usage

### Listening for and Emitting Events

typescript

```
@apclass("EventDemo")
class EventDemo extends Component<GameEntity> {
  start() {
    // Listen for an event
    this.node.on("scoreChange", this.onScoreChange, this);

    // Emit an event
    this.node.emit("scoreChange", 100);
  }

  private onScoreChange(score: number) {
    console.log(`Score changed: ${score}`);
  }

  onDestroy() {
    // Clean up the event listener
    this.node.off("scoreChange", this.onScoreChange, this);
  }
}
```

### One-Time Event Listeners

typescript

```
@apclass("OneTimeEventDemo")
class OneTimeEventDemo extends Component<GameEntity> {
  start() {
    // Listen for an event only once
    this.node.once("gameStart", () => {
      console.log("Game started!");
    });
  }
}
```

## Global Event System

### Using the Global Event Bus

typescript

```
import { Emitter, Component } from "@dao3fun/component";

@apclass("GlobalEventDemo")
class GlobalEventDemo extends Component<GameEntity> {
  start() {
    // Listen for a global event
    Emitter.on("playerJoin", this.onPlayerJoin, this);

    // Emit a global event
    Emitter.emit("playerJoin", { id: 1, name: "Player 1" });
  }

  private onPlayerJoin(player: any) {
    console.log(`Player joined: ${player.name}`);
  }

  onDestroy() {
    // Clean up the global event listener
    Emitter.off("playerJoin", this.onPlayerJoin, this);
  }
}
```

## Practical Example

### Game State Management System

typescript

```
// Game State Manager
@apclass("GameStateManager")
class GameStateManager extends Component<GameEntity> {
  private score: number = 0;
  private gameState: "idle" | "playing" | "paused" | "over" = "idle";

  start() {
    // Listen for game-related events
    this.node.on("startGame", this.startGame, this);
    this.node.on("pauseGame", this.pauseGame, this);
    this.node.on("resumeGame", this.resumeGame, this);
    this.node.on("gameOver", this.gameOver, this);
    this.node.on("addScore", this.addScore, this);
  }

  private startGame() {
    this.gameState = "playing";
    this.score = 0;
    this.node.emit("gameStateChanged", this.gameState);
  }

  private pauseGame() {
    this.gameState = "paused";
    this.node.emit("gameStateChanged", this.gameState);
  }

  private resumeGame() {
    this.gameState = "playing";
    this.node.emit("gameStateChanged", this.gameState);
  }

  private gameOver() {
    this.gameState = "over";
    this.node.emit("gameStateChanged", this.gameState);
    this.node.emit("finalScore", this.score);
  }

  private addScore(points: number) {
    this.score += points;
    this.node.emit("scoreUpdated", this.score);
  }

  onDestroy() {
    // Clean up all event listeners
    this.node.off("startGame", this.startGame, this);
    this.node.off("pauseGame", this.pauseGame, this);
    this.node.off("resumeGame", this.resumeGame, this);
    this.node.off("gameOver", this.gameOver, this);
    this.node.off("addScore", this.addScore, this);
  }
}

// UI Controller
@apclass("UIController")
class UIController extends Component<GameEntity> {
  start() {
    // Listen for game state changes
    this.node.on("gameStateChanged", this.updateUI, this);
    this.node.on("scoreUpdated", this.updateScore, this);
    this.node.on("finalScore", this.showGameOver, this);
  }

  private updateUI(state: string) {
    console.log(`Updating UI state: ${state}`);
  }

  private updateScore(score: number) {
    console.log(`Updating score display: ${score}`);
  }

  private showGameOver(finalScore: number) {
    console.log(`Game over, final score: ${finalScore}`);
  }

  onDestroy() {
    this.node.off("gameStateChanged", this.updateUI, this);
    this.node.off("scoreUpdated", this.updateScore, this);
    this.node.off("finalScore", this.showGameOver, this);
  }
}
```

## Best Practices

### 1. Event Naming Conventions

typescript

```
// Use verb + noun format
this.node.emit("playerSpawn"); // ✅ Good naming
this.node.emit("spawnPlayer"); // ✅ Good naming
this.node.emit("player"); // ❌ Bad naming

// Use camelCase
this.node.emit("scoreUpdate"); // ✅ Good naming
this.node.emit("score_update"); // ❌ Bad naming
```

### 2. Passing Event Parameters

typescript

```
@apclass("EventParamsDemo")
class EventParamsDemo extends Component<GameEntity> {
  start() {
    // Pass a single parameter
    this.node.emit("scoreChange", 100);

    // Pass multiple parameters
    this.node.emit("playerUpdate", {
      health: 100,
      position: { x: 0, y: 0, z: 0 },
      status: "active",
    });
  }
}
```

### 3. Event Cleanup

typescript

```
@apclass("EventCleanupDemo")
class EventCleanupDemo extends Component<GameEntity> {
  private handlers: Map<string, Function> = new Map();

  start() {
    // Save a reference to the event handler
    const handler = (data: any) => {
      console.log(data);
    };

    this.node.on("myEvent", handler, this);
    this.handlers.set("myEvent", handler);
  }

  onDestroy() {
    // Clean up all event listeners
    this.handlers.forEach((handler, event) => {
      this.node.off(event, handler, this);
    });
    this.handlers.clear();
  }
}
```

## Notes

1. **Preventing Memory Leaks**
  - Always clean up event listeners when a component is destroyed.
  - Use a Map or array to keep track of added event listeners.
  - Avoid adding the same event listener multiple times.
2. **Performance Optimization**
  - Avoid emitting events too frequently.
  - Use event parameters reasonably; avoid passing large amounts of data.
  - Consider using event throttling or debouncing.
3. **Event Propagation**
  - Clearly define the scope of events.
  - Choose between node events and global events appropriately.
  - Avoid event loops.

## Frequently Asked Questions

### Q: How to avoid adding the same event listener multiple times?

A: You can remove the old listener before adding a new one:

typescript

```
this.node.off("myEvent", this.handler, this);
this.node.on("myEvent", this.handler, this);
```
