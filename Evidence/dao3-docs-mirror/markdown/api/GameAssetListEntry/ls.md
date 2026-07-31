---
title: "获取游戏资产树"
source: "https://docs.dao3.fun/api/GameAssetListEntry/ls.html"
---

# 获取游戏资产树

## 方法

#### ls(path?:'snow' | 'mesh' |'picture' | 'audio' | 'lut'):[GameAssetListEntry](./ls.md#GameAssetListEntry)[]

获取地图中的资产树

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| path |  |  | 'snow' \| 'mesh' \| 'picture' \| 'audio' \| 'lut' | 文件夹名称，如果输入该值，会获取该文件夹下的全部文件。 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameAssetListEntry[] | 资产列表，包含文件类型和路径 |

## 接口

#### GameAssetListEntry

资产列表

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| path | string | 资产的完全限定路径，按目录拆分 |
| type | [GameAssetType](./ls.md#GameAssetType) | 资产类型 |

## 枚举

#### GameAssetType

资产类型

| **属性** | **说明** |
| --- | --- |
| VOXEL_MESH | 模型 |
| DIRECTORY | 文件夹 |
| COLOR_LUT | 颜色滤镜 |
| JS_SCRIPT | 脚本 |
| IMAGE | 图片 |
| PARTICLE_TEXTURE | 雪花纹理 |
| SOUND | 音频 |
| PICTURE | 图片 |
