---
title: "React 钩子函数 (Hooks)"
source: "https://docs.dao3.fun/arenapro/zh/package/react/reactGuide/hooks.html"
---

# React 钩子函数 (Hooks)

React 钩子函数（Hooks）是 React 16.8 引入的特性，允许在函数组件中使用状态和其他 React 特性。本文将介绍常用的钩子函数及其使用场景。

## 神岛特有钩子

### useScreenSize

`useScreenSize`是一个自定义钩子，用于获取神岛客户端当前屏幕的尺寸：

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useScreenSize } = hooks;

// 该组件监听屏幕尺寸变化，当屏幕尺寸变化时，重新渲染该组件
function Counter() {
  const { screenWidth, screenHeight } = useScreenSize();

  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 152, g: 255, b: 216 }),
        position: { offset: Vec2.create({ x: 0, y: 0 }) },
      }}
    >
      <text style={{ position: { offset: Vec2.create({ x: 0, y: 0 }) } }}>
        屏幕宽度: {screenWidth}
      </text>
      <text style={{ position: { offset: Vec2.create({ x: 0, y: 40 }) } }}>
        屏幕高度: {screenHeight}
      </text>
    </box>
  );
}

React.render(<Counter />, ui);
```

### useRemoteChannel

`useRemoteChannel`是一个自定义钩子，用于客户端与服务端通讯操作：

tsx

```
// 定义消息类型
interface Message {
  type: string;
  content: string;
}

function ServerCommunicationExample() {
  // 使用useRemoteChannel建立通信，返回一个发送消息的函数
  const { send } = useRemoteChannel<Message, Message>({
    onReceive: (event) => {
      console.log("收到服务端消息:", JSON.stringify(event));
    },
    eventFilter: (event) => event.type === "notification", // 可选的过滤函数，这里只处理通知类型的事件
  });

  // 如果你只需要向服务端发送信息，而无需监听其响应，可以这样实现：
  //   const { send } = useRemoteChannel();

  // 发送消息
  const handleSend = (e: UiInput) => {
    if (!e.textContent.trim()) return;

    // 发送到服务端
    send({
      type: "client_message",
      content: e.textContent,
    });
    e.textContent = "";
  };

  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 240, g: 240, b: 245 }),
        size: { offset: Vec2.create({ x: 400, y: 300 }) },
      }}
    >
      <text
        style={{
          position: { offset: Vec2.create({ x: 20, y: 20 }) },
          textFontSize: 18,
        }}
      >
        服务端通信钩子示例
      </text>

      <input
        style={{
          position: { offset: Vec2.create({ x: 20, y: 60 }) },
        }}
        onBlur={(e) => handleSend(e.target)}
      ></input>
    </box>
  );
}

// 渲染组件
React.render(<ServerCommunicationExample />, ui);
```

## 状态钩子 (State Hooks)

### [useState](https://zh-hans.react.dev/reference/react/useState)

`useState`是最基本的钩子函数，用于在函数组件中添加状态：

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState } = hooks;

function Counter() {
  // 声明一个状态变量和更新函数
  const [count, setCount] = useState(0);

  return (
    <box>
      <text>计数: {count}</text>
      <box
        style={{
          backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
          position: { offset: Vec2.create({ x: 0, y: 40 }) },
        }}
        onClick={() => setCount(count + 1)}
      >
        <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
          增加
        </text>
      </box>
    </box>
  );
}

React.render(<Counter />, ui);
```

#### 函数式更新

当新状态依赖于之前的状态时，应该使用函数式更新：

tsx

```
// 不推荐 "直接更新"，直接使用当前作用域中的count值
setCount(count + 1);

// 推荐 "函数式更新"，传入一个函数，接收当前最新状态作为参数
setCount((prevCount) => prevCount + 1);
```

tsx

```
// 假设初始 count = 0

// 案例1：直接更新，两次调用会被合并，最终结果为1
function handleClick() {
  setCount(count + 1); // count是0
  setCount(count + 1); // count仍然是0，因为是闭包中的值
}

// 案例2：函数式更新，两次调用会依次执行，最终结果为2
function handleClick() {
  setCount((prev) => prev + 1); // prev是0，返回1
  setCount((prev) => prev + 1); // prev是1，返回2
}
```

### [useReducer](https://zh-hans.react.dev/reference/react/useReducer)

`useReducer`用于管理更复杂的状态逻辑：

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useReducer } = hooks;

