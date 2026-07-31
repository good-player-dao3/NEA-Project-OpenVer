---
title: "副本地图传送"
source: "https://docs.dao3.fun/api/GameWorld/teleport.html"
---

# 副本地图传送

警告

**💡值得注意的是：**

使用此功能时，系统将为每次操作独立启动一个服务容器，该容器类似于一个私密的房间，对于未进入该房间的非传送玩家将不可见。

若你希望获得使用本API的权限，请前往QQ群：**478041977**，联系管理员：吉吉喵小助理，进行申请该权限。

> 普通创作者可以通过调用[entity.player.link()](https://www.yuque.com/box3lab/api/adcaxagmhfgf7ivh)方法实现传送至副图的功能，但请注意，这并非开启一个独立的房间，而是直接进行地图间的跳转。

### **方法**

#### teleport(mapId: string,players:[GameEntity](/api/GameEntity/index.md)[],serverId?: string): Promise‹[TeleportResult](./teleport.md#TeleportResult)›

地图组内传送能力，能够让玩家被传送到指定地图中。且单独开一个地图服务容器（房间），非传送玩家不可见。

如填写了`serverId`参数，则将把该批玩家传送至指定的服务容器 反之，则新建服务容器并进入。

当`serverId`为`public`时，按现有公域规则分配至公域服务器，此时返回值为公域服务器的`serverId`

**此能力受权限影响，无权限账户调用后会导致报错。**

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| mapId | 是 |  | string | 目标地图id |
| players | 是 |  | GameEntity[] | 被传送的玩家entity数组 |
| serverId |  |  | string | 自定义生成的服务器id，如填写将进入指定服务器，不填写将随机生成 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹TeleportResult› | 异步返回传送结果 |

信息

需注意：

- 传送进入的地图为独立服务器，因此同一张目标地图，分批次传送不同的人，所进入的是不同服务器。
- 只能在已发布地图中生效
- players的长度不能超过50个
- players中不能存在游客（没有UserID）

点击查看示例代码

javascript

```
while (true) {
    try {
        let players = world.querySelectorAll('player').slice(0, 50)
        players = players.filter(e => e.player.userId !== '' && e.player.userId !== '0' && e.player.userId !== 0)
        world.teleport('100001157', players)
        break
    } catch (e) {
        world.say('传送失败：' + e.stack)
    }
    await sleep(1000)
}
world.say('传送成功 ')
```

## 接口

#### TeleportResult

传送结果

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| serverId | string | 生成的服务器id |
