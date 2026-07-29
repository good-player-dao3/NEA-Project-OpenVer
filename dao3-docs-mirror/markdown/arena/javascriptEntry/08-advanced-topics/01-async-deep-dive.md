---
title: "异步编程深入：Promises 与 Async/Await"
source: "https://docs.dao3.fun/arena/javascriptEntry/08-advanced-topics/01-async-deep-dive.html"
---

# 异步编程深入：Promises 与 Async/Await

我们之前已经初步接触了异步 JavaScript。现在，我们将更深入地探讨`Promise`的高级用法和`async/await`的错误处理，这对于编写健壮的异步代码至关重要。

## Promise 链的威力

Promise 最强大的特性之一是能够将多个异步操作链接在一起，形成一个清晰、可读的流程。

javascript

```
fetch("https://api.example.com/player/1") // 第一步：获取玩家数据
  .then((response) => {
    if (!response.ok) {
      throw new Error("网络响应错误"); // 检查响应是否成功
    }
    return response.json(); // 第二步：解析 JSON
  })
  .then((playerData) => {
    console.log(`玩家名称: ${playerData.name}`);
    return fetch(`https://api.example.com/player/${playerData.id}/inventory`); // 第三步：获取玩家物品
  })
  .then((response) => response.json()) // 第四步：解析物品 JSON
  .then((inventoryData) => {
    console.log(`拥有物品数量: ${inventoryData.items.length}`);
  })
  .catch((error) => {
    // 统一处理链中任何环节的错误
    console.error("异步操作失败:", error);
  });
```

在这个例子中，`.catch()`会捕获链中任何一个`.then()`抛出的错误，使得错误处理非常集中。

## Promise 静态方法

`Promise`对象提供了一些有用的静态方法来处理多个 Promise。

### `Promise.all()`

当你有多个 Promise，并且希望在它们全部成功完成后再执行下一步时，使用`Promise.all()`。它接收一个 Promise 数组，并返回一个新的 Promise。如果所有 Promise 都成功，它会以一个包含所有结果的数组来`resolve`；如果任何一个 Promise 失败，它会立即以该失败的原因`reject`。

javascript

```
const promise1 = Promise.resolve("第一个成功");
const promise2 = new Promise((resolve) =>
  setTimeout(() => resolve("第二个成功"), 100)
);
const promise3 = fetch("https://api.example.com/data");

Promise.all([promise1, promise2, promise3])
  .then((values) => {
    console.log(values); // ['第一个成功', '第二个成功', Response_object]
  })
  .catch((error) => {
    console.error("至少一个 Promise 失败了:", error);
  });
```

### `Promise.race()`

`Promise.race()`也接收一个 Promise 数组，但只要其中任何一个 Promise 成功或失败，它就会立即以那个 Promise 的结果`resolve`或`reject`。

javascript

```
const promiseA = new Promise((resolve) =>
  setTimeout(() => resolve("A 胜出"), 100)
);
const promiseB = new Promise((resolve, reject) =>
  setTimeout(() => reject("B 失败"), 200)
);

Promise.race([promiseA, promiseB])
  .then((winner) => console.log(winner)) // 输出: A 胜出
  .catch((error) => console.error(error));
```

## Async/Await 的错误处理

`async/await`让异步代码看起来像同步代码，但正确的错误处理同样重要。你需要使用经典的`try...catch`块。

javascript

```
async function fetchPlayerAndInventory(playerId) {
  try {
    const playerResponse = await http.fetch(
      `https://api.example.com/player/${playerId}`
    );
    if (!playerResponse.ok) throw new Error("获取玩家失败");
    const playerData = await playerResponse.json();

    const inventoryResponse = await http.fetch(
      `https://api.example.com/player/${playerId}/inventory`
    );
    if (!inventoryResponse.ok) throw new Error("获取物品失败");
    const inventoryData = await inventoryResponse.json();

    console.log(
      `玩家: ${playerData.name}, 物品数: ${inventoryData.items.length}`
    );
    return { playerData, inventoryData };
  } catch (error) {
    console.error("处理过程中发生错误:", error.message);
    // 可以选择向上抛出错误，或返回一个表示失败状态的值
    return null;
  }
}

fetchPlayerAndInventory(1);
```

使用`try...catch`可以让你在一个地方捕获所有`await`表达式可能抛出的错误，代码结构非常清晰。
