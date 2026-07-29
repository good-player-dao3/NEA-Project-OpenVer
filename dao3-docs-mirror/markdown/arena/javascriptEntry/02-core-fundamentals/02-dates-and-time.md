---
title: "日期与时间基础"
source: "https://docs.dao3.fun/arena/javascriptEntry/02-core-fundamentals/02-dates-and-time.html"
---

# 日期与时间基础

介绍`Date`的创建、解析、常用方法与时区/本地化显示。

## 创建与获取

js

```
const now = new Date(); // 当前时间
const fromTs = new Date(1726500000000); // 通过时间戳
const fromStr = new Date("2025-08-25T00:00:00+08:00"); // ISO 字符串

now.getFullYear(); // 年
now.getMonth();    // 月(0-11)
now.getDate();     // 日(1-31)
now.getHours();    // 时(0-23)
now.getMinutes();  // 分(0-59)
now.getSeconds();  // 秒(0-59)
now.getTime();     // 时间戳(ms)
```

## 格式化显示

js

```
// 简单：内置 toLocaleString
now.toLocaleString("zh-CN", { hour12: false });

// 更细控制：Intl.DateTimeFormat
const fmt = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
  hour12: false,
});
fmt.format(now);
```

## 时间计算

js

```
// 加减毫秒
const after5m = new Date(now.getTime() + 5 * 60 * 1000);

// 计算两个时间差（秒）
function diffSeconds(a, b) {
  return Math.abs(a.getTime() - b.getTime()) / 1000;
}
```

## 推荐阅读

- MDN Date:[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date)
- MDN Intl.DateTimeFormat:[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
