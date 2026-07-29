---
title: "Symbol 与迭代协议"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-09-symbol-iterator.html"
---

# Symbol 与迭代协议

`Symbol`是一种原始数据类型，常用于创建独一无二的标识；`Symbol.iterator`是迭代协议的关键，让对象可被`for...of`、展开等消费。

## Symbol 基础

javascript

```
const KEY = Symbol("unique");
const obj = { [KEY]: 42 };
console.log(obj[KEY]); // 42（避免与普通键冲突）
```

## 可迭代对象与`Symbol.iterator`

javascript

```
const range = {
  start: 1,
  end: 3,
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  },
};

console.log([...range]); // [1, 2, 3]
```

要点：

- 实现`Symbol.iterator`即可迭代；
- 数组、字符串、Map、Set 等内置类型已内置可迭代性；
- 生成器（`function*`）可更优雅地实现迭代逻辑。

## Symbol 进阶：全局注册表与描述

javascript

```
const s1 = Symbol("desc");
const s2 = Symbol("desc");
console.log(s1 === s2); // false（每次都是唯一的）

// 全局注册表：可通过 key 复用相同 symbol
const g1 = Symbol.for("APP_TOKEN");
const g2 = Symbol.for("APP_TOKEN");
console.log(g1 === g2); // true
console.log(Symbol.keyFor(g1)); // 'APP_TOKEN'
```

## 常见内置（Well-known）Symbols

- `Symbol.iterator`：同步迭代协议入口；
- `Symbol.asyncIterator`：异步迭代协议入口（`for await...of`）；
- `Symbol.toStringTag`：自定义对象的`[object X]`标签；
- `Symbol.toPrimitive`：自定义对象到原始值的转换。

javascript

```
const obj = {
  [Symbol.toStringTag]: "Vector2",
  x: 1,
  y: 2,
  [Symbol.toPrimitive](hint) {
    return hint === "number"
      ? Math.hypot(this.x, this.y)
      : `${this.x},${this.y}`;
  },
};

console.log(Object.prototype.toString.call(obj)); // [object Vector2]
console.log(+obj); // 数字上下文 -> 长度
```

## 迭代协议细节

- 可迭代对象：拥有`obj[Symbol.iterator]()`，返回一个迭代器；
- 迭代器：拥有`next()`方法，返回`{ value, done }`；
- for...of 会自动调用迭代器直至`done: true`；
- 生成器天然实现迭代器接口。

javascript

```
const iter = [10, 20][Symbol.iterator]();
console.log(iter.next()); // { value:10, done:false }
console.log(iter.next()); // { value:20, done:false }
console.log(iter.next()); // { value:undefined, done:true }
```

## 构建自定义可迭代

javascript

```
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  [Symbol.iterator]() {
    let cur = this.start,
      end = this.end;
    return {
      next() {
        if (cur <= end) return { value: cur++, done: false };
        return { value: undefined, done: true };
      },
    };
  }
}

console.log([...new Range(3, 6)]); // [3,4,5,6]
```

异步可迭代：实现`Symbol.asyncIterator`并返回带`next()`的异步迭代器，可用于`for await...of`。

## for...of 与 for...in 的区别

- `for...of`遍历“值”，基于迭代协议（数组、字符串、Set、Map、可迭代对象）；
- `for...in`遍历“可枚举属性名”（字符串键），会枚举原型链上的可枚举属性，不适合数组。

javascript

```
for (const v of ["a", "b"]) console.log(v); // a b
for (const k in ["a", "b"]) console.log(k); // 0 1（键名）
```

## 常见陷阱

- 忘记实现`[Symbol.iterator]`却使用`for...of`/展开；
- 在自定义迭代器中返回的对象未遵守`{ value, done }`协议；
- 将`for...in`用于数组导致意外属性遍历；
- 滥用`Symbol.for`导致跨模块共享键名冲突（需命名规范）。

## 最佳实践

- 需要惰性序列/自定义遍历顺序时，实现迭代协议或使用生成器；
- 迭代器中保持纯粹、无副作用的`next()`，便于调试与复用；
- 使用`for...of`遍历数组/集合结构，避免`for...in`；
- 约定`Symbol.for`命名空间前缀（如`app.module.key`）。

## 练习

1. 为一个二维网格实现迭代：按行或按列迭代单元格；
2. 将自定义可迭代改写为生成器版本，比较可读性；
3. 实现异步可迭代，从多个分页接口顺序拉取数据并`for await...of`消费。
