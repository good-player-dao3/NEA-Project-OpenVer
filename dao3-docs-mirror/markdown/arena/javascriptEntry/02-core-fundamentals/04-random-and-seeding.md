---
title: "随机与可复现随机"
source: "https://docs.dao3.fun/arena/javascriptEntry/02-core-fundamentals/04-random-and-seeding.html"
---

# 随机与可复现随机

讲解`Math.random()`的局限，并给出“可复现”的伪随机生成器（PRNG），适用于重放或回放。

## 基础随机回顾

js

```
// [min, max] 随机整数
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

## 线性同余生成器（LCG）示例

js

```
function createLCG(seed = 123456789) {
  let state = seed >>> 0;
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  return () => {
    state = (a * state + c) % m;
    return state / m; // [0,1)
  };
}

const rnd = createLCG(42);
rnd(); // 可复现
```

## 基于 LCG 的区间随机

js

```
function randIntSeeded(random, min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}
```

## 推荐阅读

- MDN Math.random:[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/random](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
- LCG 介绍:[https://en.wikipedia.org/wiki/Linear_congruential_generator](https://en.wikipedia.org/wiki/Linear_congruential_generator)
