---
title: "默认参数与参数解构"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-02-default-params.html"
---

# 默认参数与参数解构

默认参数让函数更健壮；与解构结合能让调用更灵活、可读。

## 默认参数

javascript

```
function connect(host = 'localhost', port = 8080) {
  return `${host}:${port}`;
}

console.log(connect());           // 'localhost:8080'
console.log(connect('127.0.0.1')); // '127.0.0.1:8080'
```

## 参数解构 + 默认值

javascript

```
function createEnemy({ type = 'slime', hp = 30, atk = 5 } = {}) {
  return { type, hp, atk };
}

console.log(createEnemy());            // { type: 'slime', hp: 30, atk: 5 }
console.log(createEnemy({ hp: 80 }));  // { type: 'slime', hp: 80, atk: 5 }
```

要点：

- 给整个参数对象一个默认值，以防未传参时报错。
- 仅覆盖需要的字段，其他使用默认值。
