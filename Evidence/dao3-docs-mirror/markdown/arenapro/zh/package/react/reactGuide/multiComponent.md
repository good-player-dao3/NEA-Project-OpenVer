---
title: "多组件开发"
source: "https://docs.dao3.fun/arenapro/zh/package/react/reactGuide/multiComponent.html"
---

# 多组件开发

在 React 中，组件是构建用户界面的基本单位。合理组织和复用组件是开发高效、可维护应用的关键。本文介绍多组件开发的最佳实践。

## 组件拆分原则

### 1. 单一职责原则

每个组件应该只负责一个功能，这样组件更容易维护和测试：

❌**不推荐**：一个组件做太多事情

tsx

```
function UserProfile() {
  return (
    <box>
      <text>用户信息</text>
      <text>用户名</text>
      <text>用户等级</text>
      <text>用户成就</text>
    </box>
  );
}

React.render(<UserProfile />, ui);
```

✅**推荐**：拆分为多个小组件

tsx

```
function UserProfile() {
  return (
    <box>
      <UserHeader />
      <UserInfo />
      <UserAchievements />
    </box>
  );
}

function UserHeader() {
  return <text>用户信息</text>;
}

function UserInfo() {
  return (
    <box>
      <text>用户名</text>
      <text>用户等级</text>
    </box>
  );
}

function UserAchievements() {
  return <text>用户成就</text>;
}

React.render(<UserProfile />, ui);
```

### 2. 组件复用

将可复用的部分提取为独立组件，可以减少重复代码，提高开发效率：

tsx

```
// 可复用的按钮组件
function Button({ text, y, onClick }) {
  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 209, g: 194, b: 26 }),
        position: { offset: Vec2.create({ x: 0, y: y * 160 }) },
      }}
      onClick={onClick}
    >
      <text style={{ textColor: Vec3.create({ r: 47, g: 90, b: 4 }) }}>
        {text}
      </text>
    </box>
  );
}

// 使用按钮组件
function LoginForm() {
  return (
    <>
      <Button text="登录" y={1} onClick={() => console.log("登录")} />
      <Button text="注册" y={2} onClick={() => console.log("注册")} />
    </>
  );
}

React.render(<LoginForm />, ui);
```

## 组件通信

### 1. Props 传递

Props 是组件间通信的基本方式，用于从父组件向子组件传递数据和回调函数：

tsx

```
// 父组件
function Parent() {
  const [count, setCount] = useState(1);
  return (
    <>
      <Child count={count} onIncrement={() => setCount((count) => count + 1)} />
    </>
  );
}

// 子组件
function Child({ count, onIncrement }) {
  return (
    <box>
      <text>计数: {count}</text>
      <Button text="增加" onClick={onIncrement} />
    </box>
  );
}

function Button({ text, onClick }) {
  return (
    <text
      style={{
        textColor: Vec3.create({ r: 47, g: 90, b: 4 }),
        position: { offset: Vec2.create({ x: 0, y: 60 }) },
      }}
      onClick={onClick}
    >
      {text}
    </text>
  );
}
```

### 2. Context API

Context API 用于跨多层组件传递数据，避免 props 逐层传递（也称为 "prop drilling"）：

tsx

