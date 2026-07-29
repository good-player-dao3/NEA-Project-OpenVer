---
title: "S-💾 游戏资产管理"
source: "https://docs.dao3.fun/api/GameAssetListEntry/index.html"
---

# S-💾 游戏资产管理

**GameAssetListEntry**是游戏资产管理的核心接口，提供以下功能：

- 资源管理：获取和管理游戏内的模型、图片、音频等资源
- 资源类型：支持多种资源类型，包括雪花纹理、模型、图片、音频和滤镜
- 资源路径：提供完整的资源路径管理，支持按目录层级访问

你可以通过全局对象`resources`来使用这些功能。

## 类定义

typescript

```
declare const resources: GameAssetListEntry;
declare class GameAssetListEntry {
  //...
}
```

## 资源结构

游戏资产按以下结构组织：

```
ArenaMap
├─ 代码文件列表（第一层级）
├─ snow
│  └─ 雪花纹理文件列表
├─ picture
│  └─ 图片文件列表
├─ mesh
│  └─ 模型文件列表
├─ lut
│  └─ 滤镜文件列表
└─ audio
   └─ 音频文件列表
```

注意：脚本文件位于第一层级，没有父级。

## 方法

### 资源管理

- [`ls`](./ls.md#ls): 获取地图中的资产树，可按类型筛选

## 接口

- [`GameAssetListEntry`](./ls.md#GameAssetListEntry): 资产列表接口，定义了资产的基本属性

## 枚举值

- [`GameAssetType`](./ls.md#GameAssetType): 资产类型枚举，包含所有支持的资源类型
