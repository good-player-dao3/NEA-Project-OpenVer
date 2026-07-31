---
title: "参数和返回值"
source: "https://docs.dao3.fun/arena/javascriptEntry/04-functions/02-parameters-and-return-values.html"
---

# 参数和返回值

函数可以通过参数接收输入，并通过返回值输出结果。这使得函数更加灵活和强大。

## 参数

参数是在函数定义中列出的变量，用作函数内部的占位符。当你调用函数时，可以向其传递值（称为参数）。

javascript

```
function greet(name) {
  console.log("你好, " + name + "!");
}

greet("Alice"); // 输出: 你好, Alice!
greet("Bob"); // 输出: 你好, Bob!
```

### 多个参数

函数可以有多个参数，用逗号分隔。

javascript

```
function add(a, b) {
  console.log(a + b);
}

add(5, 3); // 输出: 8
```

### 默认参数

你可以为参数指定默认值。如果调用函数时未提供该参数，则会使用默认值。

javascript

```
function sayHello(name = "朋友") {
  console.log("你好, " + name);
}

sayHello("张三"); // 输出: 你好, 张三
sayHello(); // 输出: 你好, 朋友
```

## 返回值

函数可以使用`return`语句将一个值返回给调用者。当`return`语句被执行时，函数会立即停止执行并返回值。

javascript

```
function multiply(a, b) {
  return a * b;
}

let result = multiply(4, 5);
console.log(result); // 输出: 20
```

如果函数没有`return`语句，它会默认返回`undefined`。

javascript

```
function doNothing() {
  // 这个函数没有 return 语句
}

let value = doNothing();
console.log(value); // 输出: undefined
```

通过结合使用参数和返回值，你可以创建出能够处理各种数据并产生有用结果的通用函数。
