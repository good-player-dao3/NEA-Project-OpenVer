---
title: "增强的对象字面量"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-03-enhanced-object-literals.html"
---

# 增强的对象字面量

ES6 增强了对象字面量：属性名简写、方法简写、计算属性名。

javascript

```
const x = 10, y = 20;
const key = 'score';

const player = {
  x, // 属性名简写，相当于 x: x
  y,
  move(dx, dy) { // 方法简写
    this.x += dx; this.y += dy;
  },
  [key]: 1500 // 计算属性名
};
```

优势：

- 更少样板代码；
- 更清晰的对象结构定义；
- 结合解构、展开语法构建数据更顺畅。
