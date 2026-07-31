---
title: "条件语句"
source: "https://docs.dao3.fun/arena/javascriptEntry/03-control-flow/01-conditional-statements.html"
---

# 条件语句

条件语句允许你根据不同的条件执行不同的代码块。这使得你的程序能够根据输入或状态的变化做出决策。

## `if`语句

`if`语句在指定条件为`true`时执行代码块。

javascript

```
let score = 85;

if (score > 60) {
  console.log("及格了！");
}
```

## `if...else`语句

`if...else`语句在条件为`true`时执行一个代码块，在条件为`false`时执行另一个代码块。

javascript

```
let temperature = 25;

if (temperature > 30) {
  console.log("天气炎热，注意防暑。");
} else {
  console.log("天气凉爽，适合出门。");
}
```

## `if...else if...else`语句

当有多个条件需要判断时，你可以使用`if...else if...else`语句。

javascript

```
let score = 85;

if (score >= 90) {
  console.log("优秀");
} else if (score >= 80) {
  console.log("良好");
} else if (score >= 60) {
  console.log("及格");
} else {
  console.log("不及格");
}
// 输出: 良好
```

## `switch`语句

`switch`语句用于基于不同的情况执行不同的动作。它通常是`if...else if...else`语句的一种更清晰的替代方案。

javascript

```
let day = 3;
let dayName;

switch (day) {
  case 1:
    dayName = "星期一";
    break;
  case 2:
    dayName = "星期二";
    break;
  case 3:
    dayName = "星期三";
    break;
  default:
    dayName = "未知";
}

console.log(dayName); // 输出: 星期三
```

### `break`关键字

在`switch`语句中，`break`关键字用于跳出`switch`代码块。如果省略`break`，程序将继续执行下一个`case`的代码，直到遇到`break`或`switch`语句结束。
