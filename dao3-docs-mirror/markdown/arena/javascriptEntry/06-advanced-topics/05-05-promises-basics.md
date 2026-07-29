---
title: "Promise 基础"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-05-promises-basics.html"
---

# Promise 基础

Promise 是“未来的值”的占位符，描述异步结果。

## 基本用法

javascript

```
function loadConfig() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve({ ok: true }), 100);
  });
}

loadConfig()
  .then((cfg) => console.log("loaded:", cfg))
  .catch((err) => console.error(err))
  .finally(() => console.log("done"));
```

## 与 async/await

javascript

```
async function main() {
  try {
    const cfg = await loadConfig();
    console.log(cfg);
  } catch (e) {
    console.error(e);
  }
}

main();
```

## 核心概念：状态与决议

- 三种状态：pending（进行中）、fulfilled（已完成）、rejected（已拒绝）。
- 状态一旦从 pending 变为 fulfilled 或 rejected，就不可再改变。
- `then(onFulfilled, onRejected)`会返回一个新的 Promise，支持链式调用。

javascript

```
fetch("/api/user")
  .then((res) => res.json()) // 返回值会被包装为 Promise.resolve
  .then((data) => data.profile)
  .catch((err) => {
    // 捕获链上任何一个环节的错误
    console.error("error", err);
    throw err; // 再次抛出可被后续 catch 捕获
  })
  .finally(() => console.log("always"));
```

## 错误处理模式

1. 链尾统一`catch`

javascript

```
doTask().then(step1).then(step2).catch(handleError);
```

1. 分段捕获并恢复

javascript

```
doTask()
  .then(step1)
  .catch((e) => fallback1()) // 恢复并继续
  .then(step2)
  .catch((e) => fallback2());
```

1. async/await 中使用 try/catch

javascript

```
async function run() {
  try {
    const a = await step1();
    const b = await step2(a);
    return b;
  } catch (e) {
    log(e);
    return defaultValue;
  }
}
```

## 常用工具方法

javascript

```
// Promise.all: 全部成功才成功，有一个失败则失败
const [u, p] = await Promise.all([fetch("/user"), fetch("/profile")]);

// Promise.race: 谁先决议用谁的结果
const fastest = await Promise.race([fetch("/a"), fetch("/b")]);

// Promise.allSettled: 收集所有结果（成功/失败），用于聚合报告
const results = await Promise.allSettled([fetch("/a"), fetch("/b")]);

// Promise.any: 任意一个成功就成功（全部失败才失败）
const firstOk = await Promise.any([
  fetch("/mirror1"),
  fetch("/mirror2"),
  fetch("/mirror3"),
]);
```

## 常见陷阱与反模式

- 忘记 return：在`then`里不`return`会导致链中断或拿到`undefined`。
- Promise 包裹过度：已有 Promise 的 API 无需再`new Promise`一层。
- 并发与串行误用：

javascript

```
// 串行（一步一步等待）
for (const url of urls) {
  const res = await http.fetch(url);
}

// 并发（一起发出请求，再汇总）
const resps = await Promise.all(urls.map((url) => fetch(url)));
```

- 未取消的请求：使用`AbortController`支持取消（现代 fetch）。

## 最佳实践

- 统一错误处理与日志；
- 能并发就并发，减少整体等待时间；
- 封装超时与重试策略（见 Fetch 章节或自行封装）；
- 在边界处将回调风格封装成 Promise（promisify），保持风格统一。

## 练习

1. 用`Promise.all`将多个请求并发，并在任何一个失败时输出失败原因。
2. 用`Promise.race`实现请求超时：请求与`setTimeout`的 Promise 竞速。
3. 将一个回调风格的 API（如`setTimeout`）封装为 Promise 并编写使用示例。
