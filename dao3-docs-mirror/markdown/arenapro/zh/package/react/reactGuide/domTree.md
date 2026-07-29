---
title: "React DOM 树结构"
source: "https://docs.dao3.fun/arenapro/zh/package/react/reactGuide/domTree.html"
---

# React DOM 树结构

React 使用虚拟 DOM 来高效地更新和渲染用户界面。理解 DOM 树的结构对于优化 React 应用性能非常重要。

## 标签对照表

| React 标签 | 对应 UI 组件 | 说明 |
| --- | --- | --- |
| `<box />` | `UiBox` | 容器组件 |
| `<text />` | `UiText` | 文本组件 |
| `<image />` | `UiImage` | 图片组件 |
| `<input />` | `UiInput` | 输入组件 |
| `<scrollBox />` | `UiScrollBox` | 滚动框组件 |

## 组件树示例

### 用 box 包装（推荐）

tsx

```
function App() {
  return (
    <box>
      <box>
        <text>标题</text>
        <image style={{ image: "logo.png" }} />
      </box>
      <box>
        <text>内容</text>
        <box>
          <text>子内容</text>
        </box>
      </box>
    </box>
  );
}

React.render(<App />, ui);
```

对应的 DOM 树结构：

```
ui (App)
└── box
    ├── box
    │   ├── text ("标题")
    │   └── image (logo.png)
    └── box
        ├── text ("内容")
        └── box
            └── text ("子内容")
```

### 用 Fragment

tsx

```
function App() {
  return (
    <>
      <box>
        <text>标题</text>
        <image style={{ image: "logo.png" }} />
      </box>
      <box>
        <text>内容</text>
        <box>
          <text>子内容</text>
        </box>
      </box>
    </>
  );
}

React.render(<App />, ui);
```

对应的 DOM 树结构：

```
ui (App)
├── box
│   ├── text ("标题")
│   └── image (logo.png)
└── box
    ├── text ("内容")
    └── box
        └── text ("子内容")
```

## React.render

`React.render`是 React 应用的入口点，它负责将 React 组件渲染到指定的容器中。在神岛 React 中，它的主要功能包括：

1. **初始化渲染**
  - 将 React 组件树转换为虚拟 DOM
  - 将虚拟 DOM 渲染到指定的 UI 容器中
  - 建立组件与 UI 的关联
2. **参数说明**tsx`React.render(element, container);`
  - `element`: 要渲染的 React 元素（通常是根组件）
  - `container`: 渲染的目标容器，屏幕根节点（例`ui`），或任意 UI 元素，如`box`、`text`等。
3. **使用示例**

tsx

```
// 渲染单个组件
React.render(<App />, ui);

// 渲染多个组件
React.render(
  <box>
    <App1 />
    <App2 />
  </box>,
  ui
);
```

1. **注意事项**
  - 每个容器只能调用一次`React.render`
  - 渲染后的组件会自动与容器建立绑定关系
  - 后续的更新会自动处理，不需要再次调用`React.render`
2. **更新机制**
  - 当组件状态发生变化时，React 会自动重新渲染
  - 只会更新发生变化的部分，而不是整个树
  - 使用虚拟 DOM 进行高效的差异比较

## 最佳实践

1. **组件结构**
  - 使用`box`作为容器组件
  - 合理组织组件层级
  - 避免过深的嵌套
2. **渲染优化**
  - 将静态内容提取为独立组件
  - 使用`Fragment`避免不必要的 DOM 节点
  - 合理使用条件渲染
3. **性能考虑**
  - 控制组件更新范围
  - 避免不必要的重渲染
  - 使用合适的组件拆分策略
