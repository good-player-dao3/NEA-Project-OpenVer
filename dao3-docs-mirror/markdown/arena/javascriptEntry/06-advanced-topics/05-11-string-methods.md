---
title: "字符串新方法补充"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-11-string-methods.html"
---

# 字符串新方法补充

常用现代字符串方法：

javascript

```
"Hello".startsWith("He"); // true
"Hello".endsWith("lo"); // true
"Hello".includes("ell"); // true
"   trim   ".trim(); // 'trim'
"pad".padStart(5, "0"); // '00pad'
"pad".padEnd(5, "."); // 'pad..'
"😀".length; // 2（UTF-16 码元）
[..."😀"].length; // 1（按 codepoint）
```

场景：输入校验、格式化、国际化结合`Intl`。

## 索引与 Unicode：`at()`、码点与规范化

javascript

```
"😀".charAt(0); // '\uD83D'（代理对上半段）
"😀".at(0); // '😀'（支持负索引与 codepoint）

"é".normalize("NFC"); // 合成形式
"e\u0301".normalize("NFC") === "é"; // true（建议比较前归一化）
```

建议：处理多语言文本时，比较与切片前进行`normalize`。

## 全局替换与批量匹配：`replaceAll`与`matchAll`

javascript

```
"a-a-a".replaceAll("a", "b"); // 'b-b-b'

for (const m of "x1 y2 z3".matchAll(/(\w)(\d)/g)) {
  console.log(m[0], "at", m.index);
}
```

## 模板字面量注意事项

模板字符串便于插值，但请避免直接拼接不可信内容到 HTML 中，需配合转义或使用安全模板函数（见“Tagged Templates”章节）。

## 补全与裁剪：`padStart/End`、`trimStart/End`

javascript

```
"7".padStart(3, "0"); // '007'
"note  ".trimEnd(); // 'note'
```

## 切片：`slice`与`substring`

javascript

```
"abcdef".slice(1, 4); // 'bcd'
"abcdef".substring(4, 1); // 'bcd'（会自动交换参数）
```

通常优先`slice`，行为更直观；配合`at()`处理 Unicode 码点。

## 常见陷阱

- `length`统计的是 UTF-16 码元，非代码点数量；
- `replace`默认只替换第一个匹配；
- 直接拼接不可信输入到 HTML/URL 可能引发安全问题，使用转义与`URL`/`URLSearchParams`。

## 最佳实践

- 面向用户文本的比较与截断请考虑`normalize`与`Intl.Segmenter`；
- 批量匹配优先`matchAll`；全局替换使用`replaceAll`；
- URL 构造用`new URL()`与`URLSearchParams`，避免手写拼接。

## 练习

1. 将一段“手机号掩码”实现为`replace`与`replaceAll`两种方式，比较可读性；
2. 用`matchAll`解析`key=value`列表并生成对象；
3. 写一个函数按代码点安全地截断文本并在末尾添加省略号。
