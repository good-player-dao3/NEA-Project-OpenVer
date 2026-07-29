---
title: "生成器与 yield"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/06-generators-and-yield.html"
---

# 生成器与`yield`

生成器（Generator）是 ES6 引入的一种特别的函数类型，用`function*`定义，能通过`yield`语句“暂停”和“恢复”执行。 它实现了迭代器协议（Iterator Protocol），非常适合处理可逐步产生的数据、状态机、惰性计算以及优雅的控制流程。

本教程将从入门到进阶，层层递进地理解生成器与`yield`。

## 1. 基本概念与语法

- 生成器函数：使用`function*`定义，调用后不会立刻执行，而是返回一个“迭代器对象”。
- `yield`：在函数体内产出一个值，并“暂停”在当前位置，等待外部唤醒。
- `next()`：外部调用迭代器的`next()`可恢复执行，继续运行到下一个`yield`或函数结束。

javascript

```
// 用 function* 声明生成器函数
function* simpleGenerator() {
  // 第一次 next() 会从函数开始执行到第一个 yield 停止
  yield 1; // 产出 1 并暂停
  yield 2; // 再次产出 2 并暂停
  return 3; // return 代表生成器结束，可提供一个“最终返回值”（不会被 for...of 遍历）
}

const it = simpleGenerator(); // 调用不会执行，返回迭代器

console.log(it.next()); // { value: 1, done: false }
console.log(it.next()); // { value: 2, done: false }
console.log(it.next()); // { value: 3, done: true }  // done 为 true 表示已完成
console.log(it.next()); // { value: undefined, done: true } // 继续 next 仍然完成
```

要点：

- `value`是产出的值；`done`表示是否完成。
- 当`done: true`时，`value`通常为`return`的返回值（若未写`return`，则为`undefined`）。

## 2. 与`for...of`、展开等配合

生成器天然可迭代，能与`for...of`、展开语法、数组解构等一起使用。

javascript

```
function* gen() {
  yield "A";
  yield "B";
  yield "C";
}

// for...of 会自动迭代直到 done: true，但不会包含 return 的值
for (const ch of gen()) {
  console.log(ch); // A B C
}

// 展开语法
const arr = [...gen()];
console.log(arr); // ['A', 'B', 'C']

// 数组解构
const [x, y] = gen();
console.log(x, y); // 'A' 'B'
```

## 3. 向生成器内部“传值”与异常传入

`next(value)`可以将一个值作为上一次`yield`表达式的结果传回生成器内部；`throw(error)`可以在生成器内部抛出一个异常，便于外部驱动错误流程；`return(value)`用于提前终止生成器。

javascript

```
function* echo() {
  const a = yield "请输入 A"; // 外部 next('X') -> 这里 a 收到 'X'
  const b = yield "请输入 B"; // 外部 next('Y') -> 这里 b 收到 'Y'
  return `${a}-${b}`;
}

const it = echo();
console.log(it.next()); // { value: '请输入 A', done: false }
console.log(it.next("X")); // { value: '请输入 B', done: false }
console.log(it.next("Y")); // { value: 'X-Y', done: true }

// throw 注入错误
function* mightFail() {
  try {
    yield "准备中";
    yield "处理中";
  } catch (e) {
    // 可以在生成器内部捕获外部注入的错误
    return `失败: ${e.message}`;
  }
}

const it2 = mightFail();
console.log(it2.next()); // { value: '准备中', done: false }
console.log(it2.throw(new Error("网络错误"))); // { value: '失败: 网络错误', done: true }
```

## 4.`yield*`：委托给另一个可迭代对象

`yield*`用于把生成器的部分迭代“委托”给另一个可迭代对象（如另一个生成器、数组、字符串等）。

javascript

```
function* sub() {
  yield 2;
  yield 3;
  return 99; // 注意：被委托生成器的 return 值可被接收
}

function* main() {
  yield 1;
  const ret = yield* sub(); // 把迭代委托给 sub()
  console.log("sub return =", ret); // 输出 99（不会出现在 for...of 中）
  yield 4;
}

console.log([...main()]); // [1, 2, 3, 4]
```

## 5. 常见应用场景

- 惰性序列与大数据流：按需产出，节省内存。
- 状态机/流程编排：通过暂停与恢复优雅管理复杂流程。
- 可中断的逻辑/协程风格：相比回调或复杂 Promise 链更直观（历史上常配合`co`等库）。

### 5.1 惰性序列（无限序列示例）

javascript