// 定义 reducer 函数
function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  // 使用 reducer
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <box>
      <text>计数: {state.count}</text>
      <box
        style={{
          backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
          position: { offset: Vec2.create({ x: 0, y: 40 }) },
          size: { offset: Vec2.create({ x: 400, y: 40 }) },
        }}
        onClick={() => dispatch({ type: "increment" })}
      >
        <text>增加</text>
      </box>
      <box
        style={{
          backgroundColor: Vec3.create({ r: 255, g: 59, b: 48 }),
          position: { offset: Vec2.create({ x: 0, y: 80 }) },
          size: { offset: Vec2.create({ x: 400, y: 40 }) },
        }}
        onClick={() => dispatch({ type: "decrement" })}
      >
        <text>减少</text>
      </box>
    </box>
  );
}
React.render(<Counter />, ui);
```

## 副作用钩子 (Effect Hooks)

### [useEffect](https://zh-hans.react.dev/reference/react/useEffect)

`useEffect`用于处理副作用，如数据获取、订阅或手动修改 DOM：

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState, useEffect } = hooks;

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // 设置一个定时器
    const timer = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);

    // 清理函数
    return () => {
      clearInterval(timer);
    };
  }, []); // 空依赖数组表示只在组件挂载和卸载时执行

  return <text>已运行 {seconds} 秒</text>;
}
React.render(<Timer />, ui);
```

#### 依赖数组

`useEffect`的第二个参数是依赖数组，决定何时重新执行副作用：

1. **不提供**：每次渲染后执行
2. **空数组`[]`**：只在组件挂载和卸载时执行
3. **有依赖项`[a, b]`**：当依赖项变化时执行

tsx

```
// 每次渲染后执行
useEffect(() => {
  console.log("组件已更新");
});

// 只在挂载和卸载时执行
useEffect(() => {
  console.log("组件已挂载");
  return () => console.log("组件已卸载");
}, []);

// 当 count 变化时执行
useEffect(() => {
  console.log("count 已更新:", count);
}, [count]);
```

### [useLayoutEffect](https://zh-hans.react.dev/reference/react/useLayoutEffect)

`useLayoutEffect`与`useEffect`类似，但在浏览器重新绘制屏幕之前同步执行：

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useLayoutEffect, useState } = hooks;

/**
 * useLayoutEffect会在DOM更新后同步触发，在浏览器绘制前执行
 */
function LayoutEffectDemo() {
  const [size, setSize] = useState(100);
  const [position, setPosition] = useState(10);

  // 使用useLayoutEffect避免闪烁，在视觉更新前调整位置
  useLayoutEffect(() => {
    // 当尺寸变大时，自动调整位置确保不超出边界
    if (size > 150) {
      // 立即同步调整位置，避免先渲染大尺寸再调整导致的闪烁
      setPosition(20);
    }
  }, [size]); // 依赖于size的变化

  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 50, g: 100, b: 200 }),
        size: { offset: Vec2.create({ x: 300, y: 300 }) },
      }}
    >
      <text
        style={{
          textColor: Vec3.create({ r: 255, g: 255, b: 255 }),
          position: { offset: Vec2.create({ x: 10, y: 10 }) },
        }}
      >
        useLayoutEffect示例
      </text>

      <box
        style={{
          backgroundColor: Vec3.create({ r: 200, g: 50, b: 50 }),
          size: { offset: Vec2.create({ x: size, y: size }) },
          position: { offset: Vec2.create({ x: position, y: position }) },
        }}
      >
        <text
          style={{
            textColor: Vec3.create({ r: 255, g: 255, b: 255 }),
            position: { offset: Vec2.create({ x: 10, y: 10 }) },
          }}
        >
          {size}x{size}
        </text>
      </box>

      <box
        style={{
          backgroundColor: Vec3.create({ r: 30, g: 150, b: 30 }),
          size: { offset: Vec2.create({ x: 120, y: 40 }) },
          position: { offset: Vec2.create({ x: 10, y: 200 }) },
        }}
        onClick={() => setSize(size + 50)}
      >
        <text
          style={{
            textColor: Vec3.create({ r: 255, g: 255, b: 255 }),
            position: { offset: Vec2.create({ x: 10, y: 10 }) },
          }}
        >
          增加尺寸
        </text>
      </box>

      <box
        style={{
          backgroundColor: Vec3.create({ r: 150, g: 30, b: 150 }),
          size: { offset: Vec2.create({ x: 120, y: 40 }) },
          position: { offset: Vec2.create({ x: 150, y: 200 }) },
        }}
        onClick={() => setSize(100)}
      >
        <text
          style={{
            textColor: Vec3.create({ r: 255, g: 255, b: 255 }),
            position: { offset: Vec2.create({ x: 10, y: 10 }) },
          }}
        >
          重置
        </text>
      </box>
    </box>
  );
}

