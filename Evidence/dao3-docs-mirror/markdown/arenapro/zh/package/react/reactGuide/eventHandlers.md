---
title: "React 组件事件处理器"
source: "https://docs.dao3.fun/arenapro/zh/package/react/reactGuide/eventHandlers.html"
---

# React 组件事件处理器

在 ArenaPro 的 React 开发中，各种 UI 组件都支持丰富的事件处理机制，让创作者能够创建高度交互的用户界面。本文将详细介绍可用的事件处理器及其应用场景。

## 通用事件处理器

所有 UI 组件都支持以下核心事件处理器：

tsx

```
/** 点击事件处理器 */
onClick?: (event: UiEvent<T>) => void;

/** 鼠标按下事件处理器 */
onMouseDown?: (event: UiEvent<T>) => void;

/** 鼠标释放事件处理器 */
onMouseUp?: (event: UiEvent<T>) => void;

/** 元素挂载完成回调 */
onMount?: (element: T) => void;

/** 元素卸载前回调 */
onUnmount?: (element: T) => void;
```

### 基础用法示例

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState } = hooks;

function InteractiveButton() {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <box
      onClick={(event) => {
        console.log("按钮被点击", event);
      }}
      onMouseDown={(event) => {
        console.log("鼠标按下", event);
        setIsPressed(true);
      }}
      onMouseUp={(event) => {
        console.log("鼠标释放", event);
        setIsPressed(false);
      }}
      onMount={(element) => {
        console.log("按钮已挂载到 UI 树", element);
      }}
      onUnmount={(element) => {
        console.log("按钮将从 UI 树卸载", element);
      }}
    />
  );
}
```

### 生命周期事件详解

`onMount`和`onUnmount`事件处理器对于管理组件的生命周期至关重要：

tsx

```
function LifecycleDemoComponent() {
  const [showChild, setShowChild] = useState(true);

  return (
    <box>
      <box
        onClick={() => setShowChild(!showChild)}
        style={{
          backgroundColor: Vec3.create({ r: 0, g: 150, b: 200 }),
          size: { offset: Vec2.create({ x: 120, y: 30 }) },
        }}
      >
        <text>切换显示</text>
      </box>

      {showChild && (
        <box
          style={{
            position: { offset: Vec2.create({ x: 0, y: 40 }) },
            backgroundColor: Vec3.create({ r: 200, g: 100, b: 50 }),
            size: { offset: Vec2.create({ x: 200, y: 100 }) },
          }}
          onMount={(element) => {
            console.log("子元素已挂载", element);
            // 这里可以进行初始化操作
            // 例如：启动动画、设置聚焦、请求数据等
          }}
          onUnmount={(element) => {
            console.log("子元素即将卸载", element);
            // 这里可以进行清理操作
            // 例如：保存状态、停止计时器、取消网络请求等
          }}
        >
          <text>生命周期演示组件</text>
        </box>
      )}
    </box>
  );
}
```

## 输入框特有事件处理器

输入框组件除了支持通用事件处理器外，还提供以下特有的事件处理器：

tsx

```
/** 获得焦点事件处理器 */
onFocus?: (event: UiEvent<UiInput>) => void;

