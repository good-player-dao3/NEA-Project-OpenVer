---
title: "外观"
source: "https://docs.dao3.fun/api/GameEntity/appearance.html"
---

# 外观

## 属性

#### mesh: string

实体形状数据(mesh)的 hash。如果设为空字符串/''，则实体无 mesh。 除非实体为玩家，否则设定实体

只有提前在场景中放置模型，才能获得模型的 Mesh 属性。

模型被放置后，会自动保存在文件列表中。模型文件对应的**'mesh/*.vb'**名称便是 mesh 属性。

点击查看示例代码

javascript

```
/* 玩家进入游戏时，变成一颗星星。5秒后恢复。 */
world.onPlayerJoin(async ({ entity }) => {
  const originPlayerMesh = entity.mesh; // 需要先在场景摆放一个名字为 星星 的模型
  entity.mesh = world.querySelector("#星星").mesh;
  entity.meshScale = new GameVector3(1 / 24, 1 / 24, 1 / 24);
  entity.meshOrientation = new GameQuaternion(0, 1, 0, 0);
  entity.player.invisible = true;
  await sleep(5000);
  entity.mesh = originPlayerMesh;
  entity.player.invisible = false;
});
```

#### position:[GameVector3](/api/GameVector3/index.md)

实体的位置。

点击查看示例代码

javascript

```
//随机摆放所有东西的位置
world.querySelectorAll('*').forEach((e) => {
  e.position.set(new GameVector3(
    Math.random()*10,
    10+Math.random()*10,
    Math.random()*10);
}));
```

#### anchorOffset:[GameVector3](/api/GameVector3/index.md)

实体几何中心与锚点的偏移量

#### meshOrientation:[GameQuaternion](/api/GameQuaternion/index.md)

实体的旋转角度。

#### meshScale:[GameVector3](/api/GameVector3/index.md)

实体的缩放比例。

#### meshColor:[GameRGBAColor](/api/GameRGBAColor/index.md)

实体的颜色。

#### meshInvisible: boolean

> 默认值：false

可控制实体隐形，当值设为 true 时，则实体隐形。

#### meshEmissive: number

> 默认值：0

实体的发光度。

#### meshMetalness: number

> 默认值：0

实体的金属感。

#### meshShininess: number

> 默认值：0

范围：0-1

实体的反光度，设为 1 则为非常光滑。

#### meshOffset:[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(0, 0, 0)

实体的位移。

#### showEntityName: boolean

> 默认值：false

如果为真，则展示实体的默认名称。

如果通过`customName`自定义了需要展示的名称，则展示`customName`。

#### customName: string

> 默认值：''

允许自定义需要展示的名称，默认为空。

#### nameRadius: number

> 默认值：16

名称展示范围，数值越小，则需要靠近实体才会出现名称。

#### nameColor:[GameRGBColor](/api/GameRGBColor/index.md)

> 默认值：new GameRGBColor(1, 1, 1)

进入实体名称展示范围时，实体名称的颜色。

点击查看示例代码

展示实体名称之前，在场景中必须先有一个实体。

在模型列表中，挑选一个你喜欢的模型，将它放置在场景中，并记住模型的名字。

javascript

```
// 先在场景中放置一个名称为 NPC 的实体。
const npc = world.querySelector("#NPC");
npc.showEntityName = true; // 允许展示实体名称
npc.nameRadius = 16; // 实体名称的展示范围
npc.nameColor = new GameRGBColor(1, 0, 1); // 互动提示的文字颜色
// 此时没有通过 customName 自定义展示的名称，customName 为空字符串
// 因此展示的实体名称为实体的默认名称 —— “NPC”

// 如果通过 customName 指定自定义的名称， 则会展示 customName
npc.customName = "Miss Miao"; // 显示自定义的名称
```

## 方法

#### lookAt(targetPosition:[GameVector3](/api/GameVector3/index.md),meshFacing?:"X" | "Y" | "Z",up?:[GameVector3](/api/GameVector3/index.md)): void

将实体旋转至面向指定位置的方向。

通过此方法进行的旋转会瞬时发生，仅影响实体的朝向，不会影响实体的运动状态。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| targetPosition | 是 |  | GameVector3 | 世界坐标，希望让实体朝向的位置 |
| meshFacing |  | Z | "X" \| "Y" \| "Z" | 定义模型在未旋转状态下的参考方向，处理模型设计时未朝向 Z 轴时的情况： - 当取 X、Z 时，定义模型的正方向分别为 X、Z 轴正方向，上方向为 Y 轴正方向 - 当取 Y 时，定义模型的正方向为 Y 轴正方向，上方向为 Z 轴正方向 - 默认值为 Z，即模型设计时朝向 Z 轴正方向 |
| up |  |  | GameVector3 | 上向量，默认取 Y 轴正方向 |

#### rotateLocal(localPosition:[GameVector3](/api/GameVector3/index.md),axis:"X" | "Y" | "Z",rad:number): void

围绕模型自身坐标系下的某个点进行旋转

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| localPosition | 是 |  | GameVector3 | 自身坐标系中的位置向量，表示待旋转的点 |
| axis | 是 | Z | "X" \| "Y" \| "Z" | 指定旋转轴 |
| rad | 是 |  | number | 旋转的角度，以弧度为单位 |

#### scaleLocal(localPosition:[GameVector3](/api/GameVector3/index.md),v:[GameVector3](/api/GameVector3/index.md)): void

参照模型自身坐标系下的某个点进行缩放

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| localPosition | 是 |  | GameVector3 | 自身坐标系中的位置向量，表示待缩放的点 |
| v | 是 |  | GameVector3 | 缩放向量，表示在 x、y、z 轴上的缩放因子 |

点击查看示例代码

javascript

```
const modelScale = world.querySelector("#New-model-s");
const modelRotation = world.querySelector("#New-model-r");

if (modelScale) {
  modelScale.showEntityName = true;
  modelScale.enableInteract = true;
  modelScale.onInteract(() => {
    // 以外观框中心为原点进行缩放
    modelScale.scaleLocal(
      modelScale.anchorOffset.scale(-1),
      new GameVector3(0.2, 0.1, 0.3)
    );
  });
}

if (modelRotation) {
  modelRotation.showEntityName = true;
  modelRotation.enableInteract = true;
  modelRotation.onInteract(() => {
    // 以外观框中心为原点进行旋转
    modelRotation.rotateLocal(
      modelRotation.anchorOffset.scale(-1),
      "X",
      (30 * Math.PI) / 180
    );
  });
}
```
