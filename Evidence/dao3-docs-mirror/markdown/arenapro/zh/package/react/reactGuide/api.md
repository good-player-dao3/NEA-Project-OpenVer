---
title: "React API 参考"
source: "https://docs.dao3.fun/arenapro/zh/package/react/reactGuide/api.html"
---

# React API 参考

本文档提供了 React 中关键 API 的使用说明和示例，重点关注性能优化相关的 API。

## [createContext](https://zh-hans.react.dev/reference/react/createContext)

`createContext`用于创建一个上下文（Context），使组件树中的组件可以共享数据，而不必通过 props 层层传递。

### 基本用法

tsx

```
import React, { hooks, createContext } from "@dao3fun/react";
const { useContext, useState } = hooks;

// 创建上下文
const ThemeContext = createContext("light");

// 子组件通过useContext访问上下文
function ThemedButton() {
  // 使用上下文中的值
  const theme = useContext(ThemeContext);

  return (
    <box
      style={{
        backgroundColor:
          theme === "dark"
            ? Vec3.create({ r: 50, g: 50, b: 50 })
            : Vec3.create({ r: 240, g: 240, b: 240 }),
        size: { offset: Vec2.create({ x: 120, y: 40 }) },
      }}
    >
      <text
        style={{
          textColor:
            theme === "dark"
              ? Vec3.create({ r: 255, g: 255, b: 255 })
              : Vec3.create({ r: 50, g: 50, b: 50 }),
        }}
      >
        当前主题: {theme}
      </text>
    </box>
  );
}

// 中间组件，不需要关心theme
function Toolbar() {
  return (
    <box>
      <ThemedButton />
    </box>
  );
}

// 根组件提供上下文值
function App() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={theme}>
      <box>
        <Toolbar />
        <box
          style={{
            backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
            size: { offset: Vec2.create({ x: 150, y: 40 }) },
            position: { offset: Vec2.create({ x: 0, y: 50 }) },
          }}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
            切换主题
          </text>
        </box>
      </box>
    </ThemeContext.Provider>
  );
}
```

### 提供默认值

创建上下文时可以提供默认值，当组件树中没有匹配的 Provider 时使用：

tsx

```
// 设置默认主题为"light"
const ThemeContext = createContext("light");
```

### 嵌套 Provider

Context Provider 可以嵌套使用，内层 Provider 会覆盖外层的值：

tsx

```
function NestedProviders() {
  return (
    <ThemeContext.Provider value="dark">
      <box>
        {/* 这里的组件会接收到"dark"主题 */}
        <ThemedButton />

        <ThemeContext.Provider value="light">
          {/* 这里的组件会接收到"light"主题 */}
          <ThemedButton />
        </ThemeContext.Provider>
      </box>
    </ThemeContext.Provider>
  );
}
```

### 最佳实践

1. **避免过度使用**：只用于确实需要在组件树多个层级共享的数据
2. **拆分上下文**：不同类型的数据使用不同的 Context
3. **考虑性能**：Context 值变化会导致所有消费它的组件重新渲染

## [forwardRef](https://zh-hans.react.dev/reference/react/forwardRef)

`forwardRef`允许组件接收父组件传递的 ref，并将其转发到子组件中的 DOM 元素或组件实例。

### 基本用法

tsx

```
import React, { hooks, forwardRef } from "@dao3fun/react";
const { useRef } = hooks;

// 使用forwardRef创建可转发ref的组件
const CustomInput = forwardRef((props, ref) => {
  return (
    <input
      ref={ref}
      style={{
        size: { offset: Vec2.create({ x: 200, y: 40 }) },
        backgroundColor: Vec3.create({ r: 245, g: 245, b: 245 }),
      }}
      onBlur={(e) => props.onUpdate && props.onUpdate(e.target.textContent)}
    >
      {props.defaultValue || ""}
    </input>
  );
});

// 使用带有ref的组件
function Form() {
  const inputRef = useRef(null);

  const focusInput = () => {
    // 可以直接访问input元素
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <box>
      <CustomInput ref={inputRef} defaultValue="请输入内容" />

      <box
        style={{
          backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
          size: { offset: Vec2.create({ x: 120, y: 40 }) },
          position: { offset: Vec2.create({ x: 0, y: 50 }) },
        }}
        onClick={focusInput}
      >
        <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
          聚焦输入框
        </text>
      </box>
    </box>
  );
}
```

