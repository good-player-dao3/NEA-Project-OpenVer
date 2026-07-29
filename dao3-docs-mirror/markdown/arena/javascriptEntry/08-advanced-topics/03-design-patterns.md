---
title: "JavaScript 设计模式"
source: "https://docs.dao3.fun/arena/javascriptEntry/08-advanced-topics/03-design-patterns.html"
---

# JavaScript 设计模式

设计模式是在软件设计中，针对常见问题的、经过验证的可重用解决方案。它们不是具体的代码，而是一种解决问题的思想和模板。在游戏开发中，使用正确的设计模式可以使你的代码更灵活、可维护和可扩展。

## 使用指南与分类

- 学习目标：先理解“意图”和“场景”，再看示例，最后自己小改动练习。
- 模式分类：
  - 创建型（创建对象）：单例、工厂、抽象工厂、建造者、原型
  - 结构型（组织结构）：适配器、桥接、组合、装饰器、外观、享元、代理
  - 行为型（对象协作）：责任链、命令、解释器、迭代器、中介者、备忘录、状态、策略、模板方法、观察者、访问者
- 推荐学习路径（由易到难）：
  1. 单例 → 2) 观察者 → 3) 工厂 → 11) 外观 → 21) 策略 → 20) 状态 → 15) 命令 → 14) 责任链 → 7) 适配器 → 10) 装饰器 → 9) 组合 → 8) 桥接 → 12) 享元 → 13) 代理 → 22) 模板方法 → 18) 中介者 → 17) 迭代器 → 19) 备忘录 → 23) 访问者 → 16) 解释器 → 4) 抽象工厂 → 5) 建造者 → 6) 原型

## [创建型] 1. 单例模式 (Singleton)

**意图**：确保一个类只有一个实例，并提供一个全局访问点来获取该实例。

**游戏开发场景**：管理游戏全局状态、设置、或一个核心系统（如资源管理器、输入处理器）时非常有用，因为你只需要一个这样的管理器。

类比：学校里只有一个校长，大家找同一个人说话。

javascript

```
// GameSettings.js — 用闭包里的局部变量 `instance` 保存唯一实例
let instance; // 模块级私有变量，外部不可直接访问

class GameSettings {
  constructor() {
    // 若已存在实例，阻止再次 new，保证唯一性
    if (instance) {
      throw new Error("你不能创建多个 GameSettings 实例！");
    }
    instance = this; // 第一次构造时，把自己记下来

    // 默认设置
    this.volume = 80;
    this.difficulty = "Normal";
  }

  static getInstance() {
    // 提供全局访问点：永远返回同一个实例
    if (!instance) {
      instance = new GameSettings();
    }
    return instance;
  }
}

// 使用示例：无论获取多少次，都是同一个对象
const settings1 = GameSettings.getInstance();
const settings2 = GameSettings.getInstance();

console.log(settings1 === settings2); // true

settings1.volume = 100; // 改变一个的属性
console.log(settings2.volume); // 100，同步反映在另一个上
```

## [行为型] 2. 观察者模式 (Observer)

**意图**：定义对象之间的一对多依赖关系。当一个对象（“主题”或“发布者”）的状态发生改变时，所有依赖于它的对象（“观察者”）都会得到通知并自动更新。

**游戏开发场景**：UI 更新（当玩家生命值变化时，UI 血条自动更新）、成就系统（当玩家完成特定任务时，成就系统得到通知）等。

类比：上课铃一响，所有班级同时开始上课。

javascript

```
// Subject (发布者)：维护一个观察者列表，有变化就通知大家
class HealthSystem {
  constructor() {
    this.observers = []; // 存放所有观察者
    this.health = 100; // 被观察的状态
  }

  addObserver(observer) {
    this.observers.push(observer); // 订阅
  }

  removeObserver(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer); // 退订
  }

  notifyObservers() {
    // 广播：逐个调用观察者的 update 接口
    this.observers.forEach((observer) => observer.update(this.health));
  }

  takeDamage(amount) {
    // 状态变化：扣血并通知
    this.health -= amount;
    console.log(`玩家受到 ${amount} 点伤害。`);
    this.notifyObservers();
  }
}

// Observer (观察者)：实现 update 接口，接收发布者的最新状态
class HealthBarUI {
  update(health) {
    console.log(`[UI] 更新血条显示: ${health}`);
  }
}

class AchievementSystem {
  constructor() {
    this.achievementUnlocked = false;
  }
  update(health) {
    if (health < 20 && !this.achievementUnlocked) {
      console.log("[成就] 解锁成就：命悬一线！");
      this.achievementUnlocked = true;
    }
  }
}

// 使用：把 UI 和 成就系统 都订阅到生命系统上
const healthSystem = new HealthSystem();
const healthBar = new HealthBarUI();
const achievements = new AchievementSystem();

healthSystem.addObserver(healthBar);
healthSystem.addObserver(achievements);

healthSystem.takeDamage(30); // [UI] 更新血条显示: 70
healthSystem.takeDamage(60); // [UI] 更新血条显示: 10, [成就] 解锁成就：命悬一线！
```

