---
title: "专业地管理游戏数据：从 JSON 开始"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/json.html"
---

# 专业地管理游戏数据：从 JSON 开始

想象一下，你正在制作一个大型 RPG 游戏，里面有成百上千种装备、道具和怪物。

起初，你可能会图方便，把这些数据直接写在代码里：

typescript

```
function getItemData(itemId: string) {
  if (itemId === "item_001") {
    return { name: "治疗药水", effect: "恢复50点生命" };
  }
  if (itemId === "item_002") {
    return { name: "力量卷轴", effect: "临时增加10点攻击" };
  }
  // ... 此处省略几百个 if/else ...
}
```

这种“硬编码”的方式，在项目初期似乎没什么问题。但随着项目规模的扩大，这会变成一场灾难：

- **难以修改**：每次你想调整一个道具的效果，都得在成千上万行代码里找到那一小行。
- **容易出错**：当道具数量多起来时，复制粘贴很容易出错，比如把`effect`错写成`effcet`。
- **无法协作**：你无法让不懂编程的游戏策划帮你配置和调整数值。

要解决这个问题，我们需要引入一种专业的开发思想：**数据与逻辑分离**。让代码只负责“如何使用道具”，而道具的具体信息，则存放在一个专门的“数据仓库”里。

这个“数据仓库”，最常用的格式就是**JSON**。

## 阶段一：用 JSON 建立你的“数据仓库”

JSON 是一种轻量级的、专门用来存储数据的文本格式。它非常易于阅读和编写。我们的目标是：把所有道具的数据，都从代码里挪到一个`items.json`文件中。

1. 在你的`src`目录（或者你认为合适的任何地方），创建一个新的`gamedata`文件夹。
2. 在`gamedata`文件夹里，新建一个`items.json`文件。

现在，我们把道具数据写进去：

json

```
// src/gamedata/items.json
[
  {
    "id": "item_001",
    "name": "治疗药水",
    "description": "一瓶能治愈伤口的红色药水。",
    "effect": "heal",
    "value": 50
  },
  {
    "id": "item_002",
    "name": "力量卷轴",
    "description": "使用后能感受到无穷的力量。",
    "effect": "buff_attack",
    "value": 10
  },
  {
    "id": "item_003",
    "name": "新手村地图",
    "description": "妈妈再也不用担心我迷路了。",
    "effect": "none",
    "value": 0
  }
]
```

看，是不是非常清晰？你可以轻松地在这里添加、修改或删除道具，而无需触碰任何一行游戏逻辑代码。

## 阶段二：用 Interface 为“数据仓库”上一把“安全锁”

现在我们有了数据，但还有一个至关重要的问题：**如何在代码里安全地使用它呢？**

- 如果我不小心把`value`理解成了“价格”，但它实际上是“治疗量”，怎么办？
- 如果策划在配置时不小心把`effect`写成了`effects`，程序怎么发现？

这就是**TypeScript Interface**发挥作用的地方。我们可以为我们的道具数据创建一个“**数据契约**”，来为这个“仓库”装上一把“安全锁”。这份契约会严格规定：嘿，所有存入仓库的道具，都必须包含`id`,`name`,`description`,`effect`,`value`这几个属性，而且它们的类型也必须是规定好的！

在`src`目录下创建一个`types.ts`文件（如果还没有的话），然后写入以下内容：

typescript

```
// src/types.ts

/**
 * 代表游戏中的一个道具的数据结构。
 * 每一条 JSDoc 注释都会在后续的开发中给你带来极大的便利。
 */
export interface ItemData {
  /** 道具的唯一标识符，不允许重复。 */
  readonly id: string;

  /** 道具在游戏中显示的名字。 */
  readonly name: string;

  /** 道具的描述文本。 */
  readonly description: string;

  /**
   * 道具的效果类型。
   * 'heal': 治疗
   * 'buff_attack': 攻击力增益
   * 'none': 无特殊效果
   */
  readonly effect: "heal" | "buff_attack" | "none";

  /**
   * 与效果相关联的数值。
   * - 当 effect 为 'heal' 时，这是治疗量。
   * - 当 effect 为 'buff_attack' 时，这是增加的攻击力。
   */
  readonly value: number;
}
```

这份`interface`就是我们给“数据仓库”上的那把“安全锁”，它不仅定义了每个字段的**类型**，还通过注释和**字面量联合类型**(`'heal' | 'buff_attack'`)，清晰地定义了每个字段的**含义**。

## 阶段三：在代码中，安全地打开“上了锁的仓库”

ArenaPro 的开发环境允许你**直接导入 JSON 文件**，就像导入一个普通的 TypeScript 模块一样。现在，我们可以把所有东西都串起来了。

typescript

```
// server/src/itemManager.ts

// 1. 同时导入 JSON 数据和它的“数据契约”
import allItems from "../gamedata/items.json";
import type { ItemData } from "../types";

// 2. 创建一个道具数据库，方便通过 ID 快速查找
//    我们用 Map 来存储，键是道具 ID，值是道具数据。
const itemDatabase = new Map<string, ItemData>();

// 3. 遍历导入的 JSON 数组，填充数据库
//    我们在这里使用 `as ItemData[]` 进行类型断言，
//    意思是告诉 TypeScript：“请相信我，这个 allItems 数组里的每个成员，都符合 ItemData 这个契约”。
//    如果 JSON 文件中的某个字段写错了（比如把 name 写成了 Name），TypeScript 在这里可能不会报错，
//    但在后续使用时，错误依然会被捕捉到。
for (const item of allItems as ItemData[]) {
  itemDatabase.set(item.id, item);
}

// 4. 创建一个函数来获取道具数据
export function getItem(itemId: string): ItemData | undefined {
  return itemDatabase.get(itemId);
}

// 5. 在其他地方调用它，并享受“安全锁”带来的好处
const potion = getItem("item_001");

// 当你输入 `potion.` 时，VS Code 会自动提示 name, description, effect, value 等属性！
if (potion) {
  console.log(`你使用了：${potion.name}`);

  // 你可以放心地使用 value，因为你知道在 effect 为 'heal' 时它代表治疗量
  if (potion.effect === "heal") {
    player.hp += potion.value;
  }

  // 如果你把 value 写成 potion.Value（大小写错误），
  // 或者把 effect 的判断写成 if (potion.effect === 'heall')（拼写错误），
  // TypeScript 会立刻划出红线警告你，在运行游戏前就帮你避免了一个 Bug！
}
```

## 总结

通过将游戏数据剥离到 JSON 文件中，并结合 TypeScript 的`interface`，你获得了一套专业、强大且易于维护的工作流：

- **数据与逻辑分离**：游戏数值的调整变得极其简单，甚至可以交给不懂编程的策划来完成。
- **代码更整洁**：告别了代码中成堆的、无法维护的`if/else`。
- **极致的类型安全**：在`interface`的“安全锁”保护下，你可以在代码中放心地使用这些数据，享受 IDE 带来的自动补全和实时错误检查，大幅减少因数据不一致或拼写错误导致的 Bug。

现在，就去把你的游戏数据从代码中解放出来吧！
