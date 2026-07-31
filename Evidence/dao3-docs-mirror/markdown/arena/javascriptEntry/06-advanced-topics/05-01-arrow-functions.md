---
title: "箭头函数（Arrow Functions）与 this"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-01-arrow-functions.html"
---

# 箭头函数（Arrow Functions）与`this`

箭头函数提供更简洁的函数写法，并且不会创建自己的`this`，`this`来自外层词法作用域。

## 基本语法

javascript

```
const add = (a, b) => a + b;
const square = (x) => x * x;
const noop = () => {};
```

## `this`绑定（词法作用域）

javascript

```
const party = {
  members: ["Elara", "Kael"],
  greet() {
    // 箭头函数继承外层 this（指向 party）
    return this.members.map((name) => `Hello, ${name}!`);
  },
};

console.log(party.greet()); // ["Hello, Elara!", "Hello, Kael!"]
```

要点：

- 箭头函数没有自己的`this`、`arguments`、`super`、`new.target`。
- 不能作为构造函数（不可用`new`）。
- 不适合需要`this`动态绑定的场景。

## 常见场景

- 回调与数组方法（`map`、`filter`、`reduce`）
- 需要捕获外层`this`的场景（例如类方法中传递回调）

## 语法变体与返回值细节

- 单表达式体会隐式返回：`x => x * 2`
- 多语句体需要花括号并显式`return`：

javascript

```
const sum = (a, b) => {
  const r = a + b;
  return r; // 必须写 return
};
```

- 返回对象字面量时请用圆括号包裹，否则会被当作函数体花括号：

javascript

```
const makePoint = (x, y) => ({ x, y });
```

## `this`深入：箭头函数 vs 普通函数

javascript

```
const obj = {
  id: 1,
  normal() {
    setTimeout(function () {
      // 普通函数 this 指向全局或 undefined（严格模式）
      console.log("normal this.id =", this && this.id); // undefined
    }, 0);
  },
  arrow() {
    setTimeout(() => {
      // 箭头函数捕获外层 this（obj）
      console.log("arrow this.id =", this.id); // 1
    }, 0);
  },
};

obj.normal();
obj.arrow();
```

实践建议：

- 需要访问外层`this`（如类方法中的回调）→ 用箭头函数。
- 需要可复用、可使用`call/apply/bind`改变`this`的函数 → 用普通函数。

## `arguments`、剩余参数与默认值

箭头函数没有自己的`arguments`，请使用剩余参数：

javascript

```
const logAll = (...args) => console.log(args);
logAll(1, 2, 3); // [1, 2, 3]
```

默认参数与解构同样适用：

javascript

```
const connect = (host = "localhost", port = 8080) => `${host}:${port}`;
```

## 作为方法与构造器的陷阱

- 箭头函数不适合作为对象方法声明的实现（需要`this`动态绑定时不合适）。
- 箭头函数不可作为构造器：`new (() => {})`会报错。

javascript

```
const bad = {
  value: 1,
  inc: () => {
    this.value++;
  }, // this 非该对象，通常是 undefined
};
```

## 异步箭头函数与错误处理

javascript

```
const load = async (url) => {
  const res = await http.fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
};

load("/api/data").then(console.log).catch(console.error);
```

## 性能与可读性建议

- 用于短小回调、映射/过滤逻辑非常合适；
- 复杂业务逻辑建议使用具名普通函数，便于调试与栈追踪；
- 谨慎在深层嵌套回调中使用箭头函数，避免难以阅读；
- 统一代码风格：参数一个时是否省略括号、是否总是写圆括号，团队需一致。

## 常见坑清单

1. 返回对象忘加圆括号：`() => ({})`才是返回对象。
2. 误用`this`：对象方法使用箭头函数导致`this`非预期。
3. 误用`arguments`：改用剩余参数`(...args)`。
4. 当作构造器使用：箭头函数不能`new`。

## 练习

1. 将一个使用`function`的回调改为箭头函数，并确保`this`正确。
2. 用箭头函数实现`map/flatMap/reduce`的一段数据处理管道，并写出对比的普通函数形式。
3. 编写一个返回对象字面量的箭头函数，体会需要圆括号的原因。
