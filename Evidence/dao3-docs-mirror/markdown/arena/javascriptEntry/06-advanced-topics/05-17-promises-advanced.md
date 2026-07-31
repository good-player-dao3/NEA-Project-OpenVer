---
title: "Promise 进阶"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-17-promises-advanced.html"
---

# Promise 进阶

并发控制、聚合与取消：

javascript

```
// 聚合
Promise.allSettled([fetch("/a"), fetch("/b")]).then((results) => {
  // 每项都有 status 与 value/reason
});

// 竞速
Promise.any([fetch("/mirror1"), fetch("/mirror2")]).then((first) =>
  console.log("first ok")
);

// 取消
const ac = new AbortController();
fetch("/data", { signal: ac.signal });
ac.abort(); // 取消请求
```

也可实现简单的并发池、重试等策略。

## 并发控制：并发池（Pool）

在网络或 I/O 密集任务中，合理限制并发度能避免拥塞、提升稳定性。

javascript

```
async function pool(tasks, limit = 4) {
  const results = new Array(tasks.length);
  let i = 0;
  const workers = new Array(Math.min(limit, tasks.length))
    .fill(0)
    .map(async () => {
      while (i < tasks.length) {
        const cur = i++;
        try {
          results[cur] = await tasks[cur]();
        } catch (e) {
          results[cur] = Promise.reject(e);
        }
      }
    });
  await Promise.all(workers);
  return results;
}

// 用法：
const urls = ["/a", "/b", "/c", "/d", "/e"];
pool(
  urls.map((u) => () => fetch(u).then((r) => r.text())),
  3
)
  .then(console.log)
  .catch(console.error);
```

## 取消与超时

使用`AbortController`统一管理取消：

javascript

```
function fetchWithTimeout(
  url,
  { timeout = 5000, signal: extSignal, ...opts } = {}
) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(new Error("timeout")), timeout);
  const signals = [ac.signal];
  if (extSignal)
    extSignal.addEventListener("abort", () => ac.abort(extSignal.reason));
  return fetch(url, { ...opts, signal: ac.signal }).finally(() =>
    clearTimeout(timer)
  );
}
```

结合`Promise.race`实现通用超时：

javascript

```
function withTimeout(p, ms) {
  return Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}
```

## 重试、退避与抖动（Retry/Backoff/Jitter）

javascript

```
async function retry(fn, { times = 3, base = 300, jitter = true } = {}) {
  let attempt = 0,
    lastErr;
  while (attempt < times) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const backoff = base * 2 ** attempt;
      const wait = jitter ? Math.random() * backoff : backoff;
      await new Promise((r) => setTimeout(r, wait));
      attempt++;
    }
  }
  throw lastErr;
}
```

策略：对网络暂时性错误（5xx、网络断开）重试，对 4xx（请求无效）不要重试。

## 批处理与节流：批量请求

javascript

```
function batch(items, size = 10) {
  const res = [];
  for (let i = 0; i < items.length; i += size)
    res.push(items.slice(i, i + size));
  return res;
}

for (const group of batch(ids, 20)) {
  const resp = await Promise.all(group.map((id) => fetch(`/api/item/${id}`)));
  // 处理 resp
}
```

## 错误分类与传递（Error Taxonomy）

统一错误形态有助于上层逻辑处理：

javascript

```
class HttpError extends Error {
  constructor(status, body) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}
class TimeoutError extends Error {
  constructor(ms) {
    super(`Timeout ${ms}ms`);
    this.ms = ms;
  }
}
class CancelError extends Error {
  constructor() {
    super("Cancelled");
    this.isCancel = true;
  }
}

async function request(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new HttpError(res.status, await res.text());
  return res.json();
}
```

对上层只抛出统一错误，便于集中处理与埋点。

## 清理与资源释放

在异步流程中，确保出现异常或取消时能完成清理：

javascript

```
async function useResource() {
  const ac = new AbortController();
  try {
    const res = await fetch("/stream", { signal: ac.signal });
    // ... 消费流
  } finally {
    ac.abort(); // 确保中止挂起的 I/O
  }
}
```

## 常见陷阱

- 过度并发导致服务器限流或本地资源耗尽；
- 无超时/取消导致悬挂请求与资源泄漏；
- 重试未做幂等或未分类错误；
- 忘记在`then`中`return`，导致链断裂；
- `Promise.any`全部失败会抛`AggregateError`，需专门捕获。

## 最佳实践

- 统一封装请求层：超时、取消、重试、错误分类在底层实现；
- 能并发就并发，但设置合理上限；
- 使用`AbortController`贯通取消；
- 对重试策略施加最大重试次数与指数退避 + 抖动；
- 记录关键点日志与指标（成功率、平均时延、错误率）。

## 练习

1. 实现一个有并发上限的下载器：输入 URL 列表，限制并发 5 并汇总结果；
2. 将某接口封装为具备超时、取消与重试（指数退避）的`getWithPolicy(url)`；
3. 写一个任务队列：按 FIFO 顺序执行任务，支持暂停/恢复与取消。