React.render(<LayoutEffectDemo />, ui);
```

## 上下文钩子 (Context Hooks)

### [useContext](https://zh-hans.react.dev/reference/react/useContext)

`useContext`用于访问 React 上下文：

tsx

```
import React, { hooksl, createContext } from "@dao3fun/react";
const { useContext } = hooks;

// 创建上下文
const ThemeContext = createContext("light");

function ThemedButton() {
  // 使用上下文
  const theme = useContext(ThemeContext);

  return (
    <box
      style={{
        backgroundColor:
          theme === "dark"
            ? Vec3.create({ r: 50, g: 50, b: 50 })
            : Vec3.create({ r: 240, g: 240, b: 240 }),
      }}
    >
      <text
        style={{
          textColor:
            theme === "dark"
              ? Vec3.create({ r: 255, g: 255, b: 255 })
              : Vec3.create({ r: 0, g: 0, b: 0 }),
        }}
      >
        当前主题: {theme}
      </text>
    </box>
  );
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}
React.render(<App />, ui);
```

## 记忆化钩子 (Memoization Hooks)

### [useMemo](https://zh-hans.react.dev/reference/react/useMemo)

`useMemo`用于记忆计算结果，避免昂贵的计算重复执行。当依赖项不变时，它会返回上一次计算的结果，而不是重新计算。

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useMemo, useState } = hooks;

function ExpensiveCalculation() {
  const [filter, setFilter] = useState("");
  const list = ["苹果", "香蕉", "橙子", "葡萄", "西瓜", "草莓"];

  // 模拟昂贵计算
  const filteredList = useMemo(() => {
    return list.filter((item) => item.includes(filter));
  }, [list, filter]); // 只有当list或filter变化时才重新计算

  return (
    <box style={{ backgroundColor: Vec3.create({ r: 240, g: 240, b: 240 }) }}>
      <text style={{ position: { offset: Vec2.create({ x: 0, y: 17 }) } }}>
        筛选词: {filter}
      </text>

      <box
        style={{
          backgroundColor: Vec3.create({ r: 200, g: 200, b: 200 }),
          position: { offset: Vec2.create({ x: 0, y: 50 }) },
          size: { offset: Vec2.create({ x: 200, y: 30 }) },
        }}
        onClick={() => setFilter(filter === "" ? "果" : "")}
      >
        {filter === "" ? "筛选带'果'的水果" : "清除筛选"}
      </box>

      <text style={{ position: { offset: Vec2.create({ x: 0, y: 80 }) } }}>
        过滤结果 ({filteredList.length}):
      </text>

      <box
        style={{
          position: { offset: Vec2.create({ x: 0, y: 120 }) },
          backgroundOpacity: 0,
        }}
      >
        {filteredList.map((item, index) => (
          <text
            style={{
              position: { offset: Vec2.create({ x: 0, y: index * 30 }) },
            }}
          >
            {item}
          </text>
        ))}
      </box>
    </box>
  );
}

React.render(<ExpensiveCalculation />, ui);
```

#### 使用场景

1. **优化昂贵计算**：复杂数据转换、过滤、排序等
2. **避免子组件不必要的重新渲染**：创建复杂对象时使用
3. **依赖于 props 或状态的计算**：当计算结果依赖于特定的 props 或状态时

#### 注意事项

- 不要过度使用，简单计算不需要使用`useMemo`
- 确保依赖数组包含所有计算中使用的变量
- 当依赖项很少变化时，`useMemo`最有效

### [useCallback](https://zh-hans.react.dev/reference/react/useCallback)

`useCallback`用于记忆回调函数，防止不必要的重新渲染：

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useCallback, useState } = hooks;

