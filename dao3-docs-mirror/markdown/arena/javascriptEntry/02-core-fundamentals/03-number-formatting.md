---
title: "数字格式化与本地化"
source: "https://docs.dao3.fun/arena/javascriptEntry/02-core-fundamentals/03-number-formatting.html"
---

# 数字格式化与本地化

学习如何在界面中友好地展示数值：千位分隔、小数位、货币、百分比等。

## Intl.NumberFormat 基础

js

```
const n = 1234567.891;

// 千分位 & 保留两位小数
new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// 货币（人民币）
new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(n);

// 百分比
new Intl.NumberFormat("zh-CN", { style: "percent", maximumFractionDigits: 1 }).format(0.756);
```

## 自定义格式

js

```
function formatFixed(num, digits = 2) {
  return Number(num).toFixed(digits); // 字符串
}
```

## 推荐阅读

- MDN Intl.NumberFormat:[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
