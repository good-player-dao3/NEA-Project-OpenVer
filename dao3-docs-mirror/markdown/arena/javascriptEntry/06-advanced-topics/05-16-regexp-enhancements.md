---
title: "RegExp 增强"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-16-regexp-enhancements.html"
---

# RegExp 增强

现代正则新增多种能力：

javascript

```
// u 标志，按 Unicode 处理
/^.$/u.test("😀"); // true（无 u 时为 false）

// 命名捕获组
const re = /(?<name>\w+)-(?<id>\d+)/;
const m = "user-42".match(re);
console.log(m.groups.name, m.groups.id); // 'user' '42'

// 先行/后行断言
/(?<=#)\w+/.exec("tag:#news")[0]; // 'news'
```

配合`String.prototype.matchAll`等方法更方便处理。

## 标志（flags）与作用

- `u`：Unicode 模式，正确处理代码点（如 emoji）。
- `s`：dotAll，`.`可以匹配换行符。
- `y`：sticky 模式，从`lastIndex`开始必须紧贴匹配。
- `d`：match indices，返回匹配下标（需引擎支持）。

javascript

```
/.+/s.test("a\n b"); // true（无 s 时 . 不匹配换行）

const re = /\w+/y; // sticky
re.lastIndex = 3;
console.log(re.exec("..abc def")); // 从索引3开始粘性匹配 -> ['abc']
```

## 命名捕获组与反向引用

javascript

```
const re = /(?<user>\w+)-(?<id>\d+)/;
const m = "alice-007".match(re);
console.log(m.groups.user, m.groups.id);

// 替换时使用命名反向引用
"alice-007".replace(re, "$<id>:$<user>"); // '007:alice'
```

## 前瞻/后顾断言（lookahead/lookbehind）

javascript

```
// 正先行断言：后面必须是 px
/\d+(?=px)/.exec("16px")[0]; // '16'

// 负先行断言：后面不能是 %
/\d+(?!%)/.exec("50% em")[0]; // '50'（匹配第一个 50 前提后面不是%）

// 正后行断言：前面必须是 #
/(?<=#)\w+/.exec("tag:#news")[0]; // 'news'

// 负后行断言：前面不能是 -
/(?<!-)\d+/.exec("id-42 num43")[0]; // '43'
```

## Unicode 属性类（\p{...}）

javascript

```
// 匹配所有字母字符（含非拉丁）
/\p{L}+/u.test("漢字abc"); // true

// 仅匹配数字字符
/^\p{N}+$/u.test("١٢٣"); // true（阿拉伯数字）
```

## Match Indices（d 标志）与 matchAll

javascript

```
const re = /(ab)/d;
const m = re.exec("xxabyy");
console.log(m.indices); // [[2,4],[2,4]]（需环境支持）

for (const m of "a1 b2 c3".matchAll(/(\w)(\d)/g)) {
  console.log(m[0], "at", m.index);
}
```

## 常见陷阱

- 忘记`u`导致 Unicode 处理异常（特别是 emoji、合成字符）。
- 滥用回溯导致性能问题（灾难性回溯）；
- 使用`g`标志时要注意`lastIndex`的副作用（反复`test`）。

## 最佳实践

- 优先使用命名捕获组提升可读性；
- 避免复杂且可能回溯爆炸的正则，必要时分步处理；
- 对 Unicode 文本启用`u`标志；
- 在需要位置索引时使用`d`或`matchAll`（视兼容性）。

## 练习

1. 写一个正则提取 CSS 长度值：支持`px/%/em/rem`并返回数值与单位（命名捕获组）。
2. 写一个带负先行断言的正则，匹配不以`#`开头的标签单词。
3. 用`matchAll`遍历`key=value`对，构建对象结果。
