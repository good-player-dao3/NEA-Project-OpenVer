---
title: "双端开发(二)：共享数据结构 (Type-Safe Events)"
source: "https://docs.dao3.fun/arenapro/zh/guide/05-best-practices/communicationAgreement.html"
---

# 双端开发(二)：共享数据结构 (Type-Safe Events)

在双端开发中，除了共享函数，更常见的场景是**客户端与服务端之间的通信**。

**思考这个场景**：

- **服务端**检测到玩家击败了一只怪物。它需要通知客户端，以便播放胜利音效和显示获得的战利品。
- **客户端**需要接收这个通知，并安全地解析出其中的数据，如怪物 ID、经验值、掉落物品等。

如果仅靠口头约定，你很可能会在某次通信中犯下拼写错误：服务端发送了`{ exp: 100 }`，而客户端却在尝试读取`{ xp: 100 }`。这种错误很难排查。

为了解决这个问题，我们可以使用上一篇指南中提到的`shares/`文件夹来定义一个共享的**数据结构“契约”**。

## `interface`: 定义你的通信“契约”

TypeScript 的`interface`(接口) 是定义对象“形状”的完美工具。通过在`shares/`文件夹中定义一个`interface`，客户端和服务端就可以就通信数据的结构达成一个具有强制约束力的“契约”。

任何一方如果不遵守这个契约（比如字段名写错、类型不对），TypeScript 编译器就会立刻报错，从而在开发阶段就帮你消除了大量的潜在 Bug。

## 实战演练：发送一个“怪物被击败”的事件

让我们来定义一个带有类型安全负载 (Payload) 的双端事件。

### 第 1 步：在`shares/`中定义数据接口

1. 在`shares/`目录下创建一个新文件，例如`events.ts`。
2. 在`events.ts`中，使用`interface`来定义“怪物被击败”事件需要携带的数据结构。同时，我们定义一个独一无二的事件名称常量。

ts

```
// shares/events.ts

// 定义掉落物品的结构
export interface LootItem {
  itemId: number;
  quantity: number;
}

// 定义“怪物被击败”事件的负载结构
export interface MonsterDefeatedPayload {
  monsterId: string;
  xpGained: number;
  loot: LootItem[];
}

// 定义一个全局唯一的事件名
export const MONSTER_DEFEATED_EVENT = "MonsterDefeated";
```

### 第 2 步：服务端发送类型安全的事件

现在，服务端在怪物被击败时，可以构建一个严格遵守此“契约”的数据对象，并将其广播给客户端。

ts

```
// server/src/App.ts
import {
  MONSTER_DEFEATED_EVENT,
  MonsterDefeatedPayload
} from '../../shares/events';

// ...
  onMonsterDefeated(monster, player) {
    // 构建负载对象。如果这里的字段名或类型写错，TS会立刻报错！
    const payload: MonsterDefeatedPayload = {
      monsterId: monster.id,
      xpGained: 50,
      loot: [
        { itemId: 101, quantity: 1 },
        { itemId: 204, quantity: 3 }
      ]
    };

    // 向该玩家的客户端广播这个事件和负载
    this.box.broadcastToClient(player, MONSTER_DEFEATED_EVENT, payload);
  }
// ...
```

### 第 3 步：客户端监听并安全地使用数据

客户端可以监听这个事件。由于它也引用了同一个`interface`，当它收到数据时，能完全确信数据的结构和类型。

ts

```
// client/src/App.ts
import {
  MONSTER_DEFEATED_EVENT,
  MonsterDefeatedPayload
} from '../../shares/events';

// ...
  onLoad() {
    // 监听来自服务端的事件
    this.box.listenToServer<MonsterDefeatedPayload>(MONSTER_DEFEATED_EVENT, (payload) => {
      // 在这里，`payload` 对象拥有完全的类型提示和安全保障
      console.log(`你击败了怪物 ${payload.monsterId}！`);
      console.log(`获得了 ${payload.xpGained} 点经验！`);

      // VS Code 甚至可以自动补全 `payload.` 后面的字段名
      for (const item of payload.loot) {
        console.log(`获得了物品 ${item.itemId}，数量 ${item.quantity}`);
      }

      // 在这里调用函数，播放胜利音效、显示UI等
      // playVictorySound();
      // showLootToast(payload.loot);
    });
  }
// ...
```

## 共享数据结构的好处

- **类型安全**：从根本上杜绝了因拼写错误、类型不匹配导致的双端通信问题。
- **代码智能提示 (IntelliSense)**：在编写代码时，VS Code 会自动提示你负载对象中有哪些字段，极大地提升了开发效率。
- **重构的信心**：如果将来你需要给事件增加一个字段，只需要修改`shares/events.ts`中的`interface`，TypeScript 就会自动找出所有需要同步修改的服务端和客户端代码。
- **代码即文档**：共享的`interface`文件本身就是一份清晰、准确、永远不会过时的通信协议文档。

现在，你的客户端和服务端通信已经完全实现了类型安全。这将在大型项目中为你省去无数的调试时间，并极大地提升代码的健壮性。

---
