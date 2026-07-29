---
title: "React 中的 Refs 使用指南"
source: "https://docs.dao3.fun/arenapro/zh/package/react/reactGuide/refs.html"
---

# React 中的 Refs 使用指南

在 ArenaPro 的 React 开发中，Refs 提供了一种访问组件实例或 DOM 元素的强大机制。本文将详细介绍如何在项目中有效地使用 Refs。

## Refs 的基本概念

Refs 是 React 提供的一种引用机制，允许你直接访问 DOM 元素或组件实例。与 props 和 state 不同，修改 Refs 不会触发组件重新渲染

## 创建和使用 Refs

### 使用 useRef Hook

在函数组件中，我们可以使用`useRef`Hook 来创建 Refs：

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useRef, useEffect } = hooks;

function TextInputWithFocusButton() {
  // 创建一个 ref 对象
  const inputRef = useRef(null);

  // 点击按钮时聚焦输入框
  const focusInput = () => {
    // 通过 current 属性访问 DOM 节点
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <box>
      {/* 将 ref 属性附加到输入元素 */}
      <input
        ref={inputRef}
        style={{
          size: { offset: Vec2.create({ x: 200, y: 30 }) },
        }}
      />

      <box
        onClick={focusInput}
        style={{
          position: { offset: Vec2.create({ x: 0, y: 40 }) },
          backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
          size: { offset: Vec2.create({ x: 100, y: 30 }) },
        }}
      >
        聚焦输入框
      </box>
    </box>
  );
}
```

## Refs 的高级用法

### 转发 Refs（Ref Forwarding）

Ref 转发是一种将 ref 从父组件传递到子组件内部的 DOM 元素的技术：

tsx

```
import React, { forwardRef } from "@dao3fun/react";

// 创建一个组件，转发 ref 到内部的输入框
const FancyInput = forwardRef((props, ref) => (
  <box>
    <input
      ref={ref}
      style={{
        backgroundColor: Vec3.create({ r: 240, g: 240, b: 250 }),
        size: { offset: Vec2.create({ x: 180, y: 25 }) },
      }}
      {...props}
    />
  </box>
));

// 父组件使用转发的 ref
function App() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <box>
      <FancyInput ref={inputRef} />
      <box
        onClick={focusInput}
        style={{
          backgroundColor: Vec3.create({ r: 50, g: 150, b: 100 }),
          size: { offset: Vec2.create({ x: 100, y: 30 }) },
        }}
      >
        聚焦
      </box>
    </box>
  );
}
```

### 回调 Refs

除了`useRef`和`createRef`，React 还支持回调 Refs 的方式，让你更精细地控制何时设置和清除引用：

tsx

```
function CustomCallbackRef() {
  let inputRef = null;

  const setInputRef = (element) => {
    // 存储对 DOM 节点的引用
    inputRef = element;

    // 如果元素存在，可以立即执行操作
    if (element) {
      element.focus();
    }
  };

  return (
    <input
      ref={setInputRef}
      style={{
        size: { offset: Vec2.create({ x: 200, y: 30 }) },
      }}
    />
  );
}
```

## 使用 Refs 管理 UI 元素状态

Refs 可以用于直接操作 UI 元素的状态：

tsx

```
function AnimatedBox() {
  const boxRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    if (boxRef.current && !isAnimating) {
      setIsAnimating(true);

      // 直接操作 UI 元素属性
      const element = boxRef.current;
      let position = 0;

      const animate = () => {
        position += 5;
        if (position <= 200) {
          // 更新元素位置
          element.style.position.offset.copy(
            Vec2.create({ x: position, y: 0 })
          );
        } else {
          setIsAnimating(false);
        }
      };
    }
  };

  return (
    <box>
      <box
        ref={boxRef}
        style={{
          backgroundColor: Vec3.create({ r: 255, g: 100, b: 100 }),
          size: { offset: Vec2.create({ x: 50, y: 50 }) },
        }}
      />

      <box
        onClick={startAnimation}
        style={{
          position: { offset: Vec2.create({ x: 0, y: 60 }) },
          backgroundColor: Vec3.create({ r: 100, g: 200, b: 100 }),
          size: { offset: Vec2.create({ x: 120, y: 30 }) },
        }}
      >
        开始动画
      </box>
    </box>
  );
}
```

## 最佳实践与注意事项

1. **谨慎使用 Refs**：尽量避免过度使用 Refs。在大多数情况下，声明式的 React 编程模型更适合构建用户界面。
2. **避免直接修改 DOM**：虽然 Refs 允许你直接访问 DOM，但应尽量避免过度操作 DOM，以免干扰 React 的渲染流程。
3. **不要在渲染过程中访问 Refs**：Refs 的访问和修改应该在事件处理函数、生命周期方法或 Hook 中进行，而不是在渲染过程中。
4. **管理清理操作**：如果在`useEffect`中使用 Refs 设置了事件监听器或计时器，记得在清理函数中移除它们。

tsx

```
function EventListenerExample() {
  const boxRef = useRef(null);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;

    const handleResize = () => {
      console.log("元素大小可能已改变");
    };

    // 添加事件监听器
    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <box
      ref={boxRef}
      style={{
        backgroundColor: Vec3.create({ r: 100, g: 150, b: 200 }),
        size: { offset: Vec2.create({ x: "100%", y: "100%" }) },
      }}
    />
  );
}
```

## 总结

Refs 是 React 中一个功能强大但应谨慎使用的特性。在开发中，Refs 可以帮助你：

1. **直接访问 DOM 元素**，实现聚焦、测量等操作
2. **管理复杂的动画**，直接操作元素属性
3. **集成第三方库**，桥接 React 与非 React 代码
4. **转发引用**，构建更灵活的组件层次结构

通过合理使用 Refs，你可以构建出既遵循 React 声明式编程理念，又能在必要时精确控制 DOM 的高质量应用。
