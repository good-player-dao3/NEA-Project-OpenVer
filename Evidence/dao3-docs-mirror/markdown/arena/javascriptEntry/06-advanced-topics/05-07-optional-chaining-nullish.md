---
title: "可选链（?.）与空值合并（??）"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-07-optional-chaining-nullish.html"
---

# 可选链（?.）与空值合并（??）

减少层层判断，提高可读性与健壮性。

javascript

```
const user = { profile: { name: "Elara" } };
console.log(user.profile?.name); // 'Elara'
console.log(user.stats?.level); // undefined（不抛错）

const val = 0 ?? 42; // 仅当左侧为 null/undefined 时取右侧
console.log(val); // 0（不同于 ||）
```

典型用法：

- 访问可能不存在的深层属性；
- 提供“空值”默认而非“假值”默认。

## 三种可选链形式

1. 属性访问：`obj?.prop`
2. 索引访问：`arr?.[i]`
3. 函数/方法调用：`fn?.(args)`或`obj.method?.(args)`

javascript

```
user?.profile?.avatarUrl;
const first = list?.[0];
callback?.("hello"); // callback 存在且为函数时才调用
```

## 与空值合并（??）组合

`??`只在左侧为 null 或 undefined 时才使用右侧默认值：

javascript

```
const title = post.title ?? "Untitled";
const page = (query.page ?? 1) + 0; // 0/空字符串不会被当作空值
```

对比`||`（会把 0、''、false 当作“假值”而回退）：

javascript

```
0 || 42; // 42（可能不是你要的）
0 ?? 42; // 0（保留有效的 0）
"" || "N/A"; // 'N/A'
"" ?? "N/A"; // ''
```

## 与逻辑赋值（&&=、||=、??=）

javascript

```
let a = 0;
let b = null;
let c = "x";

a ||= 42; // 0 被视为假 -> a=42（若不想这样请用 ??=）
b ??= 7; // 仅 null/undefined 时赋值 -> b=7
c &&= c + "!"; // 真值才更新 -> 'x!'
```

## 常见陷阱

- 可选链仅短路为 undefined，不会捕获错误；
- 不要在赋值左侧使用可选链（`obj?.prop = x`是语法错误）；
- 注意可选调用与方法丢失 this 的问题：

javascript

```
const obj = {
  x: 1,
  getX() {
    return this.x;
  },
};
const fn = obj.getX;
console.log(fn?.()); // undefined，因为 this 丢失
console.log(obj.getX?.()); // 1
```

## 最佳实践

- 当你确信“0/''/false 是有效值”时，优先`??`而非`||`；
- 深层访问前先用可选链缩短保护代码：`data?.a?.b?.c`；
- 对可选的回调使用`cb?.()`代替显式判断；
- 与类型系统（TS）搭配，减少非空断言的需要。

## 练习

1. 写一个函数`safeGet(obj, pathArray, defaultValue)`，使用可选链与空值合并安全读取深层属性。
2. 将使用`||`的默认值逻辑改为`??`，以保留 0/''/false 等有效值。
3. 为一个可选回调`onDone`改写为`onDone?.(result)`，并比较可读性。
