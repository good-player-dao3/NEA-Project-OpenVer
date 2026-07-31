---
title: "逻辑赋值运算符（&&=、||=、??=）"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-19-logical-assignment.html"
---

# 逻辑赋值运算符（&&=、||=、??=）

更简洁地根据条件赋值：

javascript

```
let a = 0;
let b = null;
let c = "x";

a ||= 42; // a 为假值时赋右值 -> 42（注意 0 也是假值）
b ??= 7; // 仅当 null/undefined 时赋值 -> 7
c &&= c + "!"; // 仅当真值时更新 -> 'x!'
```

与可选链/空值合并结合可减少样板代码。

## 运算规则回顾

- `a ||= b`等价于`a || (a = b)`：当`a`为假值（falsey：0、''、false、NaN、null、undefined）时赋值；
- `a &&= b`等价于`a && (a = b)`：当`a`为真值（truthy）时赋值；
- `a ??= b`等价于`a ?? (a = b)`：仅当`a`是 null 或 undefined 时赋值（不把 0/''/false 当空值）。

javascript

```
let retries = 0;
retries ||= 3; // 若已有次数(>0)则不覆盖；若为 0 也会被覆盖 -> 注意！

let timeout = null;
timeout ??= 5000; // null/undefined 才赋值 -> 更适合作默认

let token = getTokenOrFalse();
token &&= token.trim(); // 有值再规范化
```

## 与传统写法的对比

javascript

```
// 传统
if (!a) a = b;
// 现代
a ||= b;

// 传统
if (a) a = transform(a);
// 现代
a &&= transform(a);
```

优势：更短更直观，避免重复`a`。

## 搭配可选链与空值合并

javascript

```
// 可选属性若为空则赋默认对象
settings.user ??= {};

// 深层可选链赋值需先确保上层存在
config.options ??= {};
config.options.cache ??= { ttl: 60000 };

// 与可选调用结合
handler?.onInit &&= handler.onInit.bind(handler);
```

## 常见模式

- 默认参数与状态初始化：`state.count ??= 0`；
- 懒加载资源：`conn ??= await connect()`；
- 条件规范化：`input &&= input.trim()`；
- 仅当未设置时启用功能开关：`flags.enableX ??= true`。

## 容易踩坑

- `||=`会把 0/''/false 当成“需要覆盖”，很多场景不符合预期，应改用`??=`；
- 不要用于只读或 getter 属性（可能抛错或产生副作用）；
- 左侧表达式会被求值一次，但注意若是带副作用的表达式会产生意料之外的效果。

## 最佳实践

- 默认值优先`??=`，除非确实要把 0/''/false 视为“未设定”；
- 深层对象赋默认前先用`??=`确保链路存在；
- 搭配可选链、空值合并可显著减少样板代码；
- 写单元测试覆盖边界值（0、''、false、null、undefined）。

## 练习

1. 将一段`if (!x) x = default;`风格的初始化改为`||=`与`??=`两版，并列出差异；
2. 为一个可选配置对象构建安全的默认层级，使用`??=`与可选链；
3. 写一个函数，清理用户输入对象：对每个字符串字段执行`&&= .trim()`，对未设定字段用`??=`赋默认。
