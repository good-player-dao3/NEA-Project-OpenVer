---
title: "方块的操作"
source: "https://docs.dao3.fun/api/GameVoxels/operate.html"
---

# 方块的操作

非运行状态下的方块操作

如果你想要在地图**非运行状态**下进行**快速建造**，可以按照以下步骤操作：

1. 开启编辑器右上角的调试模式（🐞 图标）
2. 在窗口底部的控制台中输入对应的代码

⚠️ 注意事项：

- 即使游戏未运行，部分代码也能直接生效
- 执行脚本前请务必备份项目
- 建议先在空白地图中测试代码

方块旋转码

方块名称和方块 id 都是描述某位置方块的方法
方块名称只包含方块的类型
id 包含方块的旋转码，在[setVoxel](#setVoxel)方法不填`rotation`参数的情况下修改方块旋转码
方块正面面朝北方（`-z`方向）的旋转码数值上和将方块名称使用[id](#id)方法转换后（即方块为初始旋转状态的 id，也可说为不带旋转码）相同
方块正面面朝北方（`-z`方向）的旋转码为基准，取此时的旋转码为`voxel`，每顺时针转 90°，方块`voxel`加`16384`（`0x4000`）
我们以泥土（方块名称为`'dirt'`，id 为`125`）为例：

- 面向北方（`-z`方向）的旋转码为`125 + 0`=`125`
- 面向东方（`+x`方向）的旋转码为`125 + 16384 * 1`=`16509`
- 面向南方（`+z`方向）的旋转码为`125 + 16384 * 2`=`32893`
- 面向西方（`-x`方向）的旋转码为`125 + 16384 * 3`=`49277`

若只是想判断方块的类型，应使用[name](#name)将方块 id 转换成方块名称或者将方块 id 取模`16384`（`0x4000`）后再判断
这不只是为了规范和便于维护，因为方块的 id 会包含旋转码，旋转码会使直接判断方块 id 相等的方法无效（除非你把四个方向都考虑到）！

## 属性

#### 只读shape: GameVector3

> 默认值：当前地图尺寸

当前世界地形最大尺寸。

#### 只读VoxelTypes: string[]

> 默认值：方块数组

返回包含所有方块名称的数组。

## 方法

### 方块 ID<互转>方块名称

#### id(name: string): number

将方块 id 转换为方块名称

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| name | *是* |  | string | 方块名称 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| number | 方块 ID |

#### name(id:number): string

将方块名称转换为方块 id

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| id | *是* |  | number | 方块 ID |

**返回值**

| **类型** | **说明** |
| --- | --- |
| string | 方块名称 |

### 放置方块

#### setVoxel(x:number,y:number,z:number,voxel:number | string,rotation?:number | string): number

在指定的坐标位置放置一个方块。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| x | *是* |  | number | 放置位置的 x 坐标 |
| y | *是* |  | number | 放置位置的 y 坐标 |
| z | *是* |  | number | 放置位置的 z 坐标 |
| voxel | *是* |  | number \| string | 方块名称或 id |
| rotation |  |  | number \| string | 方块的旋转码(0,1,2,3) |

**返回值**

| **类型** | **说明** |
| --- | --- |
| number | 新的方块 id |

警告

若方块名称为'**air**' 或者方块 id 为**0**，则会打破

警告

`voxel`参数中包含的方块旋转码无效，实际旋转只和`rotation`参数有关

点击查看示例代码

javascript

```
// 利用循环批量设置方块
for (let x = 0; x < 127; x++) {
  for (let z = 0; z < 127; z++) {
    for (let y = 9; y < 127; y++) {
      voxels.setVoxel(x, y, z, "air");
    }
  }
}
```

---

javascript

```
// 利用循环批量设置方块
for (let x = 0; x < 127; x++) {
  for (let z = 0; z < 127; z++) {
    setVoxel(x, 8, z, "snow");
  }
}
```

---

javascript

```
// 利用循环批量设置方块
for (let x = 0; x < 127; x++) {
  for (let z = 0; z < 127; z++) {
    for (let y = 9; y < 127; y++) {
      voxels.setVoxel(x, y, z, "air");
    }
  }
}
```

---

javascript

```
// 根据地面的方块铺设，将方块往上增长5格高度的墙。
for (let x = 0; x < 127; x++) {
  for (let z = 0; z < 127; z++) {
    let vox = getVoxelId(x, 9, z);
    if (!vox) continue; // 如果没有方块则跳过
    for (let y = 10; y < 10 + 5; y++) {
      // 从y=10的位置开始增长5格
      voxels.setVoxel(x, y, z, vox);
    }
  }
}
```

---

javascript

```
// 在指定位置放置字母方块
function voxelAlhpabet(str, x, y, z) {
  str = str.toUpperCase(); // 将字母转换为大写
  for (var i = 0; i < str.length; i++) {
    var char = str[i];
    voxels.setVoxel(x + i, y, z, char);
  }
}

// 调用方法
voxelAlhpabet("hello world", 63, 20, 63);
```

---

javascript

```
// 将字符串与方块名称对应
const char_table = {
  0: "zero",
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  "+": "add",
  "-": "subtract",
  "?": "question_mark",
  "!": "exclamation_mark",
  "=": "equal",
  " ": "black",
  "&": "ampersand",
  "*": "asterisk",
  "@": "at",
  "\\": "backslash",
  "]": "bracket_close",
  "[": "bracket_open",
  "^": "caret",
  ":": "colon",
  ",": "comma",
  $: "dollar",
  ">": "greater_than",
  "<": "less_than",
  "(": "paren_open",
  ")": "paren_close",
  "%": "percent",
  ".": "period",
  "#": "pound",
  '"': "quotation_mark",
  ";": "semicolon",
  "/": "slash",
  "~": "tilde",
};

// 如果符号在列表内，则放置列表对应名称的方块。否则直接放置字母方块。
function voxelText(str, x, y, z) {
  for (var i = 0; i < str.length; i++) {
    var char = str[i].toUpperCase();
    var name = char_table[char];
    if (name) {
      voxels.setVoxel(x + i, y, z, name);
    } else {
      voxels.setVoxel(x + i, y, z, char);
    }
  }
}

// 在指定的位置，依次生成字符串方块
function voxelTextWall(words, x, y, z) {
  for (var i = 0; i < words.length; i++) {
    voxelText(words[i], x, y - i, z);
  }
}

// 调用方法
voxelTextWall(["HELLO BOX3.0", "2333"], 64, 13, 64);
```

---

javascript

```
// 棋盘方块
const B = {
  "+": id("board1"),
  T: id("board4"),
  L: id("board3"),
  ".": id("board2"),
};

// 方块旋转码
const R = {
  N: 0x8000,
  S: 0,
  E: 0xc000,
  W: 0x4000,
};

// 创建棋盘
function createBoard(originX, originY, originZ, size) {
  // 创建size * size的棋盘
  for (let x = 0; x < size; ++x) {
    for (let z = 0; z < size; ++z) {
      // 通常来讲是交点
      let p = B["+"];
      // 以下四个判断用于判断是否是边角
      if (x === 0 && z === 0) {
        p = B["L"] | R["S"];
      } else if (x === 0 && z === size - 1) {
        p = B["L"] | R["E"];
      } else if (x === size - 1 && z === 0) {
        p = B["L"] | R["W"];
      } else if (x === size - 1 && z === size - 1) {
        p = B["L"] | R["N"];
        // 以下四个判断用于判断是否是边缘
      } else if (x === 0) {
        p = B["T"] | R["E"];
      } else if (x === size - 1) {
        p = B["T"] | R["W"];
      } else if (z === 0) {
        p = B["T"] | R["S"];
      } else if (z === size - 1) {
        p = B["T"] | R["N"];
      }
      // 放置方块
      voxels.setVoxelId(x + originX, originY, z + originZ, p);
    }
  }
}

// 调用方法: 在{x:32, y:9, z:32} 位置，创建19*19的棋盘
createBoard(32, 9, 32, 19);
```

#### setVoxelId(x:number,y:number,z:number,voxel:number): number

使用方块 ID，直接在指定的坐标位置放置方块。

信息

`voxel`参数包含的方块旋转码有效

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| x | *是* |  | number | 放置位置的 x 坐标 |
| y | *是* |  | number | 放置位置的 y 坐标 |
| z | *是* |  | number | 放置位置的 z 坐标 |
| voxel | *是* |  | number | 方块 id |

**返回值**

| **类型** | **说明** |
| --- | --- |
| number | 新的方块 id |

### 获取方块

#### getVoxel(x:number,y:number,z:number): number

获取指定位置的方块 ID

警告

用此方法获取的 id 不带旋转码

提示

由于其不带旋转码的特性，可以直接用此方法判断方块的 id 来判断的种类，而不是用[name](#name)方法转换成方块名称后再比较

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| x | *是* |  | number | 获取位置的 x 坐标 |
| y | *是* |  | number | 获取位置的 y 坐标 |
| z | *是* |  | number | 获取位置的 z 坐标 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| number | 返回指定位置的方块 id，**不包含方块的旋转码** |

#### getVoxelId(x:number,y:number,z:number): number

直接获取指定位置的方块 ID。

信息

用此方法获取的 id 带旋转码

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| x | *是* |  | number | 获取位置的 x 坐标 |
| y | *是* |  | number | 获取位置的 y 坐标 |
| z | *是* |  | number | 获取位置的 z 坐标 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| number | 返回指定位置的方块 id |

#### getVoxelRotation(x:number,y:number,z:number): number

获取某个坐标位置的方块旋转码

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| x | *是* |  | number | 获取位置的 x 坐标 |
| y | *是* |  | number | 获取位置的 y 坐标 |
| z | *是* |  | number | 获取位置的 z 坐标 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| number | 返回指定位置的方块旋转码(0,1,2,3) |

## 快速建造代码示例

javascript

```
/* 在指定位置快速建造一个实心的矩形 */
function cubefill(vox, sx, sy, sz, xsize, ysize, zsize) {
  var xend = sx + xsize;
  var yend = sy + ysize;
  var zend = sz + zsize;
  for (var x = sx; x < xend; x++) {
    for (var y = sy; y < yend; y++) {
      for (var z = sz; z < zend; z++) {
        voxels.setVoxel(x, y, z, vox);
      }
    }
  }
}

cubefill("stone", 64, 9, 64, 10, 5, 10); // 调用方法。在{x:64, y:9, z:64} 位置，建造一个长10格，宽5格，高10格的实心矩形
```

---

javascript

```
/* 在指定位置快速建造一个空心的矩形 */
function cube(vox, sx, sy, sz, xsize, ysize, zsize) {
  var xend = sx + xsize;
  var yend = sy + ysize;
  var zend = sz + zsize;
  for (var x = sx; x < xend; x++) {
    for (var y = sy; y < yend; y++) {
      for (var z = sz; z < zend; z++) {
        if (x === sx || z === sz || x === xend - 1 || z === zend - 1) {
          //如果方块的位置在边缘
          voxels.setVoxel(x, y, z, vox);
        }
      }
    }
  }
}

cube("stone", 64, 9, 64, 10, 5, 10); // 调用方法。在{x:64, y:9, z:64} 位置，建造一个长10格，宽5格，高10格的空心矩形
```

---

javascript

```
/* 在指定位置快速建造一个实心的球体 */
function sphere(vox, cx, cy, cz, radius) {
  let xend = cx + radius;
  let yend = cy + radius;
  let zend = cz + radius;
  for (let x = cx - radius; x <= xend; x++) {
    for (let y = cy - radius; y <= yend; y++) {
      for (let z = cz - radius; z <= zend; z++) {
        let dx = x - cx;
        let dy = y - cy;
        let dz = z - cz;
        if (Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz)) <= radius) {
          voxels.setVoxel(x, y, z, vox);
        }
      }
    }
  }
}

sphere("stone", 63, 24, 63, 12); // 调用方法。在{x:63, y:24, z:63} 位置，建造一个半径为12格的实心球体
```

---

javascript

```
/* 在指定位置快速建造一个圆柱体 */
function cylinder(vox, cx, cy, cz, radius, height) {
  let xend = cx + radius;
  let yend = cy + height;
  let zend = cz + radius;
  for (let x = cx - radius; x <= xend; x++) {
    for (let z = cz - radius; z <= zend; z++) {
      let dx = x - cx;
      let dz = z - cz;
      if (Math.round(Math.sqrt(dx * dx + dz * dz)) <= radius) {
        for (let y = cy; y < yend; y++) {
          voxels.setVoxel(x, y, z, vox);
        }
      }
    }
  }
}

cylinder("stone", 63, 12, 63, 10, 4); // 调用方法。在{x:63, y:12, z:63} 位置，建造一个半径10格，高度4格的圆柱体
```

---

javascript

```
/* 在指定位置快速建造一个生成楼梯(+x轴方向) */
function stairs(sx, sy, sz, length, thickness) {
  let xend = sx + length;
  let zend = sz + thickness;
  let i = 0;
  for (let x = sx; x < xend; x++) {
    let yend = sy + i;
    i++;
    for (let y = sy; y <= yend; y++) {
      for (let z = sz; z < zend; z++) {
        voxels.setVoxel(x, y, z, "stone");
      }
    }
  }
}

stairs(63, 9, 63, 6, 4); // 调用方法。在{x:63, y:9, z:63} 位置，建造一个高度6格，宽度4格的楼梯
```

---

javascript

```
/* 在指定位置快速建造一个生成楼梯(-x轴方向) */
function stairs(sx, sy, sz, length, thickness) {
  let xend = sx + length;
  let zend = sz + thickness;
  let i = 0;
  for (let x = xend; x > sx; x--) {
    // 和前面+x轴方向的范例相比，此处正好相反
    let yend = sy + i;
    i++;
    for (let y = sy; y <= yend; y++) {
      for (let z = sz; z < zend; z++) {
        voxels.setVoxel(x, y, z, "stone");
      }
    }
  }
}

stairs(63, 9, 63, 6, 4); // 调用方法。在{x:63, y:9, z:63} 位置，建造一个高度6格，宽度4格的楼梯
```