function ParentComponent() {
  const [count, setCount] = useState(0);

  // 记忆回调函数
  const handleClick = useCallback(() => {
    console.log("按钮被点击");
  }, []); // 空依赖数组表示函数不会重新创建

  return (
    <box>
      <text>计数: {count}</text>
      <box onClick={() => setCount(count + 1)}>
        <text>增加计数</text>
      </box>
      <ChildComponent onClick={handleClick} />
    </box>
  );
}

function ChildComponent({ onClick }) {
  console.log("子组件渲染");
  return (
    <box onClick={onClick}>
      <text>点击我</text>
    </box>
  );
}

React.render(<ParentComponent />, ui);
```

## 引用钩子 (Ref Hooks)

### [useRef](https://zh-hans.react.dev/reference/react/useRef)

`useRef`用于创建一个可变的引用，主要用于：

1. 访问 DOM 元素
2. 保存不触发重新渲染的可变值

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useEffect, useRef } = hooks;

function InputWithFocus() {
  // 创建引用
  const inputRef = useRef(null);

  // 挂载后1s聚焦输入框
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 1000);
  }, []);

  return (
    <input
      ref={inputRef}
      style={{
        position: { offset: Vec2.create({ x: 10, y: 10 }) },
        size: { offset: Vec2.create({ x: 200, y: 30 }) },
      }}
    />
  );
}

React.render(<InputWithFocus />, ui);
```

#### 保存可变值

tsx

```
function IntervalCounter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count; // 更新引用值
  }, [count]);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log("当前计数:", countRef.current);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <box onClick={() => setCount(count + 1)}>
      <text>计数: {count}</text>
    </box>
  );
}
```

## 性能优化钩子

### [useDeferredValue](https://zh-hans.react.dev/reference/react/useDeferredValue)

`useDeferredValue`允许你推迟更新 UI 的非关键部分，优先处理紧急更新。它接收一个值并返回该值的"延迟版本"，当紧急更新发生时，React 会先渲染使用当前值的 UI，然后在后台渲染使用延迟值的部分。

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState, useDeferredValue } = hooks;

function DeferredValueExample() {
  const [inputValue, setInputValue] = useState("");
  // 使用 useDeferredValue 创建一个延迟值
  const deferredValue = useDeferredValue(inputValue);

  // 创建大型数据列表
  const items = Array.from({ length: 500 }, (_, i) => `项目 ${i + 1}`);

  // 使用延迟值进行过滤操作
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(deferredValue.toLowerCase())
  );

  // 检查当前值与延迟值是否不同
  const isLoading = inputValue !== deferredValue;

  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 240, g: 240, b: 240 }),
        size: { offset: Vec2.create({ x: 400, y: 500 }) },
      }}
    >
      <text
        style={{
          position: { offset: Vec2.create({ x: 20, y: 20 }) },
          textFontSize: 22,
          textColor: Vec3.create({ r: 50, g: 50, b: 50 }),
        }}
      >
        useDeferredValue 示例
      </text>

      <input
        onBlur={(e) => setInputValue(e.target.textContent)}
        style={{
          position: { offset: Vec2.create({ x: 20, y: 60 }) },
          size: { offset: Vec2.create({ x: 360, y: 40 }) },
        }}
      >
        {inputValue}
      </input>

      <text
        style={{
          position: { offset: Vec2.create({ x: 20, y: 110 }) },
          textColor: isLoading
            ? Vec3.create({ r: 100, g: 100, b: 100 })
            : Vec3.create({ r: 50, g: 50, b: 50 }),
        }}
      >
        {isLoading ? "加载中..." : `共找到 ${filteredItems.length} 个匹配项`}
      </text>

      <box
        style={{
          position: { offset: Vec2.create({ x: 20, y: 140 }) },
          size: { offset: Vec2.create({ x: 360, y: 340 }) },
          backgroundColor: Vec3.create({ r: 255, g: 255, b: 255 }),
          backgroundOpacity: isLoading ? 0.7 : 1,
        }}
      >
        <box
          style={{
            position: { offset: Vec2.create({ x: 10, y: 10 }) },
            size: { offset: Vec2.create({ x: 340, y: 320 }) },
          }}
        >
          {filteredItems.slice(0, 8).map((item, index) => (
            <text
              style={{
                position: { offset: Vec2.create({ x: 0, y: index * 35 }) },
                textColor: isLoading
                  ? Vec3.create({ r: 150, g: 150, b: 150 })
                  : Vec3.create({ r: 30, g: 30, b: 30 }),
              }}
            >
              {item}
            </text>
          ))}

          {filteredItems.length > 8 && (
            <text
              style={{
                position: { offset: Vec2.create({ x: 0, y: 290 }) },
                textColor: Vec3.create({ r: 130, g: 130, b: 130 }),
              }}
            >
              还有 {filteredItems.length - 8} 个项...
            </text>
          )}
        </box>
      </box>
    </box>
  );
}

