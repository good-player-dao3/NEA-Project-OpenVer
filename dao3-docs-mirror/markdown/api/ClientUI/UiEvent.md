---
title: "事件监听"
source: "https://docs.dao3.fun/api/ClientUI/UiEvent.html"
---

# 事件监听

typescript

```
declare const ui: UiNode;
```

> 负责处理事件的组件，其中 listener 接受的参数即触发的事件对象。可监听的事件由组件的宿主决定。

## 方法

#### on(type: string, listener:[UiNode](/api/ClientUI/UiNode.md)=>void): void

监听指定的事件。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| type | 是 |  | string | 监听的事件类型，是个字符串 |
| listener | 是 |  | Function | 监听到事件类型后的处理函数 |

#### once(type: string, listener:[UiNode](/api/ClientUI/UiNode.md)=>void): void

与 on 的区别是仅触发一次。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| type | 是 |  | string | 监听的事件类型，是个字符串 |
| listener | 是 |  | Function | 监听到事件类型后的处理函数 |

#### remove(type: string, listener:[UiNode](/api/ClientUI/UiNode.md)=>void): void

移除找到的第一个 listener。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| type | 是 |  | string | 监听的事件类型，是个字符串 |
| listener | 是 |  | Function | 监听到事件类型后的处理函数 |

#### removeAll(type: string, listener?:[UiNode](/api/ClientUI/UiNode.md)=>void): void

移除找到的所有 listener，不传则移除事件下所有。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| type | 是 |  | string | 监听的事件类型，是个字符串 |
| listener |  |  | Function | 监听到事件类型后的处理函数 |

#### add(type: string, listener?:[UiNode](/api/ClientUI/UiNode.md)=>void): void

与 on 是同一个方法,只是方法名不同。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| type | 是 |  | string | 监听的事件类型，是个字符串 |
| listener |  |  | Function | 监听到事件类型后的处理函数 |

#### emit(type: string, event?:any): void

触发指定的事件。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| type | 是 |  | string | 要触发的事件类型； |
| event |  |  | any | 要触发的事件对象，会被作为监听器的参数。 |

#### off(type: string, event?:any): void

与 remove 是同一个方法,只是方法名不同。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| type | 是 |  | string | 要触发的事件类型； |
| event |  |  | any | 要触发的事件对象，会被作为监听器的参数。 |
