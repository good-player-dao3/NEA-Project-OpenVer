---
title: "Game World Event System"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/event-world.html"
---

# Game World Event System

`GameWorldEvent`is the server-side game world event system provided by the Box3 Engine. It is used to handle various events in the game world, such as players joining, leaving, collisions, etc.

## Basic Usage

### Player Event Listening

typescript

```
@apclass("PlayerManager")
class PlayerManager extends Component<GameEntity> {
  start() {
    // Listen for player join events
    GameWorldEvent.on(world.onPlayerJoin, this.handlePlayerJoin, this);

    // Listen for player leave events
    GameWorldEvent.on(world.onPlayerLeave, this.handlePlayerLeave, this);
  }

  private handlePlayerJoin({ entity }: GamePlayerEntityEvent) {
    console.log(`Player ${entity.player.name} joined the game`);
    this.node.emit("playerJoined", entity);
  }

  private handlePlayerLeave({ entity }: GamePlayerEntityEvent) {
    console.log(`Player ${entity.player.name} left the game`);
    this.node.emit("playerLeft", entity);
  }

  onDestroy() {
    // Clean up event listeners
    GameWorldEvent.off(world.onPlayerJoin, this.handlePlayerJoin, this);
    GameWorldEvent.off(world.onPlayerLeave, this.handlePlayerLeave, this);
  }
}
```

## Advanced Usage

### Player Input System

typescript

```
@apclass("InputSystem")
class InputSystem extends Component<GameEntity> {
  start() {
    // Listen for key press events
    GameWorldEvent.on(world.onPress, this.handleKeyPress, this);

    // Listen for key release events
    GameWorldEvent.on(world.onRelease, this.handleKeyRelease, this);

    // Listen for mouse click events
    GameWorldEvent.on(world.onClick, this.handleClick, this);
  }

  private handleKeyPress({ button, entity }: GameInputEvent) {
    switch (button) {
      case GameButtonType.WALK:
        this.moveForward(entity);
        break;
      case GameButtonType.JUMP:
        this.jump(entity);
        break;
    }
  }

  private handleKeyRelease({ button, entity }: GameInputEvent) {
    // Handle key release logic
  }

  private handleClick({ button, position }: GameClickEvent) {
    console.log(`Click position: ${position.x}, ${position.y}, ${position.z}`);
  }

  private moveForward(entity: GameEntity) {
    // Movement logic
  }

  private jump(entity: GameEntity) {
    // Jump logic
  }

  onDestroy() {
    GameWorldEvent.off(world.onPress, this.handleKeyPress, this);
    GameWorldEvent.off(world.onRelease, this.handleKeyRelease, this);
    GameWorldEvent.off(world.onClick, this.handleClick, this);
  }
}
```

### Chat System

typescript

```
@apclass("ChatSystem")
class ChatSystem extends Component<GameEntity> {
  start() {
    // Listen for chat messages
    GameWorldEvent.on(world.onChat, this.handleChat, this);
  }

  private handleChat({ entity, message }: GameChatEvent) {
    // Handle normal chat messages
    if (!message.startsWith("/")) {
      console.log(`${entity.player.name}: ${message}`);
      return;
    }

    // Handle commands
    this.handleCommand(entity, message.slice(1));
  }

  private handleCommand(entity: GameEntity, command: string) {
    const [cmd, ...args] = command.split(" ");
    switch (cmd) {
      case "help":
        this.showHelp(entity);
        break;
      case "tp":
        this.teleport(entity, args);
        break;
    }
  }

  private showHelp(entity: GameEntity) {
    entity.player.directMessage("Available commands: /help, /tp");
  }

  private teleport(entity: GameEntity, args: string[]) {
    // Teleportation logic
  }

  onDestroy() {
    GameWorldEvent.off(world.onChat, this.handleChat, this);
  }
}
```

## Practical Example: Game Management System

typescript

```
@apclass("GameManager")
class GameManager extends Component<GameEntity> {
  private players: Map<string, GameEntity> = new Map();
  private gameState: "waiting" | "playing" | "ended" = "waiting";

  start() {
    // Listen for player-related events
    GameWorldEvent.on(world.onPlayerJoin, this.handlePlayerJoin, this);
    GameWorldEvent.on(world.onPlayerLeave, this.handlePlayerLeave, this);
    GameWorldEvent.on(world.onChat, this.handleChat, this);

    // Listen for game loop events
    GameWorldEvent.on(world.onTick, this.gameLoop, this);
  }

  private handlePlayerJoin({ entity }: GamePlayerEntityEvent) {
    this.players.set(entity.player.userId, entity);

    // Check if the game can start
    if (this.players.size >= 2 && this.gameState === "waiting") {
      this.startGame();
    }
  }

  private handlePlayerLeave({ entity }: GamePlayerEntityEvent) {
    this.players.delete(entity.player.userId);

    // Check if the game needs to end
    if (this.players.size < 2 && this.gameState === "playing") {
      this.endGame();
    }
  }

  private handleChat({ entity, message }: GameChatEvent) {
    if (message === "!ready" && this.gameState === "waiting") {
      entity.player.directMessage("You are ready!");
    }
  }

  private gameLoop() {
    if (this.gameState !== "playing") return;

    // Update game state
    this.updateGameState();
  }

  private startGame() {
    this.gameState = "playing";
    this.broadcastMessage("The game has started!");
  }

  private endGame() {
    this.gameState = "ended";
    this.broadcastMessage("The game has ended!");
  }

  private broadcastMessage(message: string) {
    this.players.forEach((player) => {
      player.player.directMessage(message);
    });
  }

  private updateGameState() {
    // Game logic update
  }

  onDestroy() {
    // Clean up all event listeners
    GameWorldEvent.off(world.onPlayerJoin, this.handlePlayerJoin, this);
    GameWorldEvent.off(world.onPlayerLeave, this.handlePlayerLeave, this);
    GameWorldEvent.off(world.onChat, this.handleChat, this);
    GameWorldEvent.off(world.onTick, this.gameLoop, this);
  }
}
```

## Notes

1. **Event Cleanup**
  - All event listeners must be cleaned up when the component is destroyed.
  - Use the same callback function reference for registration and cleanup.
2. **Performance Optimization**
  - Avoid executing time-consuming operations in event callbacks.
  - Use event throttling and debouncing appropriately.
  - Clean up unnecessary event listeners in a timely manner.
3. **Event Handling Order**
  - Pay attention to the order in which events are triggered.
  - Avoid modifying state that triggers other events within an event handler.

## Frequently Asked Questions

### Q: Why isn't my event firing?

A: Check the following:

1. Is the event listener registered correctly?
2. Is the event name correct?
3. Is the`this`binding for the callback function correct?

### Q: How to avoid memory leaks from event listeners?

A:

1. Clean up all events in`onDestroy`.
2. Keep a reference to the event callback function.
3. Use`bind`or an arrow function to ensure a consistent callback function reference.