React.render(<DeferredValueExample />, ui);
```

#### 使用场景

1. **大型列表渲染**：当用户输入搜索词时，可以保持输入框响应流畅，同时在后台更新列表
2. **复杂数据可视化**：用户交互时保持 UI 响应，稍后更新复杂图表
3. **自动完成/建议**：输入时立即响应，略微延迟显示建议列表

#### 与防抖/节流的区别

- **防抖/节流**：完全阻止更新，直到经过一定时间
- **useDeferredValue**：不阻止更新，而是先渲染高优先级更新，然后在后台渲染低优先级更新

### [useTransition](https://zh-hans.react.dev/reference/react/useTransition)

`useTransition`允许你将某些状态更新标记为非紧急的，让 React 在不阻塞 UI 的情况下执行这些更新。它返回一个布尔值表示过渡状态和一个启动过渡的函数。

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState, useTransition } = hooks;

function TabsExample() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState("home");

  // 模拟大量内容
  const tabContent = {
    home: Array.from({ length: 500 }, (_, i) => `首页内容项 ${i + 1}`),
    about: Array.from({ length: 500 }, (_, i) => `关于内容项 ${i + 1}`),
    contact: Array.from({ length: 500 }, (_, i) => `联系内容项 ${i + 1}`),
  };

  const handleTabChange = (newTab) => {
    // 将标签切换标记为过渡
    startTransition(() => {
      setTab(newTab);
    });
  };

  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 245, g: 245, b: 245 }),
        size: { offset: Vec2.create({ x: 500, y: 500 }) },
      }}
    >
      <text
        style={{
          position: { offset: Vec2.create({ x: 20, y: 20 }) },
          textFontSize: 20,
        }}
      >
        选项卡示例
      </text>

      <box
        style={{
          position: { offset: Vec2.create({ x: 20, y: 60 }) },
          size: { offset: Vec2.create({ x: 460, y: 50 }) },
          backgroundColor: Vec3.create({ r: 255, g: 255, b: 255 }),
        }}
      >
        {["home", "about", "contact"].map((tabName) => (
          <box
            style={{
              backgroundColor:
                tab === tabName
                  ? Vec3.create({ r: 33, g: 150, b: 243 })
                  : Vec3.create({ r: 224, g: 224, b: 224 }),
              position: {
                offset: Vec2.create({
                  x: ["home", "about", "contact"].indexOf(tabName) * 150 + 10,
                  y: 10,
                }),
              },
              size: { offset: Vec2.create({ x: 140, y: 30 }) },
            }}
            onClick={() => handleTabChange(tabName)}
          >
            {tabName === "home"
              ? "首页"
              : tabName === "about"
              ? "关于"
              : "联系"}
          </box>
        ))}
      </box>

      {isPending && (
        <text
          style={{
            position: { offset: Vec2.create({ x: 20, y: 120 }) },
            textColor: Vec3.create({ r: 150, g: 150, b: 150 }),
          }}
        >
          加载中...
        </text>
      )}

      <box
        style={{
          position: { offset: Vec2.create({ x: 20, y: 150 }) },
          size: { offset: Vec2.create({ x: 460, y: 330 }) },
          backgroundColor: Vec3.create({ r: 255, g: 255, b: 255 }),
          backgroundOpacity: isPending ? 0.7 : 1,
        }}
      >
        <box
          style={{
            size: { offset: Vec2.create({ x: 440, y: 310 }) },
            position: { offset: Vec2.create({ x: 10, y: 10 }) },
          }}
        >
          {tabContent[tab].slice(0, 10).map((item, index) => (
            <text
              style={{
                position: { offset: Vec2.create({ x: 0, y: index * 30 }) },
              }}
            >
              {item}
            </text>
          ))}

          {tabContent[tab].length > 10 && (
            <text
              style={{
                position: { offset: Vec2.create({ x: 0, y: 300 }) },
                textColor: Vec3.create({ r: 100, g: 100, b: 100 }),
              }}
            >
              ...还有 {tabContent[tab].length - 10} 项
            </text>
          )}
        </box>
      </box>
    </box>
  );
}

React.render(<TabsExample />, ui);
```

