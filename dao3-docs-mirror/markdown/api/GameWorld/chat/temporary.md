---
title: "临时频道"
source: "https://docs.dao3.fun/api/GameWorld/chat/temporary.html"
---

# 临时频道

## 方法

#### createTempChat(chatId:string[]): Promise‹string›

创建临时聊天频道

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| chatId | *否* |  | string[] | 创建临时频道时同时加入频道的玩家userId数组 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹string› | 创建临时频道后的频道id |

点击查看示例代码

javascript

```
world.createTempChat().then(chatId => {
  console.log(`创建临时频道成功，频道id是${chatId}`)
})
```

---

#### destroyTempChat(chatId:string[]): Promise‹string[]›

批量销毁临时聊天频道

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| chatId | *是* |  | string[] | 需要销毁的临时频道id数组 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹string[]› | 删除失败的临时频道id数组 |

点击查看示例代码

javascript

```
world.destroyTempChat(['chatId1','chatId2']).then(failedChatIds => {
 if(!failedChatIds.length){
   console.log(`聊天室销毁成功`)
 }else{
   console.log(`以下聊天室销毁失败：${failedChatIds.join(',')}`)
 }
})
```

---

#### addTempChatPlayer(chatId:string,player:string[]): Promise‹string[]›

向临时聊天频道添加玩家

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| chatId | *是* |  | string | 临时聊天频道id |
| player | *是* |  | string[] | 加入聊天频道的玩家userId数组 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹string[]› | 添加成功的玩家id数组 |

点击查看示例代码

javascript

```
world.createTempChat().then(chatId => {
  world.addTempChatPlayer(chatId, ['userId1','userId2']).then(userIds => {
    console.log(`以下玩家id添加聊天频道成功${userIds.join(',')}`)
  })
})
```

---

#### removeTempChatPlayer(chatId:string,player:string[]): Promise‹string[]›

向临时聊天频道移除玩家

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| chatId | *是* |  | string | 临时聊天频道id |
| player | *是* |  | string[] | 需要在聊天频道中移除的玩家userId数组 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹string[]› | 移除成功的玩家id数组 |

点击查看示例代码

javascript

```
world.createTempChat(['userId1','userId2']).then(chatId => {
  world.removeTempChatPlayer(chatId, ['userId1']).then(userIds => {
    console.log(`以下玩家id在频道中被移除${userIds.join(',')}`)
  })
})
```

---

#### getTempChats(): Promise‹string[]›

获取当前地图存在的临时聊天频道

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹string[]› | 当前地图存在的临时聊天频道id数组 |

点击查看示例代码

javascript

```
world.getTempChats().then(chatIds => {
   console.log(`当前有以下临时聊天频道${chatIds.join(',')}`)
})
```

---

#### getTempChatUsers(chatId:string): Promise‹string[]›

获取临时聊天频道中的玩家

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| chatId | *是* |  | string | 临时聊天频道id |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹string[]› | 在临时聊天频道中的玩家id数组 |

点击查看示例代码

javascript

```
world.getTempChatUsers('chatId').then(userIds => {
  console.log(`临时聊天频道有以下玩家${userIds.join(',')}`)
})
```