```
// 按需生成无限自然数序列（请勿直接展开成数组，会无限）
function* naturals() {
  let n = 0;
  while (true) {
    yield n++; // 每次需要时才产生下一个数
  }
}

// 消费：只取前 5 个
function take(it, count) {
  const result = [];
  for (const x of it) {
    result.push(x);
    if (result.length >= count) break;
  }
  return result;
}

console.log(take(naturals(), 5)); // [0, 1, 2, 3, 4]
```

### 5.2 有限批处理（分页/分块处理）

javascript

```
function* batch(arr, size = 3) {
  for (let i = 0; i < arr.length; i += size) {
    // 每次产出一个“小批次”
    yield arr.slice(i, i + size);
  }
}

for (const group of batch([1, 2, 3, 4, 5, 6, 7], 3)) {
  console.log(group); // [1,2,3] -> [4,5,6] -> [7]
}
```

### 5.3 状态机（简单怪物 AI 示例）

javascript

```
function* monsterAI() {
  // 初始状态：巡逻
  yield "patrol";
  // 发现玩家：追逐
  yield "chase";
  // 接近玩家：攻击
  yield "attack";
  // 受伤后：撤退
  yield "retreat";
}

for (const state of monsterAI()) {
  console.log("AI 状态 =>", state);
}
// 输出：patrol -> chase -> attack -> retreat
```

## 6. 与异步的关系（历史与现状）

在`async/await`出现之前，社区常用“生成器 + 运行器（runner）”来写出同步风格的异步代码（如`co`库）。 如今`async/await`更为主流、简单，但理解生成器对掌握 JS 执行模型和高级场景仍然很有价值。

下面是一个“用生成器顺序执行 Promise”的简化示例（教学用途）：

javascript

```
function run(genFn) {
  const it = genFn();
  return new Promise((resolve, reject) => {
    function step(nextF, arg) {
      let next;
      try {
        next = nextF.call(it, arg); // it.next(arg) 或 it.throw(err)
      } catch (err) {
        return reject(err);
      }

      const { value, done } = next;
      if (done) return resolve(value);
      // 将 yield 的值当作 Promise 处理
      Promise.resolve(value).then(
        (v) => step(it.next, v),
        (e) => step(it.throw, e)
      );
    }
    step(it.next); // 启动
  });
}

// 示例：依次等待两个异步任务
function* task() {
  const a = yield new Promise((r) => setTimeout(() => r(1), 100));
  const b = yield new Promise((r) => setTimeout(() => r(a + 1), 100));
  return b * 2; // 期望 4
}

run(task).then(console.log); // 4
```

实际项目中更推荐使用`async/await`：

javascript

```
async function taskAsync() {
  const a = await new Promise((r) => setTimeout(() => r(1), 100));
  const b = await new Promise((r) => setTimeout(() => r(a + 1), 100));
  return b * 2; // 4
}

taskAsync().then(console.log);
```

## 7. 清理与终止：`return()`与`finally`

- 迭代器的`return(value)`可从外部请求提前结束生成器。
- 在生成器内部，`try...finally`可确保清理代码必定执行（不论正常完成或被外部终止）。

javascript

```
function* work() {
  try {
    yield "step1";
    yield "step2";
  } finally {
    // 用于资源清理、日志、解锁等
    console.log("清理：释放资源");
  }
}

const it = work();
console.log(it.next()); // { value: 'step1', done: false }
console.log(it.return("x")); // { value: 'x', done: true } -> 触发 finally
// 控制台会打印：清理：释放资源
```

## 8. 注意事项与最佳实践

- `for...of`不会遍历`return`的返回值，需要时请手动处理。
- 生成器返回的迭代器通常是“一次性”的，迭代完成后不能复用，需要重新调用生成器函数获取新迭代器。
- 不要对无限生成器做无界展开（如`[...]`），否则会导致卡死或内存耗尽。
- 将生成器用于“复杂但可线性描述”的流程最合适；若只是简单异步，优先`async/await`。

## 9. 小结

- `function*`定义可暂停/恢复的生成器函数，`yield`用于产出值并暂停。
- 生成器与迭代协议天然契合，可配合`for...of`、展开、解构等。
- 通过`next/throw/return`，外部可与生成器进行双向通信与控制。
- 实战应用包括惰性序列、分页批处理、状态机、以及历史上的协程式异步流程控制。

掌握生成器与`yield`，能帮助你在需要精细控制执行流程与数据生产的场景下写出更优雅、可维护的代码。
