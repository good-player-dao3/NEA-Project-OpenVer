---
title: "自定义 GameEntity 和 GamePlayerEntity 类"
source: "https://docs.dao3.fun/arenapro/zh/difference/customizeEntity.html"
---

# 自定义 GameEntity 和 GamePlayerEntity 类

在 TypeScript 开发中，直接扩展或修改全局类（如`GameEntity`和`GamePlayerEntity`）可能会带来潜在的风险，特别是当这些全局类由第三方库或框架提供时。为了避免未来可能出现的命名冲突和兼容性问题，建议通过继承的方式来扩展这些类。

## 继承实现

### GameEntity 类扩展

typescript

```
// GameEntity.d.ts
declare interface GameEntity extends GameEntity {
  // 自定义属性
  customProperty: string;

  // 自定义方法
  customMethod(): void;
}
```

### GamePlayerEntity 类扩展

typescript

```
// GamePlayerEntity.d.ts
declare interface GamePlayerEntity extends GamePlayerEntity {
  // 自定义属性
  customProperty: string;

  // 自定义方法
  customMethod(): void;
}
```

## 使用示例

typescript

```
// 现在你可以安全地访问自定义属性和方法
entity.customProperty = "someValue";
entity.customMethod();
```

## 注意事项

1. 确保自定义属性和方法不会与父类或其他扩展冲突
2. 建议在单独的模块中定义扩展，避免全局污染
3. 在使用前请确保相关类型声明已正确加载
