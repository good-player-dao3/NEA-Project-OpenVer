---
title: "销毁与生命值"
source: "https://docs.dao3.fun/api/GameEntity/fight.html"
---

# 销毁与生命值

## 属性

#### destroyed: boolean

> 默认值：false

如果为真(true)，实体就被销毁。

---

#### enableDamage: boolean

> 默认值：false

如果为真true，则可对实体进行伤害。

---

#### showHealthBar: boolean

> 默认值：true

如果为真true，则显示实体的生命值HP。

---

#### hp: number

> 默认值：100

实体的当前生命值hp。

---

#### maxHp: number

> 默认值：100

实体的最大生命值hp。

## 方法

#### destroy(): void

销毁实体

---

#### hurt(amount:number,options?:Partial<[GameHurtOptions](./fight.md#GameHurtOptions)>): void

对实体的伤害数值。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| amount | 是 |  | number | 伤害值 |
| options |  |  | Partial‹GameHurtOptions› | 伤害的相关配置 |

---

#### 事件onDestroy(handler:(event:[GameEntityEvent](/api/GameWorld/playerJL.md#GameEntityEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当实体被销毁时触发

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到实体被销毁时的处理函数 |

---

#### 事件onTakeDamage(handler:(event:[GameDamageEvent](./fight.md#GameDamageEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

实体受到伤害时触发的事件

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到实体受到伤害时的处理函数 |

---

#### 事件onDie(handler:(event:[GameDieEvent](./fight.md#GameDieEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

实体死亡时触发的事件

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到实体死亡时的处理函数 |

## 接口

#### GameHurtOptions

攻击/伤害的相关参数

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| attacker | [GameEntity](/api/GameEntity/index.md) | 发出攻击的实体 |
| damageType | string | 伤害类型，可自行定义 |

---

#### GameDamageEvent

当实体收到伤害时触发的事件

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| entity | [GameEntity](/api/GameEntity/index.md) | 受到伤害的实体 |
| damage | number | 伤害值的大小 |
| attacker | [GameEntity](/api/GameEntity/index.md)\| null | 攻击者 |
| damageType | string | 伤害的类型 |
| tick | number | 事件发生的时间 |

---

#### GameDieEvent

当实体死亡时触发的事件

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| entity | [GameEntity](/api/GameEntity/index.md) | 死亡的实体 |
| attacker | [GameEntity](/api/GameEntity/index.md)\| null | 击杀者 |
| damageType | string | 伤害的类型 |
| tick | number | 事件发生的时间 |
