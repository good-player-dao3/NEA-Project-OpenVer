---
title: "事件循环 (The Event Loop)"
source: "https://docs.dao3.fun/arena/javascriptEntry/08-advanced-topics/02-event-loop.html"
---

# 事件循环 (The Event Loop)

JavaScript 是一门单线程语言，这意味着它在任何给定时刻只能执行一个任务。然而，它通过一个称为“事件循环”的并发模型来处理异步操作（如`setTimeout`、用户输入或网络请求），而不会阻塞主线程。

理解事件循环的关键在于了解它的三个主要组成部分：

1. **调用栈 (Call Stack)**：一个后进先出 (LIFO) 的数据结构，用于追踪函数的调用。当一个函数被调用时，它被推入栈中；当函数返回时，它被弹出。
2. **消息队列 (Message Queue)**：一个先进先出 (FIFO) 的数据结构，用于存放待处理的异步任务的回调函数。
3. **事件循环 (Event Loop)**：一个持续运行的进程，它的唯一工作就是监视调用栈和消息队列。**如果调用栈为空，它会从消息队列中取出一个任务（回调函数）并将其推入调用栈执行。**

## 工作流程

让我们通过一个例子来理解这个流程：

javascript

```
console.log('开始'); // 1

setTimeout(function() { // 2
  console.log('定时器回调');
}, 0);

Promise.resolve().then(function() { // 3
  console.log('Promise 回调');
});

console.log('结束'); // 4
```

你可能认为输出会是`开始 -> 定时器回调 -> Promise 回调 -> 结束`，但实际输出是：

```
开始
结束
Promise 回调
定时器回调
```

**为什么会这样？**

1. `console.log('开始')`被推入调用栈，执行，然后弹出。
2. `setTimeout`被调用。它的回调函数被交给 Web API 处理（浏览器负责计时）。计时器立即完成（因为延迟是 0），然后将`定时器回调`函数放入**宏任务队列 (Macrotask Queue)**。
3. `Promise.resolve().then()`被调用。它的`.then()`回调函数被放入一个特殊的队列，称为**微任务队列 (Microtask Queue)**。
4. `console.log('结束')`被推入调用栈，执行，然后弹出。

此时，主线程的同步代码已经执行完毕，调用栈为空。事件循环现在开始工作。

**关键规则**：**事件循环在每次循环中，会先清空所有微任务，然后再处理一个宏任务。**

1. 事件循环检查微任务队列，发现`Promise 回调`。它被推入调用栈，执行，然后弹出。
2. 微任务队列现在为空。事件循环检查宏任务队列，发现`定时器回调`。它被推入调用栈，执行，然后弹出。

## 微任务 vs. 宏任务

- **微任务 (Microtasks)**：优先级更高，在当前同步代码执行结束后立即执行。常见的微任务包括`Promise.then()`,`Promise.catch()`,`MutationObserver`。
- **宏任务 (Macrotasks)**：优先级较低，在所有微任务执行完毕后，才会从队列中取出一个来执行。常见的宏任务包括`setTimeout`,`setInterval`,`I/O`操作, UI 渲染。

理解事件循环、微任务和宏任务对于分析复杂的异步代码行为、避免性能陷阱以及编写高效的 JavaScript 至关重要。