/** 失去焦点事件处理器 */
onBlur?: (event: UiEvent<UiInput>) => void;
```

### 输入框事件应用示例

tsx

```
function EnhancedInput() {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <box>
      <input
        onFocus={(event) => {
          console.log("输入框获得焦点", event);
          setIsFocused(true);
        }}
        onBlur={(event) => {
          console.log("输入框失去焦点", event);
          setIsFocused(false);
        }}
        style={{
          borderWidth: 2,
          borderColor: isFocused
            ? Vec3.create({ r: 0, g: 122, b: 255 })
            : Vec3.create({ r: 200, g: 200, b: 200 }),
          size: { offset: Vec2.create({ x: 200, y: 30 }) },
        }}
      />
      <text style={{ position: { offset: Vec2.create({ x: 0, y: 40 }) } }}>
        状态: {isFocused ? "正在输入" : "等待输入"}
      </text>
    </box>
  );
}
```

### 表单验证实践

结合焦点事件和输入事件，可以实现实时表单验证：

tsx

```
function ValidatedInput() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const isValid = /^\S+@\S+\.\S+$/.test(email);
  const showError = touched && !isValid;

  return (
    <box>
      <text>电子邮箱:</text>
      <input
        onBlur={(e) => {
          setEmail(e.target.textContent);
          setTouched(true);
        }}
      />
      {showError && (
        <text
          style={{
            textColor: Vec3.create({ r: 255, g: 0, b: 0 }),
            position: { offset: Vec2.create({ x: 0, y: 40 }) },
          }}
        >
          请输入有效的电子邮箱地址
        </text>
      )}
    </box>
  );
}
```

## 图片组件特有事件处理器

图片组件提供了加载事件处理器，用于监控图片资源的加载状态：

tsx

```
/** 图片加载完成事件处理器 */
onLoad?: (event: UiEvent<UiImage>) => void;
```

### 图片加载示例

tsx

```
function ImageWithLoadingState() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <box>
      {!isLoaded && !hasError && (
        <box
          style={{
            backgroundColor: Vec3.create({ r: 240, g: 240, b: 240 }),
            size: { offset: Vec2.create({ x: 200, y: 150 }) },
          }}
        >
          <text>加载中...</text>
        </box>
      )}

      <image
        style={{
          image = "https://example.com/image.jpg",
          size: { offset: Vec2.create({ x: 200, y: 150 }) },
          // 未加载完成时隐藏图片
          backgroundOpacity: isLoaded ? 1 : 0,
        }}
        onLoad={(event) => {
          console.log("图片加载完成", event);
          setIsLoaded(true);
        }}
      />

      {hasError && (
        <box
          style={{
            backgroundColor: Vec3.create({ r: 250, g: 230, b: 230 }),
            size: { offset: Vec2.create({ x: 200, y: 150 }) },
          }}
        >
          <text style={{ textColor: Vec3.create({ r: 200, g: 0, b: 0 }) }}>
            图片加载失败
          </text>
        </box>
      )}
    </box>
  );
}
```

## 事件处理的最佳实践

### 1. 使用 useCallback 优化性能

对于频繁重渲染的组件，使用`useCallback`可以避免不必要的函数重建：

tsx

```
import { useCallback } from "@dao3fun/react/lib/hooks";

function OptimizedComponent() {
  const [count, setCount] = useState(0);

  // 使用 useCallback 缓存事件处理函数
  const handleClick = useCallback((event) => {
    console.log("处理点击事件", event);
    setCount((prev) => prev + 1);
  }, []); // 空依赖数组表示该函数不会重新创建

  return (
    <box onClick={handleClick}>
      <text>点击次数: {count}</text>
    </box>
  );
}
```

### 2. 事件冒泡处理

事件在 UI 树中会向上冒泡，可以使用事件处理器的`stopPropagation`方法阻止：

tsx

```
function BubblingDemo() {
  return (
    <box
      onClick={() => console.log("外层盒子被点击")}
      style={{
        backgroundColor: Vec3.create({ r: 200, g: 200, b: 200 }),
        size: { offset: Vec2.create({ x: 300, y: 200 }) },
      }}
    >
      <box
        onClick={(event) => {
          console.log("内层盒子被点击");
          // 阻止事件冒泡，外层的 onClick 不会触发
          event.stopPropagation();
        }}
        style={{
          backgroundColor: Vec3.create({ r: 100, g: 150, b: 200 }),
          position: { offset: Vec2.create({ x: 50, y: 50 }) },
          size: { offset: Vec2.create({ x: 100, y: 100 }) },
        }}
      >
        <text>阻止冒泡</text>
      </box>
    </box>
  );
}
```

### 3. 统一的事件处理策略

对于复杂组件，可以集中管理事件处理逻辑：

tsx

```
function ComplexForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // 统一处理所有输入字段的变化
  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.textContent,
    });
  };

  return (
    <box>
      <input
        onBlur={handleChange("name")}
        style={{ placeholder: "输入姓名" }}
      />

      <input
        onBlur={handleChange("email")}
        style={{ placeholder: "输入邮箱" }}
      />

      <textarea
        onBlur={handleChange("message")}
        style={{ placeholder: "输入留言" }}
      />
    </box>
  );
}
```

## 总结

在 ArenaPro 的 React 开发中，事件处理器提供了丰富的交互能力：

1. **通用事件处理器**适用于所有组件，提供基础的用户交互支持
2. **输入框事件处理器**增强了表单控件的交互体验和数据验证能力
3. **图片事件处理器**帮助管理资源加载状态，提升用户体验

通过合理运用这些事件处理器，可以构建出响应迅速、交互丰富的用户界面。同时，遵循最佳实践能够确保应用的性能和可维护性。
