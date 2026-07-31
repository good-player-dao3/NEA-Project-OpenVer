---
title: "Class 新特性：类字段与私有字段"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-21-class-fields-private.html"
---

# Class 新特性：类字段与私有字段

现代 class 支持公有/私有字段与静态块（取决于环境/编译）。

javascript

```
class Player {
  #hp = 100; // 私有字段
  name = "anon"; // 公有实例字段
  static version = "1.0";
  static {
    console.log("Class loaded");
  }

  damage(n) {
    this.#hp = Math.max(0, this.#hp - n);
  }
  get hp() {
    return this.#hp;
  }
}

const p = new Player();
p.damage(50);
console.log(p.hp); // 50
```

注意目标环境与编译配置（Babel/TypeScript）。

## 公有字段 vs 私有字段（#）

- 公有字段：直接定义在 class 内部的属性，实例可直接访问/修改。
- 私有字段：以`#name`声明，仅在类定义的内部可访问，外部访问会抛错。

javascript

```
class Enemy {
  #state = "idle";
  type = "slime";
  setState(s) {
    this.#state = s;
  }
  getState() {
    return this.#state;
  }
}

const e = new Enemy();
console.log(e.type); // 'slime'
console.log(e.getState()); // 'idle'
// e.#state; // SyntaxError：外部不可访问
```

## 访问器（getter/setter）与校验

javascript

```
class Chest {
  #gold = 0;
  get gold() {
    return this.#gold;
  }
  set gold(n) {
    if (!Number.isInteger(n) || n < 0) throw new TypeError("gold>=0");
    this.#gold = n;
  }
}
```

## 静态字段、静态方法与静态块

javascript

```
class Config {
  static url = "/api";
  static headers = { "X-App": "Arena" };
  static get endpoint() {
    return this.url + "/v1";
  }
  static {
    console.log("Config class init");
  }
}

console.log(Config.endpoint);
```

用途：一次性初始化、常量、工具方法。

## 初始化顺序与`this`

类实例化时的执行顺序：

1. 父类字段初始化；
2. 父类构造函数；
3. 子类字段初始化；
4. 子类构造函数。

注意在子类构造函数中必须先`super()`后才能访问`this`。

## 方法中的`this`绑定选项

1. 传统方法：在构造函数中手动绑定

javascript

```
class Button {
  constructor() {
    this.onClick = this.onClick.bind(this);
  }
  onClick(evt) {
    /* 使用 this 安全 */
  }
}
```

1. 类字段中使用箭头函数（词法 this）

javascript

```
class Button {
  onClick = (evt) => {
    /* this 为实例 */
  };
}
```

权衡：箭头函数更简洁但每个实例持有一份函数；bind 也会为每个实例生成绑定函数，差别在可测试性与调试喜好。

## 与装饰器（Decorators）

JavaScript 装饰器已标准化（取决于目标环境与编译器支持）。可用于包装方法、字段元数据等。生态（Babel/TS）支持度较好，但用法需参考当前工具链版本。

## 常见陷阱

- 私有字段名字不能动态访问，也不能通过字符串索引：`obj['#x']`无效；
- 私有字段在继承层级中是各自独立的，子类无法访问父类私有字段；
- 注意与旧版提案语法差异（一些资料可能过时）；
- 大量使用类字段箭头函数可能影响内存占用（每实例一份），需权衡。

## 最佳实践

- 利用私有字段实现真正封装（替代过去的闭包或 WeakMap 私有化手段）；
- 用访问器进行校验与封装不变量；
- 静态字段用于常量/配置，静态方法用于与实例无关的逻辑；
- 团队约定`this`绑定方式（bind vs 箭头函数），保持一致性。

## 练习

1. 设计一个`BankAccount`类，使用`#balance`私有字段、`deposit/withdraw`方法包含校验与日志。
2. 为某 UI 组件类添加点击处理：分别用构造器`bind`和类字段箭头函数实现，比较差异。
3. 在一个`Config`类中用静态字段/访问器组织全局设置，并编写只读暴露接口。
