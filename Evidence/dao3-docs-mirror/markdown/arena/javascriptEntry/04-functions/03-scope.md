---
title: "作用域"
source: "https://docs.dao3.fun/arena/javascriptEntry/04-functions/03-scope.html"
---

# 作用域

作用域（Scope）决定了变量和函数在代码中的可访问性。理解作用域对于编写健壮且无错误的代码至关重要。在 JavaScript 中，主要有三种类型的作用域：全局作用域、函数作用域和块级作用域。

## 全局作用域（Global Scope）

在所有函数和代码块之外声明的变量具有全局作用域。这些变量可以在代码的任何地方被访问和修改。

javascript

```
let globalMessage = "这是一个全局消息";

function showMessage() {
  console.log(globalMessage);
}

showMessage(); // 输出: 这是一个全局消息
console.log(globalMessage); // 输出: 这是一个全局消息
```

过度使用全局变量可能会导致命名冲突和意外行为，因此应谨慎使用。

## 函数作用域（Function Scope）

在函数内部使用`var`声明的变量具有函数作用域。这意味着它们只能在声明它们的函数内部被访问。

javascript

```
function greet() {
  var greeting = "你好！";
  console.log(greeting); // 输出: 你好！
}

greet();
// 下面的代码会报错，因为 greeting 在函数外部不可访问
// console.log(greeting);
```

## 块级作用域（Block Scope）

在代码块（例如`if`语句或`for`循环的花括号`{}`内）使用`let`和`const`声明的变量具有块级作用域。它们只能在声明它们的代码块内部被访问。

javascript

```
if (true) {
  let blockScopedVar = "我只在块内可见";
  const alsoBlockScoped = "我也是";
  console.log(blockScopedVar); // 输出: 我只在块内可见
}

// 下面的代码会报错，因为 blockScopedVar 在块外部不可访问
// console.log(blockScopedVar);
```

`let`和`const`的引入使得 JavaScript 的作用域规则更加清晰和可预测，有助于避免许多常见的编程错误。