### 与 useImperativeHandle 结合

结合`useImperativeHandle`可以自定义暴露给父组件的实例值：

tsx

```
import React, { hooks, forwardRef } from "@dao3fun/react";
const { useImperativeHandle, useRef, useState } = hooks;

// 定义组件实例接口
interface InputHandles {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

// 创建自定义操作的输入框
const CustomInput = forwardRef<InputHandles>((props, ref) => {
  const [value, setValue] = useState(props.defaultValue || "");
  const inputRef = useRef(null);

  // 自定义暴露的方法
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      clear: () => {
        setValue("");
      },
      getValue: () => {
        return value;
      },
    }),
    [value]
  );

  return (
    <input
      ref={inputRef}
      style={{
        size: { offset: Vec2.create({ x: 200, y: 40 }) },
        backgroundColor: Vec3.create({ r: 245, g: 245, b: 245 }),
      }}
      onBlur={(e) => setValue(e.target.textContent)}
    >
      {value}
    </input>
  );
});

// 使用带有增强功能的组件
function EnhancedForm() {
  const inputRef = useRef<InputHandles>(null);

  const handleClear = () => {
    inputRef.current?.clear();
  };

  const handleGetValue = () => {
    const value = inputRef.current?.getValue() || "";
    console.log("当前值:", value);
  };

  return (
    <box>
      <CustomInput ref={inputRef} defaultValue="请输入内容" />

      <box style={{ position: { offset: Vec2.create({ x: 0, y: 50 }) } }}>
        <box
          style={{
            backgroundColor: Vec3.create({ r: 255, g: 59, b: 48 }),
            size: { offset: Vec2.create({ x: 100, y: 40 }) },
          }}
          onClick={handleClear}
        >
          <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
            清空
          </text>
        </box>

        <box
          style={{
            backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
            size: { offset: Vec2.create({ x: 100, y: 40 }) },
            position: { offset: Vec2.create({ x: 110, y: 0 }) },
          }}
          onClick={handleGetValue}
        >
          <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
            获取值
          </text>
        </box>
      </box>
    </box>
  );
}
```

### 使用场景

1. **访问 DOM 元素**：需要直接操作组件内部的 DOM 元素
2. **构建可复用组件库**：为组件用户提供命令式 API
3. **第三方集成**：与需要引用的第三方库集成

## [startTransition](https://zh-hans.react.dev/reference/react/startTransition)

`startTransition`用于标记非紧急的状态更新，使 UI 保持响应性，即使在大型更新期间也能接收用户输入。

### 基本用法

tsx

