---
title: "基础信息"
source: "https://docs.dao3.fun/api/GamePlayerEntity/info.html"
---

# 基础信息

## 属性

#### 只读name: string

玩家的昵称。

点击查看示例代码

javascript

```
// 在所有玩家中，通过玩家名称筛选出某一位玩家
const myPlayer = world
  .querySelectorAll("player")
  .filter((e) => e.player.name === "吉吉喵")[0];
```

---

javascript

```
// 如果'吉吉喵'和'魔术喵'加入游戏，会被缩小到0.25倍。其他玩家不受影响
const TEST_PLAYER = ["吉吉喵", "魔术喵"];

world.onPlayerJoin(({ entity }) => {
  if (!TEST_PLAYER.includes(entity.player.name)) return;
  entity.player.scale = 0.25;
});
```

#### 只读userId: string

玩家的用户 ID，个人中心昵称下方可见。

#### 只读boxId: string

玩家的 Box ID(3-15 字符)。

信息

该属性已不推荐使用，建议使用`entity.player.userId`获取玩家 ID。

#### 只读userKey: string

玩家的唯一识别码(16 字符)，可以用于存储玩家信息到数据库，无法控制更改。

信息

该属性已不推荐使用，建议使用`entity.player.userId`获取玩家 ID。

#### 只读avatar: string

玩家的头像 url 直链。

#### movementBounds:[GameBounds3](/api/GameBounds3/index.md)

> 默认值：new GameBounds3(new GameVector3(-50, -50, -50), new GameVector3(178, 178, 178))

玩家的活动范围限制，如超出此范围，则传回出生点

#### url:[URL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL)

获取该玩家进入地图时所用的 URL 链接地址, 主要用于获取 URL 参数, 以便区别对待进来的玩家

## 方法

#### querySocial(socialType:[SocialType](./info.md#SocialType)): Promise<number[]>

查询当前玩家的社交关系，并返回具体的玩家 ID 列表

- 关注 ID 列表
- 粉丝 ID 列表
- 好友 ID 列表

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| socialType | 是 |  | SocialType | 查询的方式 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹number[]› | 异步返回玩家 ID 列表 |

#### querySocialStatistic(): Promise‹[SocialStatisticType](./info.md#SocialStatisticType)›

查询当前玩家的社交统计信息，并返回具体的统计数

- 关注人数
- 粉丝人数
- 好友人数

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹SocialStatisticType› | 异步返回数据统计信息 |

#### openUserProfileDialog(userId:number): void

对当前玩家，调起指定 ID 玩家的个人主页。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| userId | 是 |  | number | 玩家的用户 ID |

## 接口

#### SocialStatisticType

社交统计信息的类型

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| followingNum | number | 关注人数 |
| followerNum | number | 粉丝人数 |
| friendsNum | number | 好友人数 |

## 枚举

#### SocialType

玩家的社交关系类型

| **属性** | **说明** |
| --- | --- |
| FOLLOWING | 关注 |
| FOLLOWERS | 粉丝 |
| FRIENDS | 好友 |
