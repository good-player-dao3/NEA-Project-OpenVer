---
title: "操作"
source: "https://docs.dao3.fun/api/GameRTC/operate.html"
---

# 操作

## 方法

#### getMicrophonePermission(entity:[GamePlayerEntity](/api/GameEntity/isPlayer.md)): Promise‹boolean›

向该通道申请获取一个玩家的录音权限

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| entity | 是 |  | string | 玩家对象 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹boolean› | 异步返回是否成功获取到录音权限 |

---

#### add(entity:[GamePlayerEntity](/api/GameEntity/isPlayer.md)): Promise‹void›

向该通道加入一个玩家

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| entity | 是 |  | string | 玩家对象 |

---

#### remove(entity:[GamePlayerEntity](/api/GameEntity/isPlayer.md)): Promise‹void›

向该通道删除一个玩家

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| entity | 是 |  | string | 玩家对象 |

---

#### unpublish(entity:[GamePlayerEntity](/api/GameEntity/isPlayer.md)): Promise‹void›

向该通道一个玩家关闭麦克风

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| entity | 是 |  | string | 玩家对象 |

---

#### publishMicrophone(entity:[GamePlayerEntity](/api/GameEntity/isPlayer.md)): Promise‹void›

向该通道一个玩家开启麦克风

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| entity | 是 |  | string | 玩家对象 |

---

#### getPlayers(): Promise‹[GamePlayerEntity](/api/GameEntity/isPlayer.md)[]›

获取该通道目前所有的玩家

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹GamePlayerEntity[]› | 异步返回玩家对象列表 |

---

#### destroy(): Promise‹void›

删除该通道

---

#### getVolume(entity:[GamePlayerEntity](/api/GameEntity/isPlayer.md)): Promise‹number›

获取该通道一个玩家音量

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| entity | 是 |  | string | 玩家对象 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹number› | 异步返回音量大小 |

---

#### setVolume(entity:[GamePlayerEntity](/api/GameEntity/isPlayer.md),volume:number): Promise‹void›

向该通道设置一个玩家音量

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| entity | 是 |  | string | 玩家对象 |
| volume | 是 |  | number | 音量大小 |
