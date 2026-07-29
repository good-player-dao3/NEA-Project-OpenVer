---
title: "Intl 国际化基础"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-13-intl-basics.html"
---

# Intl 国际化基础

使用 Intl 对日期、数字、相对时间进行本地化格式化。

javascript

```
// 数字格式
const nf = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
});
console.log(nf.format(1234.5)); // ￥1,234.50

// 日期时间
const df = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeStyle: "short",
});
console.log(df.format(new Date()));

// 相对时间
const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });
console.log(rtf.format(-1, "day")); // 昨天
```

场景：多语言 UI、地区化显示。

## NumberFormat 更深入

javascript

```
new Intl.NumberFormat("de-DE").format(1234567.89); // '1.234.567,89'
new Intl.NumberFormat("en-US", { style: "percent" }).format(0.1234); // '12%'

// 货币
new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(
  1234
);
```

参数提示：`maximumFractionDigits`、`minimumIntegerDigits`、`notation: 'compact'`（如 1.2K）。

## DateTimeFormat：时区与样式

javascript

```
new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date());

// 指定时区
new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  timeStyle: "short",
}).format(new Date());
```

注意：时区、历法（如`calendar: 'gregory'`）与数字系统（如`numberingSystem`）。

## RelativeTimeFormat：相对时间

javascript

```
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
rtf.format(-1, "day"); // 'yesterday'
rtf.format(2, "hour"); // 'in 2 hours'
```

## ListFormat 与 DisplayNames

javascript

```
// 列表格式化
new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format([
  "A",
  "B",
  "C",
]);
// => 'A, B, and C'

// 地区/语言/脚本显示名
new Intl.DisplayNames(["en"], { type: "region" }).of("CN"); // 'China'
```

## Segmenter：本地化分词

javascript

```
const seg = new Intl.Segmenter("zh", { granularity: "word" });
const input = "今天下雨了";
console.log(Array.from(seg.segment(input), (x) => x.segment));
```

用于按语言切词、光标移动、文本高亮等。

## 语言协商与回退

`Intl`会根据传入的 locale 列表与系统支持度选择最匹配的语言（language negotiation）。建议传入优先列表：

javascript

```
new Intl.NumberFormat(["zh-Hans-CN", "zh-CN", "en-US"]).format(1000);
```

## 常见陷阱

- 时区不一致导致时间显示错乱（服务器与客户端差异）；
- 货币小数位差异（JPY 没有小数）；
- 不同浏览器/平台对某些 Intl API 支持度不同（需降级或 Polyfill）。

## 最佳实践

- 将`locale`存在用户设置中，并在所有格式化 API 统一使用；
- 尽量使用`dateStyle/timeStyle`等高层选项；
- 金额使用`NumberFormat`的货币样式，不手写格式化；
- 为老设备准备 Polyfill（如`@formatjs/intl-*`）。

## 练习

1. 实现一个`formatAmount(amount, currency, locale)`返回本地化货币字符串；
2. 实现一个根据用户语言设置的“相对时间”提示组件（`Intl.RelativeTimeFormat`）；
3. 使用`Intl.Segmenter`将一段中文文本按词切分，并高亮每个词。