#### 使用场景

1. **页面切换**：在切换到需要大量计算的页面时保持 UI 响应
2. **过滤大数据集**：在更新筛选条件时不阻塞用户界面
3. **导航交互**：确保导航动作保持流畅，即使目标页内容复杂

#### 与`useDeferredValue`的区别

- **useTransition**: 用于包装状态更新函数
- **useDeferredValue**: 用于包装值本身

### [useImperativeHandle](https://zh-hans.react.dev/reference/react/useImperativeHandle)

`useImperativeHandle`允许你自定义通过 ref 暴露给父组件的实例值。它通常与`forwardRef`一起使用，让你可以精确控制子组件通过 ref 暴露什么给父组件。

tsx

```
import React, { hooks, forwardRef } from "@dao3fun/react";
const { useImperativeHandle, useRef } = hooks;

interface CustomInputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

// 使用forwardRef创建可被引用的子组件
const CustomInput = forwardRef((props, ref) => {
  // 组件内部状态
  const [value, setValue] = useState(props.defaultValue || "");
  const inputRef = useRef(null);

  // 使用useImperativeHandle暴露指定方法给父组件
  useImperativeHandle(
    ref,
    () => ({
      // 聚焦输入框
      focus: () => {
        inputRef.current?.focus();
        console.log("输入框获得焦点");
      },
      // 清空输入框
      clear: () => {
        setValue("");
        console.log("输入框已清空");
      },
      // 获取当前值
      getValue: () => {
        console.log("获取输入值:", value);
        return value;
      },
    }),
    [value]
  );

  return (
    <input
      ref={inputRef}
      style={{
        position: { offset: Vec2.create({ x: 0, y: 0 }) },
        size: { offset: Vec2.create({ x: 200, y: 40 }) },
        backgroundColor: Vec3.create({ r: 255, g: 255, b: 255 }),
      }}
      onBlur={(e) => setValue(e.target.textContent)}
    >
      {value}
    </input>
  );
});

// 父组件
function ImperativeHandleExample() {
  // 创建对子组件的引用
  const inputRef = useRef<CustomInputHandle>(null);

  // 处理按钮点击事件
  const handleFocus = () => {
    // 调用子组件暴露的方法
    inputRef.current?.focus();
  };

  const handleClear = () => {
    inputRef.current?.clear();
  };

  const handleGetValue = () => {
    const value = inputRef.current?.getValue() || "";
    console.log(`当前输入值: ${value}`);
  };

  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 240, g: 240, b: 245 }),
        size: { offset: Vec2.create({ x: 400, y: 300 }) },
      }}
    >
      <text
        style={{
          position: { offset: Vec2.create({ x: 20, y: 20 }) },
          textFontSize: 18,
          textColor: Vec3.create({ r: 40, g: 40, b: 40 }),
        }}
      >
        useImperativeHandle 和 forwardRef 示例
      </text>

      {/* 使用ref引用子组件 */}
      <box style={{ position: { offset: Vec2.create({ x: 20, y: 60 }) } }}>
        <CustomInput ref={inputRef} defaultValue="请输入文本" />
      </box>

      {/* 控制按钮 */}
      <box
        style={{
          position: { offset: Vec2.create({ x: 20, y: 120 }) },
          size: { offset: Vec2.create({ x: 330, y: 50 }) },
        }}
      >
        {/* 聚焦按钮 */}
        <box
          style={{
            backgroundColor: Vec3.create({ r: 30, g: 144, b: 255 }),
            size: { offset: Vec2.create({ x: 100, y: 40 }) },
          }}
          onClick={handleFocus}
        >
          <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
            聚焦
          </text>
        </box>

        {/* 清空按钮 */}
        <box
          style={{
            backgroundColor: Vec3.create({ r: 255, g: 69, b: 0 }),
            size: { offset: Vec2.create({ x: 100, y: 40 }) },
            position: { offset: Vec2.create({ x: 110, y: 0 }) },
          }}
          onClick={handleClear}
        >
          <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
            清空
          </text>
        </box>

        {/* 获取值按钮 */}
        <box
          style={{
            backgroundColor: Vec3.create({ r: 46, g: 139, b: 87 }),
            size: { offset: Vec2.create({ x: 100, y: 40 }) },
            position: { offset: Vec2.create({ x: 220, y: 0 }) },
          }}
          onClick={handleGetValue}
        >
          <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
            获取值
          </text>
        </box>
      </box>

      <text
        style={{
          position: { offset: Vec2.create({ x: 20, y: 180 }) },
          textColor: Vec3.create({ r: 100, g: 100, b: 100 }),
        }}
      >
        点击按钮来控制输入框，查看控制台输出
      </text>
    </box>
  );
}

React.render(<ImperativeHandleExample />, ui);
```

