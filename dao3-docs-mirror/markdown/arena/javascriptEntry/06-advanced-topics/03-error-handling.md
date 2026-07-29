---
title: "错误处理"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/03-error-handling.html"
---

# 错误处理

在编程时，错误是不可避免的。优雅地处理错误可以防止你的程序意外崩溃，并为你提供调试所需的重要信息。在 JavaScript 中，主要使用`try...catch`语句来处理错误。

## `try...catch`语句

`try...catch`语句允许你测试一段代码块中的错误。`try`块包含可能出错的代码，而`catch`块则在`try`块中发生错误时执行。

javascript

```
try {
  // 尝试执行这段代码
  let result = riskyOperation();
  console.log(result);
} catch (error) {
  // 如果 try 块中发生错误，则执行这里的代码
  console.error("操作失败：", error.message);
}
```

### `finally`块

你还可以添加一个`finally`块。无论`try`块中是否发生错误，`finally`块中的代码都将执行。这对于清理资源非常有用。

javascript

```
let resource = openResource();
try {
  useResource(resource);
} catch (error) {
  console.error("资源使用出错：", error.message);
} finally {
  // 确保资源总是被关闭
  closeResource(resource);
}
```

## `throw`语句

你可以使用`throw`语句来创建自定义错误。这在你希望在特定条件下中断程序执行时非常有用。

javascript

```
function divide(a, b) {
  if (b === 0) {
    throw new Error("除数不能为零！");
  }
  return a / b;
}

try {
  let result = divide(10, 0);
  console.log(result);
} catch (error) {
  console.error(error.message); // 输出: 除数不能为零！
}
```

通过有效地使用`try...catch`和`throw`，你可以编写出更健壮、更可靠的代码。