## [创建型] 3. 工厂模式 (Factory Method)

**意图**：定义一个用于创建对象的接口，但让子类决定实例化哪一个类。工厂方法使一个类的实例化延迟到其子类。

**游戏开发场景**：创建不同类型的敌人、物品或特效，而无需在主代码中指定具体的类。

类比：点餐只说“来一份汉堡/薯条”，后厨按类型做好给你。

javascript

```
// 敌人与其子类：把差异封装在类里
class Enemy {
  constructor(name, health) {
    this.name = name; // 敌人名称
    this.health = health; // 初始生命
  }
}

class Goblin extends Enemy {
  constructor() {
    super("哥布林", 50); // 具体配置在子类中体现
  }
}

class Orc extends Enemy {
  constructor() {
    super("兽人", 150);
  }
}

// 敌人创建工厂：只关心“类型”，不关心“怎么创建”
class EnemyFactory {
  create(type) {
    switch (type) {
      case "goblin":
        return new Goblin();
      case "orc":
        return new Orc();
      default:
        throw new Error("未知的敌人类型");
    }
  }
}

// 使用：高层代码无需知道具体类名，只传入“类型”
const factory = new EnemyFactory();
const enemies = [];

enemies.push(factory.create("goblin"));
enemies.push(factory.create("orc"));

console.log(enemies); // [Goblin, Orc]
```

## [创建型] 4. 抽象工厂模式 (Abstract Factory)

**意图**：提供一个创建一系列相关或相互依赖对象的接口，而无需指定具体类。

**游戏场景**：不同关卡主题下的“成套”对象（敌人、道具、背景）。

类比：主题礼盒，一打开就是同风格的帽子+气球+贴纸。

javascript

```
// 抽象工厂
class ThemeFactory {
  createEnemy() {}
  createItem() {}
}

class ForestThemeFactory extends ThemeFactory {
  createEnemy() {
    return { type: "ForestWolf" };
  }
  createItem() {
    return { type: "HealingHerb" };
  }
}

class DesertThemeFactory extends ThemeFactory {
  createEnemy() {
    return { type: "SandScorpion" };
  }
  createItem() {
    return { type: "CoolWater" };
  }
}

function setupLevel(factory) {
  const enemy = factory.createEnemy();
  const item = factory.createItem();
  console.log(enemy, item);
}

setupLevel(new ForestThemeFactory());
```

## [创建型] 5. 建造者模式 (Builder)

**意图**：将复杂对象的构建与其表示分离，使同样的构建过程可以创建不同的表示。

**游戏场景**：逐步构建复杂角色或关卡配置。

类比：搭乐高，一块块拼，最后变成城堡。

javascript

```
class CharacterBuilder {
  constructor() {
    this.c = {};
  }
  setName(name) {
    this.c.name = name;
    return this;
  }
  setHP(hp) {
    this.c.hp = hp;
    return this;
  }
  setWeapon(w) {
    this.c.weapon = w;
    return this;
  }
  build() {
    return this.c;
  }
}

const hero = new CharacterBuilder()
  .setName("Hero")
  .setHP(100)
  .setWeapon("Sword")
  .build();
```

## [创建型] 6. 原型模式 (Prototype)

**意图**：通过复制已有对象（原型）来创建新对象。

**游戏场景**：大量相似对象的高效创建（子弹、粒子）。

类比：用复印机复印一张，再在复印件上涂色。

javascript

```
const bulletProto = {
  speed: 10,
  damage: 5,
  clone() {
    return { ...this };
  },
};
const b1 = bulletProto.clone();
```

