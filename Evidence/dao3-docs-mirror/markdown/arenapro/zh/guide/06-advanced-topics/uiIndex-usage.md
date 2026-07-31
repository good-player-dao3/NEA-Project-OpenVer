---
title: "ArenaPro UI 索引使用指南"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/uiIndex-usage.html"
---

# ArenaPro UI 索引使用指南

## 还在为“路径地狱”抓狂？

> 你在 UI 树里找节点，路径层级深、命名不统一、改了结构就全崩。每次都是：
>
> - “要拿到`content1`，每次都得拼`blackground/.../box/list/0/...`这种长路径。”
> - “设计把`panel`挪进了`container`，结果我所有字符串路径都要跟着改一遍。”
> - “我只想直接拿到元素引用，不想维护深层级的字符串路径。”

从 V1.4.0 开始，ArenaPro 提供了“UI 索引”能力——像看“地图索引”一样，通过“屏幕名 + 节点名”直达目标元素，不再被路径困住。

### 示例

ts

```
// 过去（路径地狱）：任何结构变化都要手改字符串路径
const el = UiScreen.getAllScreen()
  .find((e) => e.name === "blackground")
  .findChildByName("blackground")
  .findChildByName("root")
  .findChildByName("container")
  .findChildByName("panel")
  .findChildByName("box")
  .findChildByName("unit")
  .findChildByName("list")
  .findChildByName("0")
  .findChildByName("content")
  .findChildByName("content1");
console.log(el?.name);

// 现在（UI 索引）：按“屏幕名 + 节点名”强类型直达
const idx = find("blackground");
console.log(idx?.uiText_content1.name); // 强类型、自动补全、结构调整后只需重新同步索引
```

## UI 索引能带来什么？

UI 索引是对 UI 树的“强类型投影”。它会为每个屏幕生成一个索引类，并提供统一入口来查找索引实例：

| 你将获得… | 它意味着… |
| --- | --- |
| **🔎 强类型直达元素** | 通过属性访问 UI 元素，IDE 自动补全、类型可见。 |
| **🧭 脱离路径依赖** | 不再手写字符串路径，结构调整也不必批量改路径字符串。 |
| **⚡ 首次预热，后续快** | 构造时按路径表一次性预热缓存，后续访问无需再查找。 |
| **🧩 命名冲突消解** | 自动采用末级名/回退全路径/再追加序号，最大化获得“好用的属性名”。 |
| **✅ 类型即规范** | 不存在的屏幕在类型上直接是`never`，问题在编译期暴露；运行时缺失返回`undefined`。 |

> 核心优势：UI 索引由插件自动生成和维护。你只需按“屏幕名”获取索引实例，剩下的交给类型系统与缓存机制。

### 示例

ts

```
import find from "@client/UiIndex";
const idx = find("home");

// 1) 强类型直达元素（IDE 自动补全）
idx?.uiText_title.text = "Hello";

// 2) findBy：按类型/谓词检索，el 自动收窄
const imgs = idx?.findBy("UiImage", (meta, el) => el?.visible === true);
const buttons = idx?.findBy((meta) => meta.name.includes("btn"));
```

## 如何获取并使用

### 生成索引文件

- 触发“同步地图资源”（例如按下`Alt+Y`）或相关命令后，插件会扫描 UI 树并自动生成索引文件。
- 生成目录结构如下（自动生成，勿手动修改）：

```
client/UiIndex/
  ├─ index.ts                // 入口，默认导出 find()
  ├─ ClientUIWindow.ts       // 基类（缓存、按路径查找、预热逻辑 + 实用方法）
  └─ screens/
      ├─ UiIndex_home.ts     // 示例：home 屏幕索引类
      └─ UiIndex_xxx.ts      // 其它屏幕索引类
```

> 若你看到导入路径为`@client/UiIndex`，说明已在项目中配置了该别名，通常可直接使用该导入方式。

### 快速上手

ts

```
import find from "@client/UiIndex";

// 1) 通过屏幕名获取索引实例（强类型）
const idx = find("blackground");
if (idx) {
  // 2) 直接通过强类型属性访问 UI 元素
  // 实际路径：blackground/box/unit/list/0/content1
  idx.uiText_content1; // 只需要写 uiText_content1，就可以访问到
  idx.uiImage_logo; // 同理
}
```

要点：

- `find(name)`的返回类型由`name`决定：
  - 在类型上存在的屏幕名 -> 返回该屏幕对应的`UiIndex_xxx`实例类型。
  - 不存在的屏幕名 -> 返回类型为`never`（编译期立即暴露问题）。
- 运行时如果确实未找到该屏幕，会返回`undefined`，因此示例里有判空。
- 性能：同一屏幕名的`find(name)`会被缓存，后续重复调用直接复用实例，不会重复构建。

### 常用操作清单

- **获取索引实例**：`const idx = find("home")`，并判空处理。
- **访问元素**：`idx.uiText_title`、`idx.uiImage_logo`等属性即为元素引用。
- **查看真实路径**：打开对应`UiIndex_<Screen>.ts`，查阅`static PATHS`或 getter 注释。
- **结构改动后**：重新同步资源以更新索引，避免手写路径带来的维护成本。

