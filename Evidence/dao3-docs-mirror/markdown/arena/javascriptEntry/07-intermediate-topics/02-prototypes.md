---
title: "原型与原型链"
source: "https://docs.dao3.fun/arena/javascriptEntry/07-intermediate-topics/02-prototypes.html"
---

# 原型与原型链

原型（Prototype）是 JavaScript 中实现继承的核心机制。每个 JavaScript 对象都有一个内部属性`[[Prototype]]`，它指向另一个对象。这个“另一个对象”就是该对象的原型。当试图访问一个对象的属性时，如果在该对象上找不到，JavaScript 引擎会自动沿着原型链向上查找。

## `__proto__`和`Object.getPrototypeOf()`

虽然`[[Prototype]]`是一个内部属性，但我们可以通过`__proto__`（不推荐在生产代码中使用）或`Object.getPrototypeOf()`来访问它。

javascript

```
const warrior = {
  attack() {
    return 'Attack!';
  }
};

const elf = {
  name: 'Legolas'
};

// 将 warrior 设置为 elf 的原型
Object.setPrototypeOf(elf, warrior);

console.log(elf.attack()); // 输出: Attack!
console.log(Object.getPrototypeOf(elf) === warrior); // 输出: true
```

在上面的例子中，`elf`对象本身没有`attack`方法。当`elf.attack()`被调用时，引擎在`elf`上找不到`attack`，于是就去它的原型`warrior`上查找，并成功找到了该方法。

## 原型链

对象的原型也可以有自己的原型，这样就形成了一个原型链。查找属性的旅程会沿着这条链一直持续到链的末端，即一个其原型为`null`的对象。

javascript

```
const character = {
  health: 100
};

const mage = Object.create(character);
mage.mana = 150;

const fireMage = Object.create(mage);
fireMage.spell = 'Fireball';

console.log(fireMage.spell);    // 'Fireball' (自有属性)
console.log(fireMage.mana);     // 150 (继承自 mage)
console.log(fireMage.health);   // 100 (继承自 character)
```

这条原型链是：`fireMage`->`mage`->`character`->`Object.prototype`->`null`。

## 构造函数与`prototype`属性

当使用构造函数创建一个新对象时，新对象的`[[Prototype]]`会被设置为构造函数的`prototype`属性。

javascript

```
function Player(name) {
  this.name = name;
}

// 在 Player 的原型上添加一个方法
Player.prototype.sayHello = function() {
  return `Hello, I am ${this.name}`;
};

const player1 = new Player('Bilbo');
const player2 = new Player('Frodo');

console.log(player1.sayHello()); // 输出: Hello, I am Bilbo
console.log(player2.sayHello()); // 输出: Hello, I am Frodo

// 两个实例共享同一个原型方法
console.log(player1.sayHello === player2.sayHello); // 输出: true
```

这种方式非常高效，因为所有`Player`的实例都共享`sayHello`方法，而不是每个实例都创建一个新的函数。

虽然 ES6 的`class`语法在很大程度上简化了继承的写法，但其底层原理仍然是基于原型的。理解原型是深入掌握 JavaScript 的关键。