## [结构型] 7. 适配器模式 (Adapter)

**意图**：将一个类的接口转换成客户期望的另一个接口。

**游戏场景**：适配第三方输入库到你的统一输入接口。

类比：插头转换器，把三孔变成两孔，也能用。

javascript

```
class GamepadAdapter {
  constructor(third) {
    this.third = third;
  }
  getMoveAxis() {
    return { x: this.third.axisX(), y: this.third.axisY() };
  }
}
```

## [结构型] 8. 桥接模式 (Bridge)

**意图**：将抽象部分与实现部分分离，使它们可以独立变化。

**游戏场景**：武器（抽象）与伤害算法（实现）分离。

类比：遥控车和电池分开，换电池不用换遥控车。

javascript

```
class DamageCalc {
  calc(base) {
    return base;
  }
}
class CritDamage extends DamageCalc {
  calc(base) {
    return base * 2;
  }
}
class Weapon {
  constructor(calc) {
    this.calc = calc;
  }
  hit() {
    return this.calc.calc(10);
  }
}
```

## [结构型] 9. 组合模式 (Composite)

**意图**：将对象组合成树形结构以表示“部分-整体”。

**游戏场景**：UI 节点树、场景层级。

类比：文件夹里可以装文件，也能装小文件夹。

javascript

```
class Node {
  constructor(name) {
    this.name = name;
    this.children = [];
  }
  add(n) {
    this.children.push(n);
  }
}
```

## [结构型] 10. 装饰器模式 (Decorator)

**意图**：在不改变原类的情况下，动态地给对象添加职责。

**游戏场景**：给角色临时增加“护盾”“加速”等效果。

类比：冰淇淋上加巧克力/坚果，口味更丰富。

javascript

```
function withShield(character) {
  return {
    ...character,
    damage(d) {
      character.hp -= Math.max(0, d - 5);
    },
  };
}
```

## [结构型] 11. 外观模式 (Facade)

**意图**：为复杂子系统提供一个统一的高层接口。

**游戏场景**：一键初始化资源、声音、网络等。

类比：总服务台，一个窗口帮你联系所有部门。

javascript

```
class GameFacade {
  start() {
    this.loadAssets();
    this.initAudio();
    this.connect();
  }
  loadAssets() {
    /* ... */
  }
  initAudio() {
    /* ... */
  }
  connect() {
    /* ... */
  }
}
```

## [结构型] 12. 享元模式 (Flyweight)

**意图**：共享细粒度对象，节省内存。

**游戏场景**：地图瓦片、子弹外观复用。

类比：共享单车，很多人共用同一批车。

javascript

```
const SpriteCache = new Map();
function getSprite(key) {
  if (!SpriteCache.has(key)) SpriteCache.set(key, { image: new Image() });
  return SpriteCache.get(key);
}
```

## [结构型] 13. 代理模式 (Proxy)

**意图**：为其他对象提供一种代理以控制对这个对象的访问。

**游戏场景**：远程服务（RPC）、延迟加载资源。

类比：请代购帮你买东西，他先去买再给你。

javascript

```
function lazyTexture(path) {
  let tex = null;
  return {
    get() {
      if (!tex) {
        tex = { path };
      }
      return tex;
    },
  };
}
```

## [行为型] 14. 责任链模式 (Chain of Responsibility)

**意图**：将请求沿链传递，直到被处理。

**游戏场景**：输入事件层层传递（UI → 玩家 → 世界）。

类比：传话游戏，一直传到能回答的人为止。

javascript

```
const h1 = (next) => (e) => e.type === "UI" ? console.log("UI") : next(e);
const h2 = (next) => (e) =>
  e.type === "Player" ? console.log("Player") : next(e);
const chain = h1(h2((e) => console.log("World")));
```

## [行为型] 15. 命令模式 (Command)

**意图**：将请求封装为对象，支持撤销/重做、队列等。

**游戏场景**：编辑器操作、宏录制。

类比：把任务写在便条纸上，做了可以撤销重做。

javascript

```
class MoveCmd {
  constructor(player, dx, dy) {
    this.p = player;
    this.dx = dx;
    this.dy = dy;
  }
  exec() {
    this.p.x += this.dx;
    this.p.y += this.dy;
  }
  undo() {
    this.p.x -= this.dx;
    this.p.y -= this.dy;
  }
}
```

