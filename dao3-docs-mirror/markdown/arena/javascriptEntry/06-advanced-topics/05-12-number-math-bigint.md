---
title: "Number/Math 与 BigInt"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-12-number-math-bigint.html"
---

# Number/Math 与 BigInt

## 数值增强

javascript

```
1_000_000 === 1000000; // true（数字分隔符）
Number.isNaN(NaN); // true（比 isNaN 更严格）
Number.isFinite(42); // true
```

## Math 常用

javascript

```
Math.trunc(3.9); // 3
Math.sign(-7); // -1
Math.clz32(1); // 31（前导零位数）
```

## BigInt

javascript

```
const big = 12345678901234567890n; // 以 n 结尾
console.log(big + 10n);
// BigInt 与 Number 不能混算，需显式转换
```

场景：大整数处理、ID、加密相关。

## 数字字面量与分隔符

- 二进制：`0b1010`；八进制：`0o755`；十六进制：`0xFF`；
- 数字分隔符：`1_000_000`，提升可读性但不影响数值；
- 科学计数：`1.2e3 === 1200`。

## 安全整数与精度

- JS Number 为 IEEE-754 双精度浮点，安全整数范围：`-(2^53-1) ~ 2^53-1`；
- `Number.isSafeInteger(x)`检查是否安全；
- 浮点误差：`0.1 + 0.2 !== 0.3`，需使用容差比较：

javascript

```
function nearlyEqual(a, b, eps = Number.EPSILON) {
  return Math.abs(a - b) < eps;
}
```

## 四舍五入与格式化

javascript

```
Math.round(1.5); // 2
Math.floor(-1.2); // -2
Math.ceil(-1.2); // -1

// 小数位四舍五入
function roundTo(x, n = 2) {
  const p = 10 ** n;
  return Math.round(x * p) / p;
}

(1234.567).toFixed(2); // '1234.57'（返回字符串）
```

## 随机数与可复现随机（提示）

`Math.random()`不是可复现的。若需可复现随机，请使用种子随机算法（参见“随机与可复现随机”章节）。

## BigInt 进阶

- 声明：在整数字面量结尾加`n`；
- 仅支持整数运算（加减乘除取模），无小数；
- 不能与 Number 混算：`1n + 1`会抛错；
- 显式转换：`BigInt(42)`或`Number(10n)`（注意可能溢出）。

javascript

```
const a = 2n ** 53n; // 超过 Number 安全整数
const b = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
console.log(a > b);
```

何时用 BigInt：

- 金额四则运算建议用整数分单位 + 格式化，或使用十进制库；
- 大整数 ID、计数器、加密相关、时间戳运算等。

## 常见陷阱

- 浮点误差导致比较/累加异常；
- `parseInt`/`parseFloat`与`Number()`行为差异（字符串前后空白、非数字字符）；
- BigInt 与 JSON：`JSON.stringify({ x: 1n })`会抛错（需自定义序列化）。

## 最佳实践

- 使用容差进行浮点比较；
- 金额等需要精确小数的场景使用十进制库或整数分；
- 对于超过安全范围的整数使用 BigInt；
- 用`Intl.NumberFormat`做本地化格式化（参见 Intl 章节）。

## 练习

1. 实现`roundTo(x, n)`与`nearlyEqual(a,b,eps)`并编写测试用例；
2. 用 BigInt 写一个大整数幂模计算（`powMod`）的简单实现；
3. 将一段金额运算从浮点改为“分”为单位的整数实现，并格式化输出。
