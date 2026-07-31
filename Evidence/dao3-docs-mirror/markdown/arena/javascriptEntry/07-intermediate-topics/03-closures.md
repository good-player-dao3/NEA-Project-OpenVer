---
title: "闭包（Closures）"
source: "https://docs.dao3.fun/arena/javascriptEntry/07-intermediate-topics/03-closures.html"
---

# 闭包（Closures）

闭包是 JavaScript 中一个基础且强大的概念。当一个函数能够记住并访问其所在的词法作用域（lexical scope）时，即使该函数在其词法作用域之外执行，闭包就产生了。

简单来说，**闭包 = 函数 + 该函数被创建时所访问的自由变量**。

## 一个简单的闭包示例

javascript

```
function createGreeter(greeting) {
  // `greeting` 是一个自由变量
  return function(name) {
    // 这个内部函数是一个闭包
    console.log(`${greeting}, ${name}!`);
  };
}

// createGreeter 执行完毕后，其作用域本应销毁
// 但闭包的存在，使得 greeting 变量被保留了下来
const sayHello = createGreeter("Hello");
const sayHi = createGreeter("Hi");

sayHello("Alice"); // 输出: Hello, Alice!
sayHi("Bob");     // 输出: Hi, Bob!
```

在上面的例子中，`createGreeter`返回了一个内部函数。这个内部函数“记住”了它被创建时的环境，特别是`greeting`变量。因此，即使`createGreeter`已经执行完毕，`sayHello`和`sayHi`仍然可以访问`greeting`。

## 常见用例

### 1. 创建私有变量

闭包是 JavaScript 中实现私有变量和方法的常用方式，这被称为模块模式（Module Pattern）。

javascript

```
function createPlayer(name) {
  let health = 100; // 这是一个“私有”变量

  function takeDamage(amount) {
    health -= amount;
    if (health < 0) health = 0;
    console.log(`${name}受到了${amount}点伤害，剩余生命：${health}`);
  }

  function getHealth() {
    return health;
  }

  // 返回一个对象，只暴露公共接口
  return {
    name: name,
    dealDamage: takeDamage,
    checkHealth: getHealth
  };
}

const player = createPlayer("Gandalf");

player.dealDamage(20); // Gandalf受到了20点伤害，剩余生命：80
console.log(player.checkHealth()); // 80

// 无法直接访问 health 变量
console.log(player.health); // undefined
```

### 2. 在循环中捕获变量

在使用`var`的`for`循环中，闭包可以解决一个常见的问题：循环结束后，所有回调函数都引用了同一个变量。

javascript

```
// 错误示例
for (var i = 1; i <= 3; i++) {
  setTimeout(function() {
    console.log(i); // 会输出三次 4
  }, i * 100);
}

// 正确示例 (使用闭包)
for (var i = 1; i <= 3; i++) {
  (function(j) { // 使用立即执行函数表达式(IIFE)创建一个新的作用域
    setTimeout(function() {
      console.log(j); // 输出 1, 2, 3
    }, j * 100);
  })(i);
}

// ES6+ 更简单的方法
// `let` 会为每次循环创建一个新的块级作用域
for (let i = 1; i <= 3; i++) {
  setTimeout(function() {
    console.log(i); // 输出 1, 2, 3
  }, i * 100);
}
```

闭包是理解许多高级 JavaScript 模式和框架的基础，值得花时间去掌握。