## [行为型] 16. 解释器模式 (Interpreter)

**意图**：为语言定义文法，并用解释器解释句子。

**游戏场景**：简单脚本/对话指令解析。

类比：查字典，把“向前走”翻成实际动作。

javascript

```
function interpret(cmd) {
  if (cmd === "JUMP") return "jump";
  if (cmd.startsWith("SAY ")) return cmd.slice(4);
}
```

## [行为型] 17. 迭代器模式 (Iterator)

**意图**：提供一种顺序访问聚合对象元素的方法，而不暴露其内部表示。

**游戏场景**：统一遍历实体集合。

类比：排队一个个过闸门，轮到谁谁先走。

javascript

```
const collection = {
  items: [1, 2, 3],
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => ({ value: this.items[i++], done: i > this.items.length }),
    };
  },
};
```

## [行为型] 18. 中介者模式 (Mediator)

**意图**：用一个中介对象封装一系列对象的交互。

**游戏场景**：UI 控件之间、模块间通信。

类比：班长负责转达同学之间的话，大家不需要互相大喊。

javascript

```
class Mediator {
  publish(e, p) {
    (this[e] || []).forEach((f) => f(p));
  }
  subscribe(e, f) {
    (this[e] = this[e] || []).push(f);
  }
}
```

## [行为型] 19. 备忘录模式 (Memento)

**意图**：在不破坏封装的前提下，捕获对象内部状态，以便之后恢复。

**游戏场景**：存档/撤销。

类比：游戏里的存档点，回去就像时光倒流。

javascript

```
class Caretaker {
  constructor() {
    this.stack = [];
  }
  save(s) {
    this.stack.push(JSON.stringify(s));
  }
  load() {
    return JSON.parse(this.stack.pop());
  }
}
```

## [行为型] 20. 状态模式 (State)

**意图**：对象在内部状态改变时改变其行为。

**游戏场景**：角色“站立/奔跑/攻击”状态切换。

类比：红绿灯变颜色，路人的行动跟着改变。

javascript

```
class Player {
  constructor() {
    this.state = new Idle(this);
  }
  setState(s) {
    this.state = s;
  }
  update() {
    this.state.handle();
  }
}
class Idle {
  constructor(p) {
    this.p = p;
  }
  handle() {
    /* ... */
  }
}
class Run {
  constructor(p) {
    this.p = p;
  }
  handle() {
    /* ... */
  }
}
```

## [行为型] 21. 策略模式 (Strategy)

**意图**：定义一系列算法，把它们一个个封装起来，并且使它们可以相互替换。

**游戏场景**：不同寻路/AI 决策。

类比：走迷宫可以选“左手法”或“看地图”，方法能替换。

javascript

```
const AStar = {
  path(a, b) {
    /* ... */
  },
};
const Dijkstra = {
  path(a, b) {
    /* ... */
  },
};
function Navigator(strategy) {
  this.s = strategy;
  this.find = (a, b) => this.s.path(a, b);
}
```

## [行为型] 22. 模板方法模式 (Template Method)

**意图**：定义算法骨架，将一些步骤延迟到子类。

**游戏场景**：关卡通用流程（加载 → 开始 → 结束），细节由子类决定。

类比：做蛋糕步骤固定（搅拌 → 烤 → 装饰），口味自己选。

javascript

```
class LevelTemplate {
  start() {
    this.load();
    this.play();
    this.end();
  }
  load() {
    /* hook */
  }
  play() {
    /* hook */
  }
  end() {
    /* hook */
  }
}
```

## [行为型] 23. 访问者模式 (Visitor)

**意图**：在不改变数据结构的前提下，定义作用于其元素的新操作。

**游戏场景**：对场景树执行“统计”“导出”等操作。

类比：游园时给每棵树贴标签，统计高度与数量。

javascript

```
class Visitor {
  visitNode(n) {
    /* ... */
  }
}
function traverse(node, v) {
  v.visitNode(node);
  node.children?.forEach((c) => traverse(c, v));
}
```

学习和应用设计模式可以帮助你构建更强大、更易于维护的游戏逻辑。建议：

- 简读“意图”，先理解适用场景。
- 复制示例，改成你的游戏对象名。
- 从最常用的开始：单例、观察者、策略、命令、状态、外观。