## UI 数据

- **统一元信息 META（强类型）**
  - 每个屏幕类都生成`static readonly META`，与`PATHS`一一对应。
  - `META[i].path`不再重复字符串，改为引用`PATHS[i]`，单一来源更稳。
  - `META[i].type`收紧为联合类型：`'UiBox' | 'UiImage' | 'UiInput' | 'UiScrollBox' | 'UiText'`。
- **findBy 下沉到基类并增强类型**
  - 现位于`ClientUIWindow`，所有屏幕类直接继承。
  - 支持两种调用方式：
    - `findBy(predicate)`：按谓词过滤，`el`类型为`UiElement | undefined`。
    - `findBy(kind, predicate?)`：先按类型过滤，`el`会随`kind`自动收窄为对应类型（例如`UiImage | undefined`）。
  - 返回值：有命中 -> 返回命中数组；无命中 ->`undefined`。
  - 示例：ts`consttexts=idx?.findBy("UiText");constimgs=idx?.findBy("UiImage", (meta,el)=>el?.visible===true);consthits=idx?.findBy((meta,el)=>meta.name.includes("btn"));`
- **实例方法：getPaths / getMeta**
  - `getPaths(): ReadonlyArray<string>`返回当前屏幕的`PATHS`。
  - `getMeta(): ReadonlyArray<{ path: string; type: UiKind; name: string }>`返回`META`（便于调试/可视化）。

## API 参考

### 1) 默认导出：find(screenName)

- 作用：通过屏幕名获取该屏幕对应的 UI 索引实例。
- 类型（简化示意）：ts`exportdefaultfunctionfind<Nameextendskeyoftypeof__UiIndexCtorMap>(screenName:Name):InstanceType<(typeof__UiIndexCtorMap)[Name]>|undefined;`
- 运行时返回：`UiIndex_xxx`实例或`undefined`（屏幕不存在）。
- 典型用法：ts`constidx=find("home");if(idx) {idx.uiText_title;}`

### 2) 屏幕索引类：`UiIndex_<Screen>`

- 每个屏幕对应一个类，继承自`ClientUIWindow`。
- 主要成员：
  - `static readonly PATHS: readonly string[]`：该屏幕下需缓存的完整路径表。
  - `static readonly META: readonly { path: (typeof PATHS)[number]; type: UiKind; name: string }[]`。
  - 强类型 getters：例如`get uiText_title(): UiText`（从缓存中按`PATHS[i]`读取）。

### 3) 基类：`ClientUIWindow`

- 职责：
  - 维护以完整路径为键的缓存表`__cache`。
  - 提供`getByPath(path)`根据完整路径查找元素。
  - 构造时按`PATHS`进行预热，将所有路径映射到缓存。
- 关键方法（新增与调整）：
  - `getPaths(): ReadonlyArray<string>`
  - `getMeta(): ReadonlyArray<{ path: string; type: UiKind; name: string }>`
  - `findBy(kind, predicate?)`/`findBy(predicate)`：带类型收窄与空返回`undefined`的过滤。

> 类型别名：`type UiKind = 'UiBox' | 'UiImage' | 'UiInput' | 'UiScrollBox' | 'UiText'`

## 命名规则

- 属性名前缀与类型绑定：
  - `UiText`->`uiText_...`
  - `UiImage`->`uiImage_...`
  - `UiBox`->`uiBox_...`
  - `UiScrollBox`->`uiScrollBox_...`
  - `UiInput`->`uiInput_...`
- 基础命名使用“路径最后一段名”；若冲突，则回退为“完整路径”；若仍冲突，自动追加序号`_2/_3/...`。
- 支持中文/Unicode，非法字符将被替换为下划线，并确保首字符合法。

## uiIndexPrefix 配置与行为

- **配置位置**：`dao3.config.json -> file.typescript.client.uiIndexPrefix`
- **类型与默认值**：字符串，默认空字符串`""`（不启用过滤）
- **功能说明**：
  - 若配置了前缀，例如`"U_"`，则仅收集名称以该前缀开头的 UI 节点来生成索引。
  - 生成的 getter 名会自动剥离该前缀，避免出现`uiText_U_title`这种冗余命名。
  - 未配置或为空字符串时，对所有节点生成索引。

示例配置：

json

```
{
  "file": {
    "typescript": {
      "client": {
        "uiIndexPrefix": "U_"
      }
    }
  }
}
```

示例效果：

- 节点实际名称：`U_title`、`U_logo`、`desc`
- 生成结果：
  - `U_title`-> getter:`uiText_title`
  - `U_logo`-> getter:`uiImage_logo`
  - `desc`-> 不生成（未匹配前缀）
- PATHS 中保留真实名称（如`.../U_title`），仅 getter 名剥离前缀，运行时查找不受影响。

## 注意事项与最佳实践

- 仅支持单个前缀字符串。若需多个前缀或正则匹配，请提需求，可扩展为数组/正则。
- 建议统一给“需要暴露为索引”的节点加上前缀，以减少噪声和属性冲突。
- 修改前缀后请重新同步资源，以更新索引文件。
- 命名冲突处理仍生效：末级名冲突 -> 回退全路径 -> 再追加序号。