```
import React, { hooks, startTransition } from "@dao3fun/react";
const { useState } = hooks;

function TabsExample() {
  const [tab, setTab] = useState("home");
  const [isPending, setIsPending] = useState(false);

  // 模拟大量内容
  const tabContent = {
    home: Array.from({ length: 500 }, (_, i) => `首页内容项 ${i + 1}`),
    about: Array.from({ length: 500 }, (_, i) => `关于内容项 ${i + 1}`),
    contact: Array.from({ length: 500 }, (_, i) => `联系内容项 ${i + 1}`),
  };

  const handleTabChange = (newTab) => {
    // 标记为过渡更新
    setIsPending(true);
    startTransition(() => {
      setTab(newTab);
      setIsPending(false);
    });
  };

  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 245, g: 245, b: 245 }),
        size: { offset: Vec2.create({ x: 500, y: 500 }) },
      }}
    >
      {/* 标签栏 */}
      <box
        style={{
          position: { offset: Vec2.create({ x: 20, y: 20 }) },
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
            <text>
              {tabName === "home"
                ? "首页"
                : tabName === "about"
                ? "关于"
                : "联系"}
            </text>
          </box>
        ))}
      </box>

      {/* 加载指示器 */}
      {isPending && (
        <text
          style={{
            position: { offset: Vec2.create({ x: 20, y: 80 }) },
            textColor: Vec3.create({ r: 150, g: 150, b: 150 }),
          }}
        >
          加载中...
        </text>
      )}

      {/* 内容区域 */}
      <box
        style={{
          position: { offset: Vec2.create({ x: 20, y: 100 }) },
          size: { offset: Vec2.create({ x: 460, y: 380 }) },
          backgroundColor: Vec3.create({ r: 255, g: 255, b: 255 }),
          backgroundOpacity: isPending ? 0.7 : 1,
        }}
      >
        <box
          style={{
            position: { offset: Vec2.create({ x: 10, y: 10 }) },
            size: { offset: Vec2.create({ x: 440, y: 360 }) },
          }}
        >
          {/* 显示部分内容项 */}
          {tabContent[tab].slice(0, 10).map((item, index) => (
            <text
              style={{
                position: { offset: Vec2.create({ x: 0, y: index * 30 }) },
                textColor: isPending
                  ? Vec3.create({ r: 180, g: 180, b: 180 })
                  : Vec3.create({ r: 50, g: 50, b: 50 }),
              }}
            >
              {item}
            </text>
          ))}

          {/* 显示剩余项目数量 */}
          {tabContent[tab].length > 10 && (
            <text
              style={{
                position: { offset: Vec2.create({ x: 0, y: 330 }) },
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
```

### useTransition 钩子

React 还提供了`useTransition`钩子，它返回一个状态标志和一个函数，避免手动管理 pending 状态：

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useTransition, useState } = hooks;

function ImprovedTabsExample() {
  const [tab, setTab] = useState("home");
  // 获取isPending状态和startTransition函数
  const [isPending, startTransition] = useTransition();

  // 与前面相同的内容...

  const handleTabChange = (newTab) => {
    // 使用来自钩子的startTransition
    startTransition(() => {
      setTab(newTab);
    });
  };

  // 其余代码与前例类似...
}
```

### 使用场景

1. **导航更新**：在页面导航时保持 UI 响应
2. **搜索结果**：在用户输入时保持输入流畅，延迟显示结果
3. **复杂数据更新**：需要处理大量数据时保持 UI 响应性
4. **多步骤表单**：在表单提交流程中保持响应性

### 注意事项

1. **紧急与非紧急更新**：区分哪些更新需要立即执行，哪些可以延迟
2. **过渡不会取消**：过渡更新只是降低优先级，不会被取消
3. **适用范围**：仅适用于 React 状态更新，不适用于数据加载或异步操作

## [memo](https://zh-hans.react.dev/reference/react/memo)

`memo`是一个高阶组件，用于优化函数组件的渲染性能。它通过记忆组件渲染结果，在 props 没有变化时跳过重新渲染。

### 基本用法

tsx

```
import React, { memo, hooks } from "@dao3fun/react";
const { useState } = hooks;

// 未优化的组件
function Button({ label, onClick }) {
  console.log("Button 组件渲染", label);
  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 66, g: 133, b: 244 }),
        size: { offset: Vec2.create({ x: 120, y: 40 }) },
      }}
      onClick={onClick}
    >
      <text
        style={{
          textColor: Vec3.create({ r: 255, g: 255, b: 255 }),
          position: { offset: Vec2.create({ x: 10, y: 10 }) },
        }}
      >
        {label}
      </text>
    </box>
  );
}

// 使用 memo 优化的组件
const MemoizedButton = memo(Button);

