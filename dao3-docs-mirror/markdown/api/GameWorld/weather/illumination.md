---
title: "天气-光照"
source: "https://docs.dao3.fun/api/GameWorld/weather/illumination.html"
---

# 天气-光照

### 属性

#### lightMode: 'manual' | 'natural'

> 默认值："natural"

作用于天空和环境光的照明类型。对应编辑器设置 [场景-日光-日光规律] 控件属性。

目前有提供2种光照模式，'manual'(自定义)或'natural'(动态)。

---

#### sunFrequency: number

> 默认值：0

太阳运动的频率，数值越大，昼夜交替越快。

昼夜时间计算公式: timeOfDay = (sunPhase + sunFrequency * tick) % 1

---

#### sunPhase: number

> 默认值：0

范围：0-1

太阳从升起至落下，在天空的初始位置。对应编辑器菜单 [场景-日光] 控件属性。

💡提示

关于太阳位置和世界时间的关系：

太阳位置 sunPhase = 0 世界时间为 06:00

太阳位置 sunPhase = 0.25 世界时间为 12:00

太阳位置 sunPhase = 0.5 世界时间为 18:00

太阳位置 sunPhase = 0.75 世界时间为第二天 00:00

太阳位置 sunPhase = 1 世界时间为第二天 06:00

---

#### sunDirection ::[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(0, -1, 0)

太阳光照明方向。仅在光照模式为manual自定义模式时生效。

---

#### sunLight ::[GameRGBColor](/api/GameRGBColor/index.md)

> 默认值：GameRGBColor(1000, 1000, 1000)

太阳光颜色亮度。仅在光照模式为manual自定义模式时生效。

颜色值大于0时，颜色越亮。

---

#### skyLeftLight:[GameRGBColor](/api/GameRGBColor/index.md)

> 默认值：GameRGBColor(0, 0, 0)

环境光在-X轴方向的亮度。仅在光照模式为manual自定义模式时生效。

颜色值大于0时，颜色越亮。

---

#### skyRightLight:[GameRGBColor](/api/GameRGBColor/index.md)

> 默认值：GameRGBColor(0, 0, 0)

环境光在+X轴方向的亮度。仅在光照模式为manual自定义模式时生效。

颜色值大于0时，颜色越亮。

---

#### skyBottomLight:[GameRGBColor](/api/GameRGBColor/index.md)

> 默认值：GameRGBColor(0, 0, 0)

环境光在-Y轴方向的亮度。仅在光照模式为manual自定义模式时生效。

颜色值大于0时，颜色越亮。

---

#### skyTopLight：[GameRGBColor](/api/GameRGBColor/index.md)

> 默认值：GameRGBColor(0, 0, 0)

环境光在+X轴方向的亮度。仅在光照模式为manual自定义模式时生效。

颜色值大于0时，颜色越亮。

---

#### skyFrontLight ::[GameRGBColor](/api/GameRGBColor/index.md)

> 默认值：GameRGBColor(0, 0, 0)

环境光在-Z轴方向的亮度。仅在光照模式为manual自定义模式时生效。

颜色值大于0时，颜色越亮。

---

#### skyBackLight:[GameRGBColor](/api/GameRGBColor/index.md)

> 默认值：GameRGBColor(0, 0, 0)

环境光在+Z轴方向的亮度。仅在光照模式为manual自定义模式时生效。

颜色值大于0时，颜色越亮。
