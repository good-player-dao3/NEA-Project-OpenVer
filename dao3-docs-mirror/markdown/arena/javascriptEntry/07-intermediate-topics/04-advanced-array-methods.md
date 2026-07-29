---
title: "高级数组方法"
source: "https://docs.dao3.fun/arena/javascriptEntry/07-intermediate-topics/04-advanced-array-methods.html"
---

# 高级数组方法

除了基本的数组操作，JavaScript 还提供了一系列强大的高阶函数，它们可以极大地简化数据处理和转换。这些方法通常接收一个函数作为参数，并对数组的每个元素执行该函数。

## `.map()`

`.map()`方法创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。它不会修改原始数组。

**场景**：当你需要将一个数组转换为另一个等长的数组时。

javascript

```
const numbers = [1, 2, 3, 4];

// 将每个数字乘以 2
const doubled = numbers.map(num => num * 2);

console.log(doubled);   // 输出: [2, 4, 6, 8]
console.log(numbers); // 输出: [1, 2, 3, 4] (原始数组不变)

// 从玩家对象数组中提取名字
const players = [
  { name: 'Aris', level: 10 },
  { name: 'Boro', level: 12 }
];
const playerNames = players.map(player => player.name);

console.log(playerNames); // 输出: ['Aris', 'Boro']
```

## `.filter()`

`.filter()`方法创建一个新数组，其包含通过所提供函数实现的测试的所有元素。它也不会修改原始数组。

**场景**：当你需要从数组中筛选出符合特定条件的元素时。

javascript

```
const scores = [85, 92, 78, 60, 95];

// 筛选出及格的分数
const passingScores = scores.filter(score => score >= 80);

console.log(passingScores); // 输出: [85, 92, 95]

// 筛选出所有在线的玩家
const players = [
  { name: 'Aris', isOnline: true },
  { name: 'Boro', isOnline: false },
  { name: 'Cora', isOnline: true }
];
const onlinePlayers = players.filter(player => player.isOnline);

console.log(onlinePlayers.map(p => p.name)); // 输出: ['Aris', 'Cora']
```

## `.reduce()`

`.reduce()`方法对数组中的每个元素执行一个 “reducer” 函数（由你提供），并将其结果汇总为单个返回值。它可能是最强大但也最难理解的数组方法。

**语法**：`arr.reduce(callback(accumulator, currentValue[, index[, array]])[, initialValue])`

- `accumulator`：累计器，累计回调的返回值。它是上一次调用回调时返回的累积值，或`initialValue`。
- `currentValue`：数组中正在处理的元素。

**场景**：当你需要将数组中的所有元素“合并”成一个单一值时（例如，求和、求平均值、或将数组转换为对象）。

javascript

```
const numbers = [1, 2, 3, 4, 5];

// 计算数组的总和
const sum = numbers.reduce((total, current) => total + current, 0);
// 第一次: total=0, current=1 -> returns 1
// 第二次: total=1, current=2 -> returns 3
// 第三次: total=3, current=3 -> returns 6
// ...以此类推

console.log(sum); // 输出: 15

// 将玩家数组按名字索引转换为对象
const players = [
  { id: 'p1', name: 'Aris' },
  { id: 'p2', name: 'Boro' }
];

const playersById = players.reduce((acc, player) => {
  acc[player.id] = player;
  return acc;
}, {});

console.log(playersById);
// 输出:
// {
//   p1: { id: 'p1', name: 'Aris' },
//   p2: { id: 'p2', name: 'Boro' }
// }
```

掌握`.map()`,`.filter()`, 和`.reduce()`可以让你用更声明式、更简洁的方式来处理数据，从而提升代码的可读性和效率。
