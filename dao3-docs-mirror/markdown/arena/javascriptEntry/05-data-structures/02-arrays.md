---
title: "数组"
source: "https://docs.dao3.fun/arena/javascriptEntry/05-data-structures/02-arrays.html"
---

# 数组

数组是一种特殊的对象，用于存储有序的值的集合。数组中的每个值称为一个元素，每个元素都有一个唯一的数字索引，从 0 开始。

## 创建数组

你可以使用方括号`[]`来创建一个数组字面量。

javascript

```
// 一个空数组
let emptyArray = [];

// 一个包含数字的数组
let scores = [98, 85, 91, 78];

// 一个包含字符串的数组
let fruits = ["苹果", "香蕉", "橙子"];

// 数组可以包含不同类型的值
let mixedArray = ["你好", 100, true];
```

## 访问元素

你可以使用方括号`[]`和元素的索引来访问数组中的元素。请记住，数组的索引是从 0 开始的。

javascript

```
let fruits = ["苹果", "香蕉", "橙子"];

console.log(fruits[0]); // 输出: 苹果
console.log(fruits[1]); // 输出: 香蕉
```

## 修改元素

你可以通过索引来修改数组中的元素。

javascript

```
let colors = ["红色", "绿色", "蓝色"];
colors[1] = "黄色";

console.log(colors); // 输出: ["红色", "黄色", "蓝色"]
```

## 数组的属性和方法

### `length`属性

`length`属性返回数组中元素的数量。

javascript

```
let numbers = [10, 20, 30, 40];
console.log(numbers.length); // 输出: 4
```

### `push()`方法：添加元素到末尾

`push()`方法向数组的末尾添加一个或多个元素。

javascript

```
let tasks = ["学习", "游戏"];
tasks.push("吃饭");

console.log(tasks); // 输出: ["学习", "游戏", "吃饭"]
```

### `pop()`方法：移除末尾的元素

`pop()`方法移除数组的最后一个元素，并返回该元素。

javascript

```
let items = ["A", "B", "C"];
let lastItem = items.pop();

console.log(lastItem); // 输出: C
console.log(items); // 输出: ["A", "B"]
```

## 遍历数组

你可以使用`for`循环来遍历数组中的所有元素。

javascript

```
let scores = [100, 90, 80];

for (let i = 0; i < scores.length; i++) {
  console.log("分数: " + scores[i]);
}
// 输出:
// 分数: 100
// 分数: 90
// 分数: 80
```

数组是处理数据列表的强大工具，在游戏开发中，你会经常使用它们来管理物品栏、玩家列表等。
