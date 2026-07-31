---
title: "JSON 详解"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/04-json.html"
---

# JSON 详解

JSON (JavaScript Object Notation) 是一种轻量级的数据交换格式。它基于 JavaScript 的一个子集，但独立于语言，易于人类阅读和编写，也易于机器解析和生成。

## JSON 语法

JSON 数据由键值对组成，类似于 JavaScript 的对象字面量。

- **键**必须是双引号括起来的字符串。
- **值**可以是字符串、数字、布尔值、数组、`null`或另一个 JSON 对象。

json

```
{
  "name": "高级治疗药水",
  "type": "药水",
  "restores": {
    "health": 100,
    "mana": 50
  },
  "ingredients": [
    "月光草",
    "精灵之泪"
  ],
  "isMagic": true
}
```

## `JSON.stringify()`

`JSON.stringify()`方法将一个 JavaScript 对象或值转换为 JSON 字符串。

javascript

```
const player = {
  name: "Aris",
  level: 20,
  isOnline: true
};

const jsonString = JSON.stringify(player);

console.log(jsonString);
// 输出: {"name":"Aris","level":20,"isOnline":true}
```

## `JSON.parse()`

`JSON.parse()`方法将一个 JSON 字符串解析为 JavaScript 对象或值。

javascript

```
const jsonData = '{"name":"Aris","level":20,"isOnline":true}';

const playerObject = JSON.parse(jsonData);

console.log(playerObject.name); // 输出: Aris
console.log(playerObject.level); // 输出: 20
```

在与服务器通信或存储复杂数据时，JSON 是一个非常有用的工具。