// 使用示例
function App() {
  const [count, setCount] = useState(0);

  // 这个处理函数每次渲染都会创建新实例
  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <box>
      <text>计数: {count}</text>

      {/* 未优化的按钮，每次父组件渲染都会重新渲染 */}
      <box style={{ position: { offset: Vec2.create({ x: 0, y: 50 }) } }}>
        <Button label="普通按钮" onClick={handleClick} />
      </box>

      {/* 优化的按钮，但因为 onClick 每次都是新函数，仍会重新渲染 */}
      <box style={{ position: { offset: Vec2.create({ x: 0, y: 100 }) } }}>
        <MemoizedButton label="Memo按钮(仍会重渲染)" onClick={handleClick} />
      </box>
    </box>
  );
}
```

### 自定义比较函数

`memo`接受一个可选的第二个参数，用于自定义前后 props 的比较逻辑：

tsx

```
const MemoizedComponent = memo(MyComponent, (prevProps, nextProps) => {
  // 返回 true 表示组件不需要重新渲染
  // 返回 false 表示组件需要重新渲染
  return prevProps.value === nextProps.value;
});
```

### 与 useCallback 配合使用

要充分发挥`memo`的效果，通常需要与`useCallback`配合使用，确保传递给子组件的函数引用保持稳定：

tsx

```
function OptimizedApp() {
  const [count, setCount] = useState(0);

  // 使用 useCallback 记忆函数引用
  const handleClick = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []); // 空依赖数组，函数引用永远不变

  return (
    <box>
      <text>计数: {count}</text>

      {/* 现在这个组件只会在 label 变化时重新渲染 */}
      <box style={{ position: { offset: Vec2.create({ x: 0, y: 50 }) } }}>
        <MemoizedButton label="优化的按钮" onClick={handleClick} />
      </box>
    </box>
  );
}
```

### 何时使用 memo

`memo`在以下情况下特别有用：

1. **组件渲染开销大**：组件包含复杂计算或大量 DOM 元素
2. **组件频繁重新渲染**：父组件经常更新，但子组件的 props 很少变化
3. **组件在列表中重复使用**：在`map`循环中渲染的组件，尤其是大型列表

tsx

```
// 列表项组件优化示例
const ListItem = memo(({ item, onSelect }) => {
  console.log("渲染项目:", item.id);
  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 240, g: 240, b: 240 }),
        size: { offset: Vec2.create({ x: 300, y: 40 }) },
      }}
      onClick={() => onSelect(item.id)}
    >
      <text>{item.name}</text>
    </box>
  );
});

function List({ items }) {
  const [selectedId, setSelectedId] = useState(null);

  // 记忆选择函数
  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  return (
    <box>
      {items.map((item) => (
        <ListItem key={item.id} item={item} onSelect={handleSelect} />
      ))}
      <text>已选择: {selectedId}</text>
    </box>
  );
}
```

### 注意事项

1. **不要过度使用**：对于渲染开销很小的组件，`memo`可能会增加不必要的复杂度
2. **检查依赖项**：确保传递给记忆化组件的 props 是稳定的（使用`useCallback`、`useMemo`处理函数和对象）
3. **深度比较陷阱**：默认使用浅比较，对于复杂对象需要自定义比较函数或使用`useMemo`保持引用稳定

## 最佳实践

### 何时使用记忆化优化

1. **先测量，后优化**：使用开发工具确认性能瓶颈，再有针对性地优化
2. **关注热路径**：优先优化频繁渲染且计算密集的组件
3. **保持 props 稳定性**：使用`useCallback`、`useMemo`稳定 props 引用

### 避免的陷阱

1. **内联对象和函数**：避免直接在 JSX 中创建对象和函数tsx`// 不推荐 - 每次渲染都创建新对象<MemoizedComponentstyle={{ color:"red"}} />;// 推荐 - 使用 useMemo 稳定对象引用conststyle=useMemo(()=>({ color:"red"}), []);<MemoizedComponentstyle={style} />;`
2. **不必要的记忆化**：不要对简单组件应用`memo`tsx`// 通常不需要记忆化的简单组件constLabel=({text})=><text>{text}</text>;`
3. **忽略依赖项**：确保`useCallback`和`useMemo`的依赖数组包含所有必要依赖tsx`// 错误 - 缺少依赖项consthandleClick=useCallback(()=>{console.log(value);// value 是外部变量}, []);// 应该包含 [value]`

### 性能优化策略

性能优化应当遵循以下策略：

1. 首先确保组件设计合理，避免不必要的嵌套和渲染
2. 合理拆分组件，将变化频繁的部分与稳定的部分分离
3. 谨慎使用`memo`、`useCallback`和`useMemo`
4. 对于极端性能要求的场景，考虑使用虚拟滚动等技术
