---
title: "游戏世界事件系统"
source: "https://docs.dao3.fun/arenapro/zh/package/component/componentGuide/event-world.html"
---

# 游戏世界事件系统

GameWorldEvent 是神岛引擎提供的服务端游戏世界事件系统，用于处理游戏世界中的各种事件，如玩家加入、离开、碰撞等。

## 基础用法

### 玩家事件监听

typescript

```
@apclass("PlayerManager")
class PlayerManager extends Component<GameEntity> {
  start() {
    // 监听玩家加入事件
    GameWorldEvent.on(world.onPlayerJoin, this.handlePlayerJoin, this);

    // 监听玩家离开事件
    GameWorldEvent.on(world.onPlayerLeave, this.handlePlayerLeave, this);
  }

  private handlePlayerJoin({ entity }: GamePlayerEntityEvent) {
    console.log(`玩家 ${entity.player.name} 加入游戏`);
    this.node.emit("playerJoined", entity);
  }

  private handlePlayerLeave({ entity }: GamePlayerEntityEvent) {
    console.log(`玩家 ${entity.player.name} 离开游戏`);
    this.node.emit("playerLeft", entity);
  }

  onDestroy() {
    // 清理事件监听
    GameWorldEvent.off(world.onPlayerJoin, this.handlePlayerJoin, this);
    GameWorldEvent.off(world.onPlayerLeave, this.handlePlayerLeave, this);
  }
}
```

## 高级用法

### 玩家输入系统

typescript

```
@apclass("InputSystem")
class InputSystem extends Component<GameEntity> {
  start() {
    // 监听按键按下事件
    GameWorldEvent.on(world.onPress, this.handleKeyPress, this);

    // 监听按键释放事件
    GameWorldEvent.on(world.onRelease, this.handleKeyRelease, this);

    // 监听鼠标点击事件
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
    // 处理按键释放逻辑
  }

  private handleClick({ button, position }: GameClickEvent) {
    console.log(`点击位置: ${position.x}, ${position.y}, ${position.z}`);
  }

  private moveForward(entity: GameEntity) {
    // 移动逻辑
  }

  private jump(entity: GameEntity) {
    // 跳跃逻辑
  }

  onDestroy() {
    GameWorldEvent.off(world.onPress, this.handleKeyPress, this);
    GameWorldEvent.off(world.onRelease, this.handleKeyRelease, this);
    GameWorldEvent.off(world.onClick, this.handleClick, this);
  }
}
```

### 聊天系统

typescript

```
@apclass("ChatSystem")
class ChatSystem extends Component<GameEntity> {
  start() {
    // 监听聊天消息
    GameWorldEvent.on(world.onChat, this.handleChat, this);
  }

  private handleChat({ entity, message }: GameChatEvent) {
    // 处理普通聊天消息
    if (!message.startsWith("/")) {
      console.log(`${entity.player.name}: ${message}`);
      return;
    }

    // 处理命令
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
    entity.player.directMessage("可用命令：/help, /tp");
  }

  private teleport(entity: GameEntity, args: string[]) {
    // 传送逻辑
  }

  onDestroy() {
    GameWorldEvent.off(world.onChat, this.handleChat, this);
  }
}
```

## 实战示例：游戏管理系统

typescript

```
@apclass("GameManager")
class GameManager extends Component<GameEntity> {
  private players: Map<string, GameEntity> = new Map();
  private gameState: "waiting" | "playing" | "ended" = "waiting";

  start() {
    // 监听玩家相关事件
    GameWorldEvent.on(world.onPlayerJoin, this.handlePlayerJoin, this);
    GameWorldEvent.on(world.onPlayerLeave, this.handlePlayerLeave, this);
    GameWorldEvent.on(world.onChat, this.handleChat, this);

    // 监听游戏循环事件
    GameWorldEvent.on(world.onTick, this.gameLoop, this);
  }

  private handlePlayerJoin({ entity }: GamePlayerEntityEvent) {
    this.players.set(entity.player.userId, entity);

    // 检查是否可以开始游戏
    if (this.players.size >= 2 && this.gameState === "waiting") {
      this.startGame();
    }
  }

  private handlePlayerLeave({ entity }: GamePlayerEntityEvent) {
    this.players.delete(entity.player.userId);

    // 检查是否需要结束游戏
    if (this.players.size < 2 && this.gameState === "playing") {
      this.endGame();
    }
  }

  private handleChat({ entity, message }: GameChatEvent) {
    if (message === "!ready" && this.gameState === "waiting") {
      entity.player.directMessage("你已准备就绪！");
    }
  }

  private gameLoop() {
    if (this.gameState !== "playing") return;

    // 更新游戏状态
    this.updateGameState();
  }

  private startGame() {
    this.gameState = "playing";
    this.broadcastMessage("游戏开始！");
  }

  private endGame() {
    this.gameState = "ended";
    this.broadcastMessage("游戏结束！");
  }

  private broadcastMessage(message: string) {
    this.players.forEach((player) => {
      player.player.directMessage(message);
    });
  }

  private updateGameState() {
    // 游戏逻辑更新
  }

  onDestroy() {
    // 清理所有事件监听
    GameWorldEvent.off(world.onPlayerJoin, this.handlePlayerJoin, this);
    GameWorldEvent.off(world.onPlayerLeave, this.handlePlayerLeave, this);
    GameWorldEvent.off(world.onChat, this.handleChat, this);
    GameWorldEvent.off(world.onTick, this.gameLoop, this);
  }
}
```

## 注意事项

1. **事件清理**
  - 必须在组件销毁时清理所有事件监听
  - 使用同一个回调函数引用进行注册和清理
2. **性能优化**
  - 避免在事件回调中执行耗时操作
  - 合理使用事件节流和防抖
  - 及时清理不需要的事件监听
3. **事件处理顺序**
  - 注意事件的触发顺序
  - 避免在事件处理中修改会触发其他事件的状态

## 常见问题

### Q: 为什么事件没有触发？

A: 检查以下几点：

1. 事件监听是否正确注册
2. 事件名称是否正确
3. 回调函数的 this 绑定是否正确

### Q: 如何避免事件监听器内存泄漏？

A:

1. 在 onDestroy 中清理所有事件
2. 保持对事件回调函数的引用
3. 使用 bind 或箭头函数确保回调函数引用一致

### Q: 事件系统和组件通信如何选择？

A:

- 使用事件系统：处理游戏世界级别的事件
- 使用组件通信：处理组件间的局部通信