```
import React from "./index";
import { createContext, useContext, useState } from "./lib/hooks";

// 主题颜色配置
const themes = {
  light: {
    background: Vec3.create({ r: 240, g: 240, b: 240 }),
    text: Vec3.create({ r: 30, g: 30, b: 30 }),
    primary: Vec3.create({ r: 0, g: 122, b: 255 }),
  },
  dark: {
    background: Vec3.create({ r: 30, g: 30, b: 30 }),
    text: Vec3.create({ r: 240, g: 240, b: 240 }),
    primary: Vec3.create({ r: 10, g: 132, b: 255 }),
  },
};

// 创建 Context
const ThemeContext = createContext({
  theme: "light",
  colors: themes.light,
  setTheme: (theme) => {},
});

// 提供者组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // 计算当前主题的颜色
  const colors = themes[theme];

  // 包含主题名称和对应的颜色值
  const themeValue = {
    theme,
    colors,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
}

// 主应用组件
function App() {
  const { theme, colors } = useContext(ThemeContext);

  return (
    <box
      style={{
        backgroundColor: colors.background,
        size: { offset: Vec2.create({ x: 400, y: 300 }) },
      }}
    >
      <text
        style={{
          textColor: colors.text,
          position: { offset: Vec2.create({ x: 20, y: 20 }) },
        }}
      >
        当前主题: {theme === "light" ? "浅色" : "深色"}
      </text>

      <ThemedButton />
    </box>
  );
}

// 主题切换按钮
function ThemedButton() {
  const { theme, colors, setTheme } = useContext(ThemeContext);

  return (
    <Button
      text={`切换主题`}
      colors={colors}
      onClick={() =>
        setTheme((theme: string) => (theme === "light" ? "dark" : "light"))
      }
    />
  );
}

// 按钮组件
function Button({ text, colors, onClick }) {
  return (
    <box
      style={{
        backgroundColor: colors.primary,
        size: { offset: Vec2.create({ x: 120, y: 40 }) },
        position: { offset: Vec2.create({ x: 20, y: 60 }) },
      }}
      onClick={onClick}
    >
      <text
        style={{
          textColor: Vec3.create({ r: 255, g: 255, b: 255 }),
          position: { offset: Vec2.create({ x: 10, y: 10 }) },
        }}
      >
        {text}
      </text>
    </box>
  );
}

// 使用Provider包装应用
React.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
  ui
);
```

## 组件组合

### 1. 容器组件模式

将数据获取逻辑与展示逻辑分离，容器组件负责获取数据，展示组件负责渲染界面：

tsx

```
// 容器组件
function UserListContainer() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 获取用户数据
    fetchUsers().then(setUsers);
  }, []);

  return <UserList users={users} />;
}

// 展示组件
function UserList({ users }) {
  return (
    <box>
      {users.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}
    </box>
  );
}
```

### 2. 高阶组件

高阶组件（HOC）是一种复用组件逻辑的高级模式，它接收一个组件并返回一个新组件：

tsx

```
// 高阶组件
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <text>加载中...</text>;
    }
    return <Component {...props} />;
  };
}

// 使用高阶组件
const UserListWithLoading = withLoading(UserList);
```

## 组件样式

### 1. 内联样式

React 支持直接在组件中使用内联样式：

tsx

```
function StyledBox() {
  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 240, g: 240, b: 240 }),
        size: { offset: Vec2.create({ x: 100, y: 100 }) },
      }}
    >
      <text>带样式的盒子</text>
    </box>
  );
}
```

### 2. 样式对象复用

将样式定义为常量，可以在多个组件中复用：

tsx

```
// 样式常量
const styles = {
  backgroundColor: Vec3.create({ r: 240, g: 240, b: 240 }),
  size: { offset: Vec2.create({ x: 100, y: 100 }) },
};

function StyledComponent() {
  return (
    <box style={styles}>
      <text style={styles}>标题</text>
    </box>
  );
}
```

## 最佳实践

### 组件设计

1. **组件命名**
  - 使用 PascalCase 命名组件 (如`UserProfile`)
  - 文件名与组件名保持一致
  - 使用有意义的名称，反映组件的用途
2. **组件组织**
  - 相关组件放在同一目录
  - 使用 index.tsx 导出组件
  - 按功能或页面划分目录结构

### 性能与状态

1. **Props 设计**
  - 使用 TypeScript 定义 Props 类型
  - 为可选 Props 提供默认值
  - 避免传递过多 Props，考虑使用对象合并
2. **性能优化**
  - 使用函数更新状态`setState(count => count + 1)`
  - 避免在渲染时创建新的样式对象
  - 使用 Fragment`<>...</>`避免额外的 DOM 节点
3. **状态管理**
  - 将状态尽可能保持在低层级
  - 使用 Context 管理全局状态
  - 复杂应用考虑使用状态管理库