#### 使用场景

1. **封装复杂的命令式逻辑**：当组件内部有复杂的命令式 API 需要暴露时
2. **限制对子组件的访问**：只暴露特定的功能，隐藏其他细节
3. **自定义组件库开发**：创建符合特定接口的组件

#### 最佳实践

1. **谨慎使用**：命令式代码应当限制在必要的场景
2. **保持简单**：只暴露真正需要的方法
3. **缓存返回对象**：在依赖项变化时才创建新的对象

## 自定义钩子 (Custom Hooks)

自定义钩子是一种复用组件逻辑的方式，以`use`开头命名：

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState } = hooks;

// 自定义钩子
function useSum(a: number, b: number): [number, (value: number) => void] {
  // 获取初始值
  const [value, setValue] = useState<number>(a + b);

  // 设置值的函数
  const setSumValue = (newValue: number) => {
    setValue(newValue);
  };

  return [value, setSumValue];
}

// 使用自定义钩子
function App() {
  const [sum, setSum] = useSum(1, 2);

  return (
    <box>
      <text>当前总和: {sum}</text>
      <box
        style={{
          backgroundColor: Vec3.create({ r: 30, g: 150, b: 30 }),
          size: { offset: Vec2.create({ x: 400, y: 40 }) },
          position: { offset: Vec2.create({ x: 0, y: 50 }) },
        }}
        onClick={() => setSum(sum + 1)}
      >
        增加
      </box>
    </box>
  );
}

React.render(<App />, ui);
```

## 最佳实践

### 钩子使用规则

1. **只在顶层调用钩子**
  - 始终在 React 函数组件或自定义钩子的顶层使用钩子
  - 不要在条件语句、循环或嵌套函数中调用钩子
  - 确保钩子的调用顺序在每次渲染中保持一致
2. **命名规范**
  - 自定义钩子必须以`use`开头，如`useFormInput`,`useLocalStorage`
  - 钩子返回的更新函数通常以`set`开头，如`setCount`,`setName`

### 状态管理

1. **状态粒度**
  - 相关状态应当合并为对象
  - 独立状态应当分开管理
  - 对于复杂状态逻辑，使用`useReducer`代替多个`useState`
2. **状态更新最佳实践**
  - 当新状态依赖于前一个状态时，使用函数式更新`setState(prev => prev + 1)`
  - 合并相关状态更新以避免多次渲染
  - 状态值应该是不可变的，不要直接修改状态对象

### 副作用管理

1. **依赖数组管理**
  - 总是提供完整的依赖数组，包含所有在副作用中使用的变量
  - 使用 ESLint 的`exhaustive-deps`规则检查遗漏的依赖项
  - 当需要跳过副作用时，考虑使用`useRef`存储可变值
2. **清理函数**
  - 在`useEffect`中返回清理函数以防止内存泄漏
  - 清理函数应该停止计时器、取消订阅和释放资源
  - 确保清理函数的逻辑与设置逻辑对称

### 性能优化

1. **避免不必要的重新渲染**
  - 使用`React.memo`缓存组件渲染结果
  - 使用`useMemo`避免复杂计算被重复执行
  - 使用`useCallback`避免传递新函数导致子组件重新渲染
2. **延迟加载与优先级**
  - 对于低优先级更新，使用`useTransition`或`useDeferredValue`
  - 大列表渲染时考虑虚拟化或分页
  - 为重型计算任务使用`useEffect`配合`useState`实现异步处理

### 构建可复用钩子

1. **自定义钩子设计**
  - 遵循单一职责原则，每个钩子只做一件事
  - 返回值使用数组或对象，便于解构赋值
  - 为复杂钩子提供默认参数值和配置选项
2. **组合钩子**
  - 通过组合多个基础钩子构建复杂功能
  - 避免在钩子间传递过多的上下文，优先使用参数
  - 保持自定义钩子之间的低耦合，高内聚
