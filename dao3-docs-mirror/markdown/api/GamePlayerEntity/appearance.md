---
title: "外观"
source: "https://docs.dao3.fun/api/GamePlayerEntity/appearance.html"
---

# 外观

## 属性

#### color: GameRGBColor

> 默认值：GameRGBColor(1, 1, 1)

玩家的颜色。

#### emissive: number

> 默认值：0

玩家的发光度。

#### invisible: boolean

> 默认值：false

玩家是否隐身。

#### showName: boolean

> 默认值：true

玩家名字是否显示。

#### showIndicator: boolean

> 默认值：false

玩家标记否显示。

#### scale: number

> 默认值：1

玩家的缩放比例。

#### metalness: number

> 默认值：0

玩家的金属感。

#### shininess: number

> 默认值：0

玩家的反光度。

#### skin:[GameSkin](./appearance.md#GameSkin)

此玩家的皮肤配置，用于管理当前玩家皮肤的展示。通过此处修改皮肤不会影响皮肤的隐藏状态，设置前是隐藏的，设置后也还是隐藏着。

当皮肤名称不存在于项目皮肤库或不符合类型定义时，无事发生，并会在控制台打印警告。

点击查看示例代码

javascript

```
world.onPlayerJoin(({ entity }) => {
  // 设置玩家头部使用一个叫 Example 的皮肤套装
  entity.player.skin.head = "Example";
  // 设置玩家躯干使用一个叫 Example2 的皮肤套装
  entity.player.skin.torso = "Example2";
  // 不小心把head又设置了一个项目中没有的皮肤套装名 WrongSkin
  entity.player.skin.head = "WrongSkin"; // 这里会在控制台打印警告，且不会产生任何效果
  // 将头部展示为玩家自己的皮肤。
  entity.player.skin.head = undefined;
});
```

#### skinInvisible:[GameSkinInvisible](./appearance.md#GameSkinInvisible)

是否隐藏玩家模型部件。

点击查看示例代码

javascript

```
world.onPlayerJoin(({ entity }) => {
  // 隐藏玩家的头部
  entity.player.skinInvisible.head = true;
  // 隐藏玩家的躯干
  entity.player.skinInvisible.torso = true;
});
```

## 方法

#### setSkinByName(skinName: string): void

将指定皮肤套装应用到此玩家上。此方法不会影响皮肤的隐藏状态，设置前是隐藏的，设置后也还是隐藏着。

当皮肤名称不存在于项目皮肤库或不为字符串时，无事发生，并在控制台打印警告。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| skinName | 是 |  | string | 指定要设置的皮肤名称，将玩家皮肤整体替换为对应的皮肤。 |

#### resetToDefaultSkin(): void

重置此玩家的皮肤配置为默认皮肤配置，效果同`setSkinByName`传入了默认皮肤套装名称。

#### clearSkin(): void

清除地图对此玩家应用的皮肤配置，将此玩家的皮肤配置为仅展示玩家自己的皮肤。

#### addWearable(config:Partial‹[GameWearable](./appearance.md#GameWearable)›):[GameWearable](./appearance.md#GameWearable)

在玩家某身体部位附上穿戴配件物体

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| config | 是 |  | Partial‹GameWearable› | 指定要设置的皮肤名称，将玩家皮肤整体替换为对应的皮肤。 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameWearable | 穿戴部件的位置 |

点击查看示例代码

javascript

```
world.onPlayerJoin(({ entity }) => {
  entity.player.addWearable({
    bodyPart: GameBodyPart.TORSO,
    mesh: "mesh/黄色书包.vb",
    orientation: new GameQuaternion(0, 1, 0, 0).rotateY(Math.PI / 2),
    scale: new GameVector3(0.5, 0.5, 0.5),
    offset: new GameVector3(0, 0, -0.45),
  });
});
```

#### removeWearable(config:[GameWearable](./appearance.md#GameWearable)): void

把玩家身体部位已附上的穿戴配件物体删除

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| config | 是 |  | GameWearable | 穿戴部件的位置 |

点击查看示例代码

javascript

```
// 在玩家进入液体时把穿戴配件'潜水镜'在玩家头上附带
world.onFluidEnter(({ entity }) => {
  if (!entity.isPlayer) return;
  entity.player.addWearable({
    bodyPart: GameBodyPart.HEAD,
    mesh: "mesh/潜水镜.vb",
    orientation: new GameQuaternion(0, 1, 0, 0),
    scale: new GameVector3(1, 1, 1),
    offset: new GameVector3(0, 0, 0.5),
  });
});

// 在玩家离开液体时把在玩家头上的穿戴配件删除
world.onFluidLeave(({ entity }) => {
  if (!entity.isPlayer) return;
  const headWears = entity.player.wearables(GameBodyPart.HEAD);
  // 假设只有1个装备 `headWears[0]`
  entity.player.removeWearable(headWears[0]);
});
```

