---
title: "模板字面量进阶：Tagged Templates"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-14-tagged-templates.html"
---

# 模板字面量进阶：Tagged Templates

标签模板允许你自定义模板字面量的解析逻辑。

javascript

```
function i18n(strings, ...values) {
  // strings: 字面量片段数组；values: 插值值数组
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");
}

const name = "Elara";
console.log(i18n`你好，${name}！`);
```

注意转义与安全（例如 XSS 处理）。

## 1. 标签函数的签名与`raw`

标签函数会收到两个参数序列：

- `strings`：由字面量片段构成的数组（不可变）；
- `...values`：每个`${}`的计算结果，按顺序传入。

同时，`strings.raw`提供“原始”字面量（不会处理如`\n`的转义）。

javascript

```
function debug(strings, ...values) {
  console.log("strings:", strings);
  console.log("raw    :", strings.raw);
  console.log("values :", values);
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");
}

debug`A\nB ${1 + 1} C`;
// strings: [ 'A\nB ', ' C' ]
// raw    : [ 'A\\nB ', ' C' ]  // 注意双反斜杠，表示原始字面量中的转义序列
// values : [ 2 ]
```

## 2. 安全 HTML 插值（防 XSS）

标签模板可作为“安全插值”函数，自动转义用户输入，避免直接拼接到`innerHTML`时的风险。

javascript

```
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function html(strings, ...values) {
  return strings.reduce(
    (acc, s, i) => acc + s + (i < values.length ? escapeHtml(values[i]) : ""),
    ""
  );
}

const user = { name: "<img onerror=alert(1)>" };
const safe = html`<div class="user">${user.name}</div>`;
// => <div class="user">&lt;img onerror=alert(1)&gt;</div>
```

提示：若需要允许部分安全 HTML，可结合白名单过滤或使用可信模板库。

## 3. i18n 与格式化

结合`Intl`可实现更强的本地化格式化：

javascript

```
function fmt(locale, options = {}) {
  const nf = new Intl.NumberFormat(locale, options.number);
  const dt = new Intl.DateTimeFormat(locale, options.date);
  return function template(strings, ...values) {
    const cooked = values.map((v) =>
      typeof v === "number"
        ? nf.format(v)
        : v instanceof Date
        ? dt.format(v)
        : v
    );
    return strings.reduce((acc, s, i) => acc + s + (cooked[i] ?? ""), "");
  };
}

const zh = fmt("zh-CN", { number: { style: "currency", currency: "CNY" } });
console.log(zh`总价：${1234.5}`);
```

## 4. 缩进裁剪与多行字符串整形

常见需求：保持源码缩进，但输出时去掉公共缩进或首尾空行。

javascript

```
function trimIndent(strings, ...values) {
  const text = strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");
  const lines = text
    .replace(/^\n/, "")
    .replace(/\n\s*$/, "")
    .split("\n");
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^\s*/)[0].length);
  const base = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(base)).join("\n");
}

const block = trimIndent`
    任务：
      - 收集 10 颗宝石
      - 打败史莱姆王
`;
console.log(block);
```

## 5. 动态正则构建（小心转义）

javascript

```
function re(strings, ...values) {
  const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = strings.reduce(
    (acc, s, i) => acc + s + (i < values.length ? esc(values[i]) : ""),
    ""
  );
  return new RegExp(pattern, "u");
}

const word = "a+b";
const rx = re`^${word}$`;
console.log(rx.test("a+b")); // true
```

## 6. 带配置的标签（柯里化）

javascript

```
const colorize =
  (color = "black") =>
  (strings, ...values) =>
    strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "") +
    ` [${color}]`;

console.log(colorize("green")`OK ${200}`); // OK 200 [green]
```

## 7. 性能与可维护性

- 标签函数每次调用都会遍历`strings`和`values`，热点路径谨慎使用；
- 将通用逻辑封装为库函数（如`html`、`trimIndent`）并单元测试；
- 对安全相关的标签（HTML/SQL）要有明确的白名单/转义策略。

## 8. 容易踩坑

- 忘记处理转义/注入风险，直接把`${}`值拼到敏感上下文中；
- 使用`raw`时误以为是“未转义字符串”，实际上是“原始字面量内容”（包含`\\n`这样的序列）；
- 在运行时构建极其复杂的标签逻辑，导致难调试、难优化。

## 9. 最佳实践

- 将标签模板用于“模式化”的字符串构建（HTML、日志、i18n、格式化），统一策略；
- 对需要可读性的多行内容使用`trimIndent`一类工具；
- 安全相关标签严格单元测试，覆盖边界与攻击样例。

## 10. 练习

1. 实现一个`sql`标签：自动把`${}`参数替换为占位符并收集参数数组（仅教学，实际请用专业库）。
2. 实现一个`md`标签：将`${}`中的特殊字符转义，避免破坏 Markdown 结构。
3. 基于`Intl`实现一个格式化标签，支持`${number}`与`${Date}`的本地化显示。
