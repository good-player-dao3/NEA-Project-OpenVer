---
title: "C-🌏 游戏世界"
source: "https://docs.dao3.fun/api/ClientWorld/index.html"
---

# C-🌏 游戏世界

**ClientWorld**是管理客户端下的游戏世界的对象，它提供了以下核心功能：

- 渲染控制：管理 3D 场景的渲染状态
- 场景管理：控制客户端游戏场景的显示和更新
- 性能优化：提供客户端性能相关的配置选项

在`客户端脚本`中，可以通过全局对象`world`来使用这些功能。

## 类定义

typescript

```
declare const world: ClientWorld;

declare class ClientWorld {
  //...
}
```

## 属性列表

### 渲染控制

- [`rendering3d`](./input.md#rendering3d): 控制是否渲染 3D 场景，可用于优化性能或实现特殊的渲染效果
