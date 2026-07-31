---
title: "循环"
source: "https://docs.dao3.fun/arena/javascriptEntry/03-control-flow/02-loops.html"
---

# 循环

循环用于重复执行一段代码，直到满足特定条件为止。这在处理重复性任务时非常有用。

## `for`循环

`for`循环在你知道需要执行多少次循环时非常有用。它由三个部分组成：初始化、条件和增量。

javascript

```
// 这个循环会从 0 打印到 4
for (let i = 0; i < 5; i++) {
  console.log(i);
}
```

### `for`循环的三个部分

1. **初始化**(`let i = 0`)：在循环开始前执行一次。通常用于声明和初始化循环变量。
2. **条件**(`i < 5`)：在每次循环开始前进行评估。如果条件为`true`，则执行循环体。如果为`false`，则循环终止。
3. **增量**(`i++`)：在每次循环结束后执行。通常用于更新循环变量。

## `while`循环

`while`循环在指定条件为`true`时重复执行代码块。当你不知道需要执行多少次循环时，`while`循环非常有用。

javascript

```
let count = 0;

while (count < 5) {
  console.log(count);
  count++;
}
```

### 注意事项

在使用`while`循环时，请确保循环体内部有代码可以改变条件，否则可能会导致无限循环，从而使你的程序崩溃。

## `break`和`continue`

### `break`

`break`语句用于立即跳出循环。

javascript

```
for (let i = 0; i < 10; i++) {
  if (i === 5) {
    break; // 当 i 等于 5 时，跳出循环
  }
  console.log(i);
}
// 输出: 0, 1, 2, 3, 4
```

### `continue`

`continue`语句用于跳过当前循环的剩余部分，并开始下一次循环。

javascript

```
for (let i = 0; i < 5; i++) {
  if (i === 2) {
    continue; // 当 i 等于 2 时，跳过本次循环
  }
  console.log(i);
}
// 输出: 0, 1, 3, 4
```
