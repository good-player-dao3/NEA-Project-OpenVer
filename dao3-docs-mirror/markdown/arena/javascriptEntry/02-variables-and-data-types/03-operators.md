---
title: "运算符"
source: "https://docs.dao3.fun/arena/javascriptEntry/02-variables-and-data-types/03-operators.html"
---

# 运算符

运算符是用于执行操作的特殊符号。例如，`+`是一个用于加法的运算符。JavaScript 支持多种类型的运算符。

## 算术运算符

算术运算符用于执行数学计算。

| 运算符 | 描述 | 示例 |
| --- | --- | --- |
| `+` | 加法 | `5 + 2` |
| `-` | 减法 | `5 - 2` |
| `*` | 乘法 | `5 * 2` |
| `/` | 除法 | `5 / 2` |
| `%` | 取模（余数） | `5 % 2` |

javascript

```
let x = 10;
let y = 5;
console.log(x + y); // 15
console.log(x - y); // 5
console.log(x * y); // 50
console.log(x / y); // 2
console.log(x % y); // 0
```

## 赋值运算符

赋值运算符用于给变量赋值。

| 运算符 | 描述 | 示例 |
| --- | --- | --- |
| `=` | 赋值 | `x = 10` |
| `+=` | 加法赋值 | `x += 5` |
| `-=` | 减法赋值 | `x -= 5` |
| `*=` | 乘法赋值 | `x *= 5` |
| `/=` | 除法赋值 | `x /= 5` |

javascript

```
let x = 10;
x += 5; // 等同于 x = x + 5
console.log(x); // 15
```

## 比较运算符

比较运算符用于比较两个值，并返回一个布尔值（`true`或`false`）。

| 运算符 | 描述 |
| --- | --- |
| `==` | 等于（值） |
| `!=` | 不等于（值） |
| `===` | 严格等于（值和类型） |
| `!==` | 严格不等于（值和类型） |
| `>` | 大于 |
| `<` | 小于 |
| `>=` | 大于或等于 |
| `<=` | 小于或等于 |

javascript

```
let a = 10;
let b = 5;
console.log(a > b); // true
console.log(a == 10); // true
console.log(a === "10"); // false，因为类型不同
```

## 逻辑运算符

逻辑运算符用于组合多个条件。

javascript

```
let isAdult = true;
let hasTicket = false;

// AND: 两个条件都为 true 时，结果才为 true
console.log(isAdult && hasTicket); // false

// OR: 只要有一个条件为 true，结果就为 true
console.log(isAdult || hasTicket); // true

// NOT: 反转布尔值
console.log(!isAdult); // false
```
