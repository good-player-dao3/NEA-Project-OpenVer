---
title: "React 标签与 XML 基础"
source: "https://docs.dao3.fun/arenapro/zh/package/react/reactGuide/xml.html"
---

# React 标签与 XML 基础

JSX 是 JavaScript XML 的缩写，它允许我们在 JavaScript 代码中编写类似 HTML 的标记。在神岛 React 中，我们使用 JSX 来创建 UI 组件。

## 基本标签结构

### 1. 空标签

空标签是指没有内容的标签，可以使用自闭合形式：

tsx

```
<box />
<text />
<image />
```

### 2. 带内容的标签

带内容的标签需要开始标签和结束标签：

tsx

```
<box>
  <text>Hello World</text>
</box>
```

### 3. 嵌套标签

标签可以多层嵌套：

tsx

```
<box>
  <box>
    <text>嵌套内容</text>
  </box>
</box>
```

## 属性使用

### 1. 基本属性

属性使用驼峰命名法：

tsx

```
<text style={{ color: "red" }}>红色文本</text>
```

### 2. 布尔属性

布尔属性可以简写：

tsx

```
<box visible={true} />
// 等同于
<box visible />
```

### 3. 动态属性

可以使用 JavaScript 表达式：

tsx

```
<text style={{ fontSize: size + "px" }}>动态大小</text>
```

## 特殊属性

### 1. style 属性

style 属性用于设置 UI 样式：

tsx

```
<box
  style={{
    position: { offset: Vec2.create({ x: 100, y: 100 }) },
    size: { width: 200, height: 200 },
  }}
>
  <text>居中文本</text>
</box>
```

### 2. onClick 事件

处理点击事件：

tsx

```
<text onClick={() => console.log("点击了文本")}>可点击文本</text>
```

## 最佳实践

1. **标签命名**
  - 使用语义化的标签名
  - 保持标签层次清晰
  - 避免过度嵌套
2. **属性使用**
  - 合理使用 style 属性
  - 注意属性命名规范
  - 保持属性简洁
3. **代码组织**
  - 相关标签放在一起
  - 使用适当的缩进
  - 添加必要的注释

## JSX 表达式语法

在 JSX 中，我们使用两种不同的括号语法：`{ {} }`和`{}`，它们有不同的用途：

### 1. 单花括号`{}`

单花括号用于插入 JavaScript 表达式，包括：

- 变量
- 函数调用
- 算术运算
- 条件表达式

tsx

```
// 变量
<text>{name}</text>

// 表达式
<text>{count + 1}</text>

// 函数调用
<text>{formatName(user)}</text>

// 条件渲染
<text>{isLoggedIn ? '已登录' : '未登录'}</text>
```

### 2. 双花括号

双花括号专门用于 style 属性，表示一个 JavaScript 对象：

- 外层`{}`表示这是一个 JavaScript 表达式
- 内层`{}`表示这是一个对象字面量

tsx

```
// style 属性使用双花括号
<text style={{
  textColor: Vec3.create({ r: 96, g: 212, b: 92 }),
  textFontSize: 20
}}>
  样式文本
</text>

// 错误示例：使用单花括号
<text style={textColor: Vec3.create({ r: 96, g: 212, b: 92 })}>  // 语法错误

// 正确示例：使用双花括号
<text style={{ textColor: Vec3.create({ r: 255, g: 0, b: 0 }) }}>
  红色文本
</text>
```

### 3. 注意事项

1. **style 属性必须使用双花括号**

tsx

```
// 正确
<text style={{ textColor: color }}>

// 错误
<text style={textColor: color}>
```

1. **其他属性使用单花括号**

tsx

```
// 正确
<text visible={isVisible}>

// 错误
<text visible={{isVisible}}>
```

1. **嵌套对象需要使用双花括号**

tsx

```
// 正确
<text style={{
    position: { offset: Vec2.create({ x: 100, y: 100 }) }
}}>

// 错误
<text style={position: { offset: Vec2.create({ x: 100, y: 100 }) }}>
```

## 示例代码

tsx

```
import React from "@dao3fun/react";

function UserInfo() {
  return (
    <box
      style={{
        position: { offset: Vec2.create({ x: 100, y: 100 }) },
      }}
    >
      <text style={{ textFontSize: 20 }}>用户信息</text>
      <text
        style={{
          position: { offset: Vec2.create({ x: 0, y: 30 }) },
          textColor: Vec3.create({ r: 96, g: 212, b: 92 }),
        }}
      >
        用户名：张三
      </text>
      <text
        style={{
          position: { offset: Vec2.create({ x: 0, y: 60 }) },
          textColor: Vec3.create({ r: 212, g: 162, b: 92 }),
        }}
      >
        等级：10
      </text>
    </box>
  );
}

React.render(<UserInfo />, ui);
```

效果：

![](/arenapro/QQ20250402-155547.png)

## 注意事项

1. 所有标签必须正确闭合
2. 属性值使用驼峰命名法
3. style 属性中的值需要符合神岛 UI API 规范
4. 事件处理函数使用箭头函数
5. 复杂的样式建议抽离为常量
