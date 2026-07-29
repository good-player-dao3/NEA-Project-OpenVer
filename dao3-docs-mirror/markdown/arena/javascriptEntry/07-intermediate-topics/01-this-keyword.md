---
title: "this 关键字详解"
source: "https://docs.dao3.fun/arena/javascriptEntry/07-intermediate-topics/01-this-keyword.html"
---

# `this`关键字详解

在 JavaScript 中，`this`关键字是一个非常强大但也容易引起混淆的概念。它的值在函数被调用时确定，取决于函数调用的上下文。

## `this`的四种绑定规则

理解`this`的关键在于了解它的四种主要绑定规则。

### 1. 默认绑定

当函数作为独立函数调用时（没有明确的属主对象），`this`会指向全局对象。在浏览器中是`window`，在严格模式 (`'use strict'`) 下是`undefined`。

javascript

```
function showThis() {
  console.log(this);
}

showThis(); // 在浏览器非严格模式下，输出 Window 对象
```

### 2. 隐式绑定

当函数作为对象的方法被调用时，`this`会指向调用该方法的对象。

javascript

```
const player = {
  name: "Zoe",
  greet: function() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

player.greet(); // 输出: Hello, I'm Zoe
```

### 3. 显式绑定

你可以使用`call()`,`apply()`, 或`bind()`方法来明确指定函数执行时的`this`值。

- **`call()`和`apply()`**：立即调用函数，并允许你传入`this`的值和参数。
- **`bind()`**：创建一个新函数，其`this`值被永久绑定到你指定的值。

javascript

```
function introduce(item1, item2) {
  console.log(`I am ${this.name} and I have a ${item1} and a ${item2}.`);
}

const character = { name: "Gandalf" };
const items = ["staff", "pipe"];

introduce.call(character, items[0], items[1]); // I am Gandalf and I have a staff and a pipe.
introduce.apply(character, items);             // I am Gandalf and I have a staff and a pipe.

const boundIntroduce = introduce.bind(character, items[0], items[1]);
boundIntroduce();                              // I am Gandalf and I have a staff and a pipe.
```

### 4.`new`绑定

当使用`new`关键字调用一个函数（即构造函数）时，`this`会指向新创建的实例对象。

javascript

```
function Player(name) {
  this.name = name;
  this.health = 100;
}

const player1 = new Player("Aragorn");
console.log(player1.name); // 输出: Aragorn
```

## 箭头函数中的`this`

箭头函数 (`=>`) 不遵循上述规则。它们没有自己的`this`绑定，而是从其父级（词法）作用域继承`this`的值。这在处理回调函数时非常有用。

javascript

```
const team = {
  name: "Fellowship",
  members: ["Frodo", "Sam", "Merry"],
  showMembers: function() {
    this.members.forEach(member => {
      // 箭头函数继承了 showMembers 方法的 this
      console.log(`${member} is part of the ${this.name}`);
    });
  }
};

team.showMembers();
// 输出:
// Frodo is part of the Fellowship
// Sam is part of the Fellowship
// Merry is part of the Fellowship
```

掌握`this`的工作原理是迈向 JavaScript 精通的重要一步。