#### wearables(bodyPart:[GameBodyPart](./appearance.md#GameBodyPart)):[GameWearable](./appearance.md#GameWearable)[]

列举在玩家上所有的穿戴配件物体

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| bodyPart |  |  | GameBodyPart | 穿戴部件的位置 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameWearable | 穿戴部件的位置列表 |

点击查看示例代码

javascript

```
// 在玩家上所有部位的穿戴配件
const allWearables = entity.player.wearables();

// 在玩家上头部的穿戴配件
const wearablesOnHead = entity.player.wearables(GameBodyPart.HEAD);
```

## 接口

#### GameSkin

玩家身体部位

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| hips | string \| undefined \| null | 臀部 |
| torso | string \| undefined \| null | 躯干 |
| neck | string \| undefined \| null | 颈部 |
| head | string \| undefined \| null | 头 |
| leftShoulder | string \| undefined \| null | 左肩 |
| leftUpperArm | string \| undefined \| null | 左上臂 |
| leftLowerArm | string \| undefined \| null | 左下臂 |
| leftHand | string \| undefined \| null | 左手 |
| leftUpperLeg | string \| undefined \| null | 左上腿 |
| leftLowerLeg | string \| undefined \| null | 左下腿 |
| leftFoot | string \| undefined \| null | 左脚 |
| rightShoulder | string \| undefined \| null | 右肩膀 |
| rightUpperArm | string \| undefined \| null | 右上臂 |
| rightLowerArm | string \| undefined \| null | 右下臂 |
| rightHand | string \| undefined \| null | 右手 |
| rightUpperLeg | string \| undefined \| null | 右上腿 |
| rightLowerLeg | string \| undefined \| null | 右下腿 |
| rightFoot | string \| undefined \| null | 右脚 |

#### GameSkinInvisible

玩家身体部位

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| hips | boolean | 臀部 |
| torso | boolean | 躯干 |
| neck | boolean | 颈部 |
| head | boolean | 头 |
| leftShoulder | boolean | 左肩 |
| leftUpperArm | boolean | 左上臂 |
| leftLowerArm | boolean | 左下臂 |
| leftHand | boolean | 左手 |
| leftUpperLeg | boolean | 左上腿 |
| leftLowerLeg | boolean | 左下腿 |
| leftFoot | boolean | 左脚 |
| rightShoulder | boolean | 右肩膀 |
| rightUpperArm | boolean | 右上臂 |
| rightLowerArm | boolean | 右下臂 |
| rightHand | boolean | 右手 |
| rightUpperLeg | boolean | 右上腿 |
| rightLowerLeg | boolean | 右下腿 |
| rightFoot | boolean | 右脚 |

#### GameWearable

用于在玩家身体部位可穿戴配件物体的参数与函数

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| bodyPart | [GameBodyPart](./appearance.md#GameBodyPart) | 穿戴配件在玩家上的部位 |
| color | GameRGBColor | 穿戴配件的颜色 |
| emissive | number | 穿戴配件的发光度 |
| mesh | string | 穿戴配件的形状数据 |
| metalness | number | 穿戴配件的金属感 |
| offset | GameVector3 | 穿戴配件的位移 |
| orientation | GameQuaternion | 穿戴配件的旋转角度 |
| player | [GamePlayerEntity](/api/GamePlayerEntity/index.md)\| null | 穿戴配件的玩家 |
| scale | GameVector3 | 穿戴配件的缩放比例 |
| shininess | number | 穿戴配件的反光度 |
| remove | ()=>void | 删除该已穿戴的配件 |

## 枚举

#### GameBodyPart

玩家身体部位的类型

| **属性** | **说明** |
| --- | --- |
| HIPS | 臀部 |
| TORSO | 躯干 |
| NECK | 颈部 |
| HEAD | 头 |
| LEFT_SHOULDER | 左肩 |
| LEFT_UPPER_ARM | 左上臂 |
| LEFT_LOWER_ARM | 左下臂 |
| LEFT_HAND | 左手 |
| LEFT_UPPER_LEG | 左上腿 |
| LEFT_LOWER_LEG | 左下腿 |
| LEFT_FOOT | 左脚 |
| RIGHT_SHOULDER | 右肩膀 |
| RIGHT_UPPER_ARM | 右上臂 |
| RIGHT_LOWER_ARM | 右下臂 |
| RIGHT_HAND | 右手 |
| RIGHT_UPPER_LEG | 右上腿 |
| RIGHT_LOWER_LEG | 右下腿 |
| RIGHT_FOOT | 右脚 |
