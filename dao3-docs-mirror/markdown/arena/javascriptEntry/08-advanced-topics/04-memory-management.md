---
title: "JavaScript 内存管理"
source: "https://docs.dao3.fun/arena/javascriptEntry/08-advanced-topics/04-memory-management.html"
---

# JavaScript 内存管理

JavaScript 在变量（对象、字符串等）创建时自动分配内存，并在它们不再被使用时“自动”释放内存。这个自动释放内存的过程被称为**垃圾回收 (Garbage Collection)**。

理解内存管理的基础知识可以帮助你避免一些常见的性能问题，特别是在需要长时间运行且性能敏感的游戏中。

## 内存生命周期

在 JavaScript 中，内存的生命周期大致分为三个阶段：

1. **分配 (Allocate)**：当你创建变量、函数或对象时，JavaScript 引擎会为你分配内存。javascript`letplayer={ name:'Rico'};// 分配内存给对象letenemies=[];// 分配内存给数组`
2. **使用 (Use)**：在代码中读取和写入变量。javascript`player.name='Rico Jr.';// 写入（修改）console.log(enemies.length);// 读取`
3. **释放 (Release)**：当分配的内存不再需要时，它将被垃圾回收器自动释放。

## 垃圾回收 (Garbage Collection)

垃圾回收的核心挑战是判断一块内存是否“不再需要”。JavaScript 引擎主要使用一种名为**标记-清除 (Mark-and-Sweep)**的算法。

这个算法的基本思想是：

- 从一组根（Roots）对象（例如全局对象）开始，垃圾回收器会找到所有从根可访问的对象，并为它们做上“标记”。
- 任何无法从根访问到的对象都被认为是“垃圾”。
- 垃圾回收器会遍历堆，并清除所有未被标记的对象，释放它们的内存。

你不需要手动触发垃圾回收，但你需要确保不再使用的对象变得“不可访问”，以便回收器能够处理它们。

## 常见的内存泄漏

内存泄漏是指程序中已分配的内存由于某种原因未被释放，导致它在程序的生命周期中持续占用内存。长时间运行的应用（如游戏）对内存泄漏尤其敏感。

### 1. 意外的全局变量

如果在函数中忘记使用`let`、`const`或`var`声明变量，该变量会成为全局变量，通常不会被回收。

javascript

```
function createEnemy() {
  // `name` 成为了全局变量，可能导致泄漏
  name = 'Slime';
  // 正确的方式: let name = 'Slime';
}
```

使用`'use strict';`可以帮助防止这种情况。

### 2. 被遗忘的定时器或回调

如果你设置了一个`setInterval`，但忘记在不再需要时清除它，那么定时器引用的任何对象都无法被回收。

javascript

```
function startCombat() {
  let enemy = { id: 1, health: 100 };

  let timer = setInterval(() => {
    console.log(`敌人 ${enemy.id} 正在攻击...`);

    // 假设战斗结束后，我们忘记了清除定时器
    // if (combatOver) { clearInterval(timer); }

  }, 1000);

  // 如果不调用 clearInterval，`timer` 和它引用的 `enemy` 对象将永远不会被回收
}
```

**解决方法**：始终确保在组件销毁或不再需要时，使用`clearInterval`或`removeEventListener`来清理定时器和事件监听器。

### 3. 闭包引起的泄漏

闭包会使其外部函数的变量保持活动状态。如果闭包本身被长时间引用，这些变量也无法被回收。

javascript

```
function createLeakyClosure() {
  let largeObject = new Array(1000000).join('*');

  // 这个返回的函数维持了对 largeObject 的引用
  return function() {
    return largeObject.length;
  };
}

// 即使我们只需要这个函数，largeObject 也会一直存在于内存中
let leakyFunction = createLeakyClosure();
```

**解决方法**：确保不再需要时，解除对闭包的引用（例如，`leakyFunction = null;`）。

虽然现代 JavaScript 引擎的垃圾回收器非常高效，但养成良好的编码习惯，警惕潜在的内存泄漏，是构建高性能、稳定应用的关键。
