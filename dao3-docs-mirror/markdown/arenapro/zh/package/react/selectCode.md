---
title: "双向选择器 - 交互式视图"
source: "https://docs.dao3.fun/arenapro/zh/package/react/selectCode.html"
---

# 双向选择器 - 交互式视图

本文档展示了一个功能完整的双向选择器组件，支持项目选择、批量移动、全选/清除操作，并具有平滑的动画效果。该组件被广泛应用于需要在两个列表间转移数据的场景，如权限分配、文件整理等。

![](https://static.codemao.cn/pickduck/SyeKApja1x.gif?hash=llNdSqzuiaRgs67FYDKJGDaJGIiE)

## 功能亮点

- **双列表布局**：清晰展示两组不同数据
- **多选操作**：支持单选和批量选择
- **全选/清除**：一键操作所有项目
- **平滑动画**：移动过程中有流畅的视觉反馈
- **响应式设计**：适应不同屏幕尺寸
- **视觉区分**：不同列表使用不同颜色方案

## React 实现

本代码是由 claude-3.7-sonnet 生成的。

tsx

```
// clientApp.tsx
import React, { hooks } from "@dao3fun/react";
const { useState, useEffect, useScreenSize } = hooks;

// 定义列表项类型
interface ListItem {
  id: number;
  name: string;
  category?: string;
  color?: string;
  animating?: boolean;
  direction?: "left" | "right";
  originalIndex?: number;
}

// 左右互换列表示例组件
function TransferListExample() {
  // 获取屏幕尺寸实现自适应
  const { screenWidth, screenHeight } = useScreenSize();

  // 根据屏幕尺寸计算组件尺寸
  const containerWidth = Math.min(screenWidth - 40, 800);
  const containerHeight = screenHeight;
  const listWidth = (containerWidth - 120) / 2;
  const listHeight = containerHeight - 80;

  // 定义左侧和右侧列表数据，添加颜色以增强视觉效果
  const [leftItems, setLeftItems] = useState<ListItem[]>([
    { id: 1, name: "苹果", color: "#e53935" },
    { id: 2, name: "香蕉", color: "#fdd835" },
    { id: 3, name: "草莓", color: "#d81b60" },
    { id: 4, name: "西瓜", color: "#43a047" },
    { id: 5, name: "橙子", color: "#fb8c00" },
    { id: 9, name: "葡萄", color: "#8e24aa" },
    { id: 10, name: "猕猴桃", color: "#558b2f" },
  ]);

  const [rightItems, setRightItems] = useState<ListItem[]>([
    { id: 6, name: "土豆", color: "#a1887f" },
    { id: 7, name: "胡萝卜", color: "#ef6c00" },
    { id: 8, name: "番茄", color: "#d84315" },
  ]);

  // 选中项的状态
  const [selectedLeft, setSelectedLeft] = useState<number[]>([]);
  const [selectedRight, setSelectedRight] = useState<number[]>([]);

  // 添加动画状态
  const [animatingToRight, setAnimatingToRight] = useState(false);
  const [animatingToLeft, setAnimatingToLeft] = useState(false);

  // 用于存储动画中的元素
  const [animatingItems, setAnimatingItems] = useState<ListItem[]>([]);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 当屏幕尺寸变化时重新计算布局
  useEffect(() => {
    console.log("屏幕尺寸已变化，重新调整布局");
  }, [screenWidth, screenHeight]);

  // 处理左侧项目选择
  const handleLeftSelect = (id: number) => {
    setSelectedLeft((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 处理右侧项目选择
  const handleRightSelect = (id: number) => {
    setSelectedRight((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 将选中项目从左侧移动到右侧
  const moveToRight = () => {
    if (selectedLeft.length === 0 || isAnimating) return;

    // 添加动画效果
    setAnimatingToRight(true);
    setIsAnimating(true);

    // 找出要移动的项目
    const itemsToMove = leftItems
      .filter((item) => selectedLeft.includes(item.id))
      .map((item, index) => ({
        ...item,
        animating: true,
        direction: "right" as "left" | "right",
        originalIndex: leftItems.findIndex((i) => i.id === item.id),
      }));

    setAnimatingItems(itemsToMove);

    // 开始动画
    let progress = 0;
    const animateInterval = setInterval(() => {
      progress += 0.05;
      setAnimationProgress(progress);

      if (progress >= 1) {
        clearInterval(animateInterval);
        // 动画完成，更新列表
        setRightItems((prev) => [
          ...prev,
          ...itemsToMove.map((item) => ({
            ...item,
            animating: false,
            direction: undefined,
          })),
        ]);
        setLeftItems((prev) =>
          prev.filter((item) => !selectedLeft.includes(item.id))
        );
        setSelectedLeft([]);
        setAnimatingToRight(false);
        setAnimatingItems([]);
        setAnimationProgress(0);
        setIsAnimating(false);
        console.log(
          "项目已移动到右侧列表",
          itemsToMove.map((item) => item.name)
        );
      }
    }, 16);
  };

  // 将选中项目从右侧移动到左侧
  const moveToLeft = () => {
    if (selectedRight.length === 0 || isAnimating) return;

    // 添加动画效果
    setAnimatingToLeft(true);
    setIsAnimating(true);

    // 找出要移动的项目
    const itemsToMove = rightItems
      .filter((item) => selectedRight.includes(item.id))
      .map((item, index) => ({
        ...item,
        animating: true,
        direction: "left" as "left" | "right",
        originalIndex: rightItems.findIndex((i) => i.id === item.id),
      }));

    setAnimatingItems(itemsToMove);

    // 开始动画
    let progress = 0;
    const animateInterval = setInterval(() => {
      progress += 0.05;
      setAnimationProgress(progress);

      if (progress >= 1) {
        clearInterval(animateInterval);
        // 动画完成，更新列表
        setLeftItems((prev) => [
          ...prev,
          ...itemsToMove.map((item) => ({
            ...item,
            animating: false,
            direction: undefined,
          })),
        ]);
        setRightItems((prev) =>
          prev.filter((item) => !selectedRight.includes(item.id))
        );
        setSelectedRight([]);
        setAnimatingToLeft(false);
        setAnimatingItems([]);
        setAnimationProgress(0);
        setIsAnimating(false);
        console.log(
          "项目已移动到左侧列表",
          itemsToMove.map((item) => item.name)
        );
      }
    }, 16);
  };

  // 全选功能
  const selectAllLeft = () => {
    setSelectedLeft(leftItems.map((item) => item.id));
  };

  const selectAllRight = () => {
    setSelectedRight(rightItems.map((item) => item.id));
  };

  // 清除选择
  const clearSelectionsLeft = () => {
    setSelectedLeft([]);
  };

  const clearSelectionsRight = () => {
    setSelectedRight([]);
  };

  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 245, g: 247, b: 250 }),
        size: {
          offset: Vec2.create({ x: containerWidth, y: containerHeight }),
        },
        // 居中显示
        position: {
          offset: Vec2.create({
            x: (screenWidth - containerWidth) / 2,
            y: (screenHeight - containerHeight) / 2,
          }),
        },
      }}
    >
      {/* 标题栏 */}
      <box
        style={{
          size: { offset: Vec2.create({ x: containerWidth, y: 60 }) },
          backgroundColor: Vec3.create({ r: 63, g: 81, b: 181 }),
        }}
      >
        <text
          style={{
            position: {
              offset: Vec2.create({ x: 40, y: 4 }),
            },

            textFontSize: 20,
            textColor: Vec3.create({ r: 255, g: 255, b: 255 }),
          }}
        >
          双向选择器 - 交互式视图
        </text>
      </box>

      {/* 内容区域 */}
      <box
        style={{
          position: { offset: Vec2.create({ x: 0, y: 60 }) },
          size: {
            offset: Vec2.create({ x: containerWidth, y: containerHeight - 60 }),
          },
        }}
      >
        {/* 左侧列表 */}
        <box
          style={{
            position: { offset: Vec2.create({ x: 20, y: 20 }) },
            size: { offset: Vec2.create({ x: listWidth, y: listHeight }) },
            backgroundColor: Vec3.create({ r: 255, g: 255, b: 255 }),
          }}
        >
          {/* 左侧列表标题 */}
          <box
            style={{
              size: { offset: Vec2.create({ x: listWidth, y: 50 }) },
              backgroundColor: Vec3.create({ r: 76, g: 175, b: 80 }),
            }}
          >
            <text
              style={{
                position: { offset: Vec2.create({ x: 18, y: 0 }) },
                textFontSize: 16,
                textColor: Vec3.create({ r: 255, g: 255, b: 255 }),
              }}
            >
              水果 ({leftItems.length})
            </text>

            <box
              style={{
                position: {
                  offset: Vec2.create({ x: listWidth - 100, y: 10 }),
                },
                size: { offset: Vec2.create({ x: 40, y: 30 }) },
                backgroundColor:
                  selectedLeft.length > 0
                    ? Vec3.create({ r: 211, g: 47, b: 47 })
                    : Vec3.create({ r: 120, g: 144, b: 156 }),
              }}
              onClick={clearSelectionsLeft}
            >
              清除
            </box>

            <box
              style={{
                position: { offset: Vec2.create({ x: listWidth - 50, y: 10 }) },
                size: { offset: Vec2.create({ x: 40, y: 30 }) },
                backgroundColor:
                  leftItems.length > 0
                    ? Vec3.create({ r: 33, g: 150, b: 243 })
                    : Vec3.create({ r: 120, g: 144, b: 156 }),
              }}
              onClick={selectAllLeft}
            >
              全选
            </box>
          </box>

          {/* 左侧列表内容 */}
          <box
            style={{
              position: { offset: Vec2.create({ x: 0, y: 50 }) },
              size: {
                offset: Vec2.create({ x: listWidth, y: listHeight - 50 }),
              },
            }}
          >
            <box
              style={{
                position: { offset: Vec2.create({ x: 0, y: 0 }) },
                size: {
                  offset: Vec2.create({
                    x: listWidth,
                    y: leftItems.length * 60,
                  }),
                },
              }}
            >
              {leftItems.map((item, index) => (
                <box
                  style={{
                    position: {
                      offset: Vec2.create({ x: 10, y: index * 60 }),
                    },
                    size: { offset: Vec2.create({ x: listWidth - 20, y: 55 }) },
                    backgroundColor: selectedLeft.includes(item.id)
                      ? Vec3.create({ r: 232, g: 240, b: 254 })
                      : Vec3.create({ r: 250, g: 250, b: 250 }),
                  }}
                  onClick={() => handleLeftSelect(item.id)}
                >
                  <box
                    style={{
                      position: { offset: Vec2.create({ x: 12, y: 17 }) },
                      size: { offset: Vec2.create({ x: 18, y: 18 }) },
                      backgroundColor: Vec3.create({
                        r:
                          (parseInt(item.color?.substring(1, 3) || "80", 16) /
                            255) *
                          255,
                        g:
                          (parseInt(item.color?.substring(3, 5) || "80", 16) /
                            255) *
                          255,
                        b:
                          (parseInt(item.color?.substring(5, 7) || "80", 16) /
                            255) *
                          255,
                      }),
                    }}
                  />

                  {item.name}
                </box>
              ))}
            </box>
          </box>
        </box>

        {/* 中间控制按钮区域 */}
        <box
          style={{
            position: {
              offset: Vec2.create({
                x: containerWidth / 2 - 40,
                y: listHeight / 2 - 70 + 20,
              }),
            },
            size: { offset: Vec2.create({ x: 80, y: 160 }) },
          }}
        >
          <box
            style={{
              size: { offset: Vec2.create({ x: 80, y: 70 }) },
              backgroundColor:
                selectedLeft.length > 0 && !isAnimating
                  ? animatingToRight
                    ? Vec3.create({ r: 100, g: 151, b: 237 })
                    : Vec3.create({ r: 66, g: 133, b: 244 })
                  : Vec3.create({ r: 189, g: 189, b: 189 }),
              backgroundOpacity: animatingToRight ? 0.7 : 1,
            }}
            onClick={moveToRight}
          >
            →
          </box>

          <box
            style={{
              position: { offset: Vec2.create({ x: 0, y: 90 }) },
              size: { offset: Vec2.create({ x: 80, y: 70 }) },
              backgroundColor:
                selectedRight.length > 0 && !isAnimating
                  ? animatingToLeft
                    ? Vec3.create({ r: 100, g: 151, b: 237 })
                    : Vec3.create({ r: 66, g: 133, b: 244 })
                  : Vec3.create({ r: 189, g: 189, b: 189 }),
              backgroundOpacity: animatingToLeft ? 0.7 : 1,
            }}
            onClick={moveToLeft}
          >
            ←
          </box>
        </box>

        {/* 右侧列表 */}
        <box
          style={{
            position: {
              offset: Vec2.create({
                x: containerWidth - listWidth - 20,
                y: 20,
              }),
            },
            size: { offset: Vec2.create({ x: listWidth, y: listHeight }) },
            backgroundColor: Vec3.create({ r: 255, g: 255, b: 255 }),
          }}
        >
          {/* 右侧列表标题 */}
          <box
            style={{
              size: { offset: Vec2.create({ x: listWidth, y: 50 }) },
              backgroundColor: Vec3.create({ r: 255, g: 152, b: 0 }),
            }}
          >
            <text
              style={{
                position: { offset: Vec2.create({ x: 18, y: 0 }) },
                textFontSize: 16,
                textColor: Vec3.create({ r: 255, g: 255, b: 255 }),
              }}
            >
              蔬菜 ({rightItems.length})
            </text>

            <box
              style={{
                position: {
                  offset: Vec2.create({ x: listWidth - 100, y: 10 }),
                },
                size: { offset: Vec2.create({ x: 40, y: 30 }) },
                backgroundColor:
                  selectedRight.length > 0
                    ? Vec3.create({ r: 211, g: 47, b: 47 })
                    : Vec3.create({ r: 120, g: 144, b: 156 }),
              }}
              onClick={clearSelectionsRight}
            >
              清除
            </box>

            <box
              style={{
                position: { offset: Vec2.create({ x: listWidth - 50, y: 10 }) },
                size: { offset: Vec2.create({ x: 40, y: 30 }) },
                backgroundColor:
                  rightItems.length > 0
                    ? Vec3.create({ r: 33, g: 150, b: 243 })
                    : Vec3.create({ r: 120, g: 144, b: 156 }),
              }}
              onClick={selectAllRight}
            >
              全选
            </box>
          </box>

          {/* 右侧列表内容 */}
          <box
            style={{
              position: { offset: Vec2.create({ x: 0, y: 50 }) },
              size: {
                offset: Vec2.create({ x: listWidth, y: listHeight - 50 }),
              },
            }}
          >
            <box
              style={{
                position: { offset: Vec2.create({ x: 0, y: 0 }) },
                size: {
                  offset: Vec2.create({
                    x: listWidth,
                    y: rightItems.length * 60,
                  }),
                },
              }}
            >
              {rightItems.map((item, index) => (
                <box
                  style={{
                    position: {
                      offset: Vec2.create({ x: 10, y: index * 60 }),
                    },
                    size: { offset: Vec2.create({ x: listWidth - 20, y: 55 }) },
                    backgroundColor: selectedRight.includes(item.id)
                      ? Vec3.create({ r: 255, g: 243, b: 224 })
                      : Vec3.create({ r: 250, g: 250, b: 250 }),
                  }}
                  onClick={() => handleRightSelect(item.id)}
                >
                  <box
                    style={{
                      position: { offset: Vec2.create({ x: 12, y: 17 }) },
                      size: { offset: Vec2.create({ x: 18, y: 18 }) },
                      backgroundColor: Vec3.create({
                        r:
                          (parseInt(item.color?.substring(1, 3) || "80", 16) /
                            255) *
                          255,
                        g:
                          (parseInt(item.color?.substring(3, 5) || "80", 16) /
                            255) *
                          255,
                        b:
                          (parseInt(item.color?.substring(5, 7) || "80", 16) /
                            255) *
                          255,
                      }),
                    }}
                  />

                  {item.name}
                </box>
              ))}
            </box>
          </box>
        </box>

        {/* 动画中的元素 */}
        {animatingItems.map((item) => {
          // 计算起始和结束位置
          const startX =
            item.direction === "right"
              ? 20 + 10 // 左侧列表的x位置 + 左边距
              : containerWidth - listWidth - 20 + 10; // 右侧列表的x位置 + 左边距

          const endX =
            item.direction === "right"
              ? containerWidth - listWidth - 20 + 10 // 右侧列表的x位置 + 左边距
              : 20 + 10; // 左侧列表的x位置 + 左边距

          // 计算y位置 - 从原始位置开始
          const startY =
            item.direction === "right"
              ? 20 + 50 + (item.originalIndex || 0) * 60 // 左侧列表顶部位置 + 标题高度 + 项目索引*高度
              : 20 + 50 + (item.originalIndex || 0) * 60; // 右侧列表顶部位置 + 标题高度 + 项目索引*高度

          // 目标位置 - 基于当前项目在列表中的位置
          const targetIndex =
            item.direction === "right"
              ? rightItems.length +
                animatingItems
                  .filter((i) => i.direction === "right")
                  .indexOf(item)
              : leftItems.length +
                animatingItems
                  .filter((i) => i.direction === "left")
                  .indexOf(item);

          const endY =
            item.direction === "right"
              ? 20 + 50 + targetIndex * 60 // 右侧列表顶部位置 + 标题高度 + 目标索引*高度
              : 20 + 50 + targetIndex * 60; // 左侧列表顶部位置 + 标题高度 + 目标索引*高度

          // 使用缓动函数计算位置 (easeInOutQuad)
          const easeProgress =
            animationProgress < 0.5
              ? 2 * animationProgress * animationProgress
              : 1 - Math.pow(-2 * animationProgress + 2, 2) / 2;

          const currentX = startX + (endX - startX) * easeProgress;
          const currentY = startY + (endY - startY) * easeProgress;

          return (
            <box
              style={{
                position: {
                  offset: Vec2.create({
                    x: currentX,
                    y: currentY,
                  }),
                },
                size: { offset: Vec2.create({ x: listWidth - 20, y: 55 }) },
                backgroundColor: Vec3.create({ r: 250, g: 250, b: 250 }),
                backgroundOpacity: 0.9,
              }}
            >
              <box
                style={{
                  position: { offset: Vec2.create({ x: 12, y: 17 }) },
                  size: { offset: Vec2.create({ x: 18, y: 18 }) },
                  backgroundColor: Vec3.create({
                    r:
                      (parseInt(item.color?.substring(1, 3) || "80", 16) /
                        255) *
                      255,
                    g:
                      (parseInt(item.color?.substring(3, 5) || "80", 16) /
                        255) *
                      255,
                    b:
                      (parseInt(item.color?.substring(5, 7) || "80", 16) /
                        255) *
                      255,
                  }),
                }}
              />
              {item.name}
            </box>
          );
        })}
      </box>
    </box>
  );
}

// 渲染组件
React.render(<TransferListExample />, ui);
```

## 神岛 UI 代码

ts

```
/**
 * Native implementation of the TransferList component
 * This file contains the same functionality as a.tsx but using native APIs
 */

// Define list item interface
interface ListItem {
  id: number;
  name: string;
  category?: string;
  color?: string;
  animating?: boolean;
  direction?: "left" | "right";
  originalIndex?: number;
}

// Main function to create and render the TransferList UI
function createTransferListUI(): UiBox {
  // Get current screen size
  const screenSize = {
    screenWidth: screenWidth || 800,
    screenHeight: screenHeight || 600,
  };

  // Calculate container dimensions
  let containerWidth = Math.min(screenSize.screenWidth - 40, 800);
  let containerHeight = screenSize.screenHeight;
  let listWidth = (containerWidth - 120) / 2;
  let listHeight = containerHeight - 80;

  // State management
  let leftItems: ListItem[] = [
    { id: 1, name: "苹果", color: "#e53935" },
    { id: 2, name: "香蕉", color: "#fdd835" },
    { id: 3, name: "草莓", color: "#d81b60" },
    { id: 4, name: "西瓜", color: "#43a047" },
    { id: 5, name: "橙子", color: "#fb8c00" },
    { id: 9, name: "葡萄", color: "#8e24aa" },
    { id: 10, name: "猕猴桃", color: "#558b2f" },
  ];

  let rightItems: ListItem[] = [
    { id: 6, name: "土豆", color: "#a1887f" },
    { id: 7, name: "胡萝卜", color: "#ef6c00" },
    { id: 8, name: "番茄", color: "#d84315" },
  ];

  let selectedLeft: number[] = [];
  let selectedRight: number[] = [];

  let animatingToRight = false;
  let animatingToLeft = false;
  let animatingItems: ListItem[] = [];
  let animationProgress = 0;
  let isAnimating = false;

  // UI References
  const rootContainer = UiBox.create();
  let leftListContent = UiBox.create();
  let rightListContent = UiBox.create();
  let leftListTitle = UiText.create();
  let rightListTitle = UiText.create();
  let animationContainer = UiBox.create();

  // Create UI structure and return container
  initUI();
  return rootContainer;

  // Initialize UI structure
  function initUI() {
    // Root container
    rootContainer.backgroundColor.copy(Vec3.create({ r: 245, g: 247, b: 250 }));
    rootContainer.size.offset.copy(
      Vec2.create({ x: containerWidth, y: containerHeight })
    );
    rootContainer.position.offset.copy(
      Vec2.create({
        x: (screenSize.screenWidth - containerWidth) / 2,
        y: (screenSize.screenHeight - containerHeight) / 2,
      })
    );

    createTitleBar();
    createContentArea();

    // Monitor for screen size changes (in a real app)
    // Note: In a real implementation you would add a listener for screen resize events
  }

  // Create the title bar
  function createTitleBar() {
    const titleBar = UiBox.create();
    titleBar.size.offset.copy(Vec2.create({ x: containerWidth, y: 60 }));
    titleBar.backgroundColor.copy(Vec3.create({ r: 63, g: 81, b: 181 }));
    titleBar.parent = rootContainer;

    const titleText = UiText.create();
    titleText.position.offset.copy(Vec2.create({ x: 40, y: 4 }));
    titleText.textFontSize = 20;
    titleText.textColor.copy(Vec3.create({ r: 255, g: 255, b: 255 }));
    titleText.textContent = "双向选择器 - 交互式视图";
    titleText.parent = titleBar;
  }

  // Create the content area with left and right lists
  function createContentArea() {
    const contentArea = UiBox.create();
    contentArea.position.offset.copy(Vec2.create({ x: 0, y: 60 }));
    contentArea.size.offset.copy(
      Vec2.create({
        x: containerWidth,
        y: containerHeight - 60,
      })
    );
    contentArea.parent = rootContainer;

    createLeftList(contentArea);
    createControlButtons(contentArea);
    createRightList(contentArea);

    // Create animation container
    animationContainer = UiBox.create();
    animationContainer.parent = contentArea;
  }

  // Create the left list
  function createLeftList(parent: UiNode) {
    const leftList = UiBox.create();
    leftList.position.offset.copy(Vec2.create({ x: 20, y: 20 }));
    leftList.size.offset.copy(Vec2.create({ x: listWidth, y: listHeight }));
    leftList.backgroundColor.copy(Vec3.create({ r: 255, g: 255, b: 255 }));
    leftList.parent = parent;

    // Create left list title
    const leftListHeader = UiBox.create();
    leftListHeader.size.offset.copy(Vec2.create({ x: listWidth, y: 50 }));
    leftListHeader.backgroundColor.copy(Vec3.create({ r: 76, g: 175, b: 80 }));
    leftListHeader.parent = leftList;

    leftListTitle = UiText.create();
    leftListTitle.position.offset.copy(Vec2.create({ x: 18, y: 0 }));
    leftListTitle.textFontSize = 16;
    leftListTitle.textColor.copy(Vec3.create({ r: 255, g: 255, b: 255 }));
    leftListTitle.textContent = `水果 (${leftItems.length})`;
    leftListTitle.parent = leftListHeader;

    // Clear selection button
    const clearLeftBtn = UiBox.create();
    clearLeftBtn.position.offset.copy(
      Vec2.create({ x: listWidth - 100, y: 10 })
    );
    clearLeftBtn.size.offset.copy(Vec2.create({ x: 40, y: 30 }));
    updateClearButtonState(clearLeftBtn, selectedLeft.length > 0);
    clearLeftBtn.parent = leftListHeader;

    const clearLeftText = UiText.create();
    clearLeftText.textContent = "清除";
    clearLeftText.parent = clearLeftBtn;

    // Add event listener for clear button
    clearLeftBtn.events.on("pointerdown", () => {
      clearSelectionsLeft();
      updateUI();
    });

    // Select all button
    const selectAllLeftBtn = UiBox.create();
    selectAllLeftBtn.position.offset.copy(
      Vec2.create({ x: listWidth - 50, y: 10 })
    );
    selectAllLeftBtn.size.offset.copy(Vec2.create({ x: 40, y: 30 }));
    updateSelectAllButtonState(selectAllLeftBtn, leftItems.length > 0);
    selectAllLeftBtn.parent = leftListHeader;

    const selectAllLeftText = UiText.create();
    selectAllLeftText.textContent = "全选";
    selectAllLeftText.parent = selectAllLeftBtn;

    // Add event listener for select all button
    selectAllLeftBtn.events.on("pointerdown", () => {
      selectAllLeft();
      updateUI();
    });

    // Create left list content container
    const leftListContentContainer = UiBox.create();
    leftListContentContainer.position.offset.copy(Vec2.create({ x: 0, y: 50 }));
    leftListContentContainer.size.offset.copy(
      Vec2.create({
        x: listWidth,
        y: listHeight - 50,
      })
    );
    leftListContentContainer.parent = leftList;

    // Create scrollable content area
    leftListContent = UiBox.create();
    leftListContent.position.offset.copy(Vec2.create({ x: 0, y: 0 }));
    leftListContent.size.offset.copy(
      Vec2.create({
        x: listWidth,
        y: leftItems.length * 60,
      })
    );
    leftListContent.parent = leftListContentContainer;

    // Populate left list items
    populateLeftList();
  }

  // Populate items in the left list
  function populateLeftList() {
    // Clear existing items
    while (leftListContent.children.length > 0) {
      leftListContent.children[0].parent = undefined;
    }

    // Create items
    leftItems.forEach((item, index) => {
      const itemBox = UiBox.create();
      itemBox.position.offset.copy(Vec2.create({ x: 10, y: index * 60 }));
      itemBox.size.offset.copy(Vec2.create({ x: listWidth - 20, y: 55 }));

      // Set background color based on selection state
      updateItemBackgroundLeft(itemBox, selectedLeft.includes(item.id));

      itemBox.parent = leftListContent;

      // Add color indicator
      const colorBox = UiBox.create();
      colorBox.position.offset.copy(Vec2.create({ x: 12, y: 17 }));
      colorBox.size.offset.copy(Vec2.create({ x: 18, y: 18 }));
      colorBox.backgroundColor.copy(hexToVec3(item.color || "#808080"));
      colorBox.parent = itemBox;

      // Add item text
      const itemText = UiText.create();
      itemText.position.offset.copy(Vec2.create({ x: 40, y: 17 }));
      itemText.textContent = item.name;
      itemText.parent = itemBox;

      // Add click event for selection
      itemBox.events.on("pointerdown", () => {
        handleLeftSelect(item.id);
        updateUI();
      });
    });
  }

  // Create the right list
  function createRightList(parent: UiNode) {
    const rightList = UiBox.create();
    rightList.position.offset.copy(
      Vec2.create({ x: containerWidth - listWidth - 20, y: 20 })
    );
    rightList.size.offset.copy(Vec2.create({ x: listWidth, y: listHeight }));
    rightList.backgroundColor.copy(Vec3.create({ r: 255, g: 255, b: 255 }));
    rightList.parent = parent;

    // Create right list title
    const rightListHeader = UiBox.create();
    rightListHeader.size.offset.copy(Vec2.create({ x: listWidth, y: 50 }));
    rightListHeader.backgroundColor.copy(Vec3.create({ r: 255, g: 152, b: 0 }));
    rightListHeader.parent = rightList;

    rightListTitle = UiText.create();
    rightListTitle.position.offset.copy(Vec2.create({ x: 18, y: 0 }));
    rightListTitle.textFontSize = 16;
    rightListTitle.textColor.copy(Vec3.create({ r: 255, g: 255, b: 255 }));
    rightListTitle.textContent = `蔬菜 (${rightItems.length})`;
    rightListTitle.parent = rightListHeader;

    // Clear selection button
    const clearRightBtn = UiBox.create();
    clearRightBtn.position.offset.copy(
      Vec2.create({ x: listWidth - 100, y: 10 })
    );
    clearRightBtn.size.offset.copy(Vec2.create({ x: 40, y: 30 }));
    updateClearButtonState(clearRightBtn, selectedRight.length > 0);
    clearRightBtn.parent = rightListHeader;

    const clearRightText = UiText.create();
    clearRightText.textContent = "清除";
    clearRightText.parent = clearRightBtn;

    // Add event listener for clear button
    clearRightBtn.events.on("pointerdown", () => {
      clearSelectionsRight();
      updateUI();
    });

    // Select all button
    const selectAllRightBtn = UiBox.create();
    selectAllRightBtn.position.offset.copy(
      Vec2.create({ x: listWidth - 50, y: 10 })
    );
    selectAllRightBtn.size.offset.copy(Vec2.create({ x: 40, y: 30 }));
    updateSelectAllButtonState(selectAllRightBtn, rightItems.length > 0);
    selectAllRightBtn.parent = rightListHeader;

    const selectAllRightText = UiText.create();
    selectAllRightText.textContent = "全选";
    selectAllRightText.parent = selectAllRightBtn;

    // Add event listener for select all button
    selectAllRightBtn.events.on("pointerdown", () => {
      selectAllRight();
      updateUI();
    });

    // Create right list content container
    const rightListContentContainer = UiBox.create();
    rightListContentContainer.position.offset.copy(
      Vec2.create({ x: 0, y: 50 })
    );
    rightListContentContainer.size.offset.copy(
      Vec2.create({
        x: listWidth,
        y: listHeight - 50,
      })
    );
    rightListContentContainer.parent = rightList;

    // Create scrollable content area
    rightListContent = UiBox.create();
    rightListContent.position.offset.copy(Vec2.create({ x: 0, y: 0 }));
    rightListContent.size.offset.copy(
      Vec2.create({
        x: listWidth,
        y: rightItems.length * 60,
      })
    );
    rightListContent.parent = rightListContentContainer;

    // Populate right list items
    populateRightList();
  }

  // Populate items in the right list
  function populateRightList() {
    // Clear existing items
    while (rightListContent.children.length > 0) {
      rightListContent.children[0].parent = undefined;
    }

    // Create items
    rightItems.forEach((item, index) => {
      const itemBox = UiBox.create();
      itemBox.position.offset.copy(Vec2.create({ x: 10, y: index * 60 }));
      itemBox.size.offset.copy(Vec2.create({ x: listWidth - 20, y: 55 }));

      // Set background color based on selection state
      updateItemBackgroundRight(itemBox, selectedRight.includes(item.id));

      itemBox.parent = rightListContent;

      // Add color indicator
      const colorBox = UiBox.create();
      colorBox.position.offset.copy(Vec2.create({ x: 12, y: 17 }));
      colorBox.size.offset.copy(Vec2.create({ x: 18, y: 18 }));
      colorBox.backgroundColor.copy(hexToVec3(item.color || "#808080"));
      colorBox.parent = itemBox;

      // Add item text
      const itemText = UiText.create();
      itemText.position.offset.copy(Vec2.create({ x: 40, y: 17 }));
      itemText.textContent = item.name;
      itemText.parent = itemBox;

      // Add click event for selection
      itemBox.events.on("pointerdown", () => {
        handleRightSelect(item.id);
        updateUI();
      });
    });
  }

  // Create control buttons for transferring items between lists
  function createControlButtons(parent: UiNode) {
    const controlsContainer = UiBox.create();
    controlsContainer.position.offset.copy(
      Vec2.create({
        x: containerWidth / 2 - 40,
        y: listHeight / 2 - 70 + 20,
      })
    );
    controlsContainer.size.offset.copy(Vec2.create({ x: 80, y: 160 }));
    controlsContainer.parent = parent;

    // Right arrow button (move to right)
    const moveRightBtn = UiBox.create();
    moveRightBtn.size.offset.copy(Vec2.create({ x: 80, y: 70 }));
    updateMoveButtonState(
      moveRightBtn,
      selectedLeft.length > 0 && !isAnimating,
      animatingToRight
    );
    moveRightBtn.parent = controlsContainer;

    const rightArrowText = UiText.create();
    rightArrowText.textContent = "→";
    rightArrowText.textFontSize = 30;
    rightArrowText.position.offset.copy(Vec2.create({ x: 30, y: 15 }));
    rightArrowText.parent = moveRightBtn;

    // Add event listener for move to right button
    moveRightBtn.events.on("pointerdown", () => {
      moveToRight();
    });

    // Left arrow button (move to left)
    const moveLeftBtn = UiBox.create();
    moveLeftBtn.position.offset.copy(Vec2.create({ x: 0, y: 90 }));
    moveLeftBtn.size.offset.copy(Vec2.create({ x: 80, y: 70 }));
    updateMoveButtonState(
      moveLeftBtn,
      selectedRight.length > 0 && !isAnimating,
      animatingToLeft
    );
    moveLeftBtn.parent = controlsContainer;

    const leftArrowText = UiText.create();
    leftArrowText.textContent = "←";
    leftArrowText.textFontSize = 30;
    leftArrowText.position.offset.copy(Vec2.create({ x: 30, y: 15 }));
    leftArrowText.parent = moveLeftBtn;

    // Add event listener for move to left button
    moveLeftBtn.events.on("pointerdown", () => {
      moveToLeft();
    });
  }

  // Helper functions for UI updates

  // Update background color of left list items based on selection state
  function updateItemBackgroundLeft(itemBox: UiBox, isSelected: boolean) {
    if (isSelected) {
      itemBox.backgroundColor.copy(Vec3.create({ r: 232, g: 240, b: 254 }));
    } else {
      itemBox.backgroundColor.copy(Vec3.create({ r: 250, g: 250, b: 250 }));
    }
  }

  // Update background color of right list items based on selection state
  function updateItemBackgroundRight(itemBox: UiBox, isSelected: boolean) {
    if (isSelected) {
      itemBox.backgroundColor.copy(Vec3.create({ r: 255, g: 243, b: 224 }));
    } else {
      itemBox.backgroundColor.copy(Vec3.create({ r: 250, g: 250, b: 250 }));
    }
  }

  // Update clear button appearance based on whether there are selections
  function updateClearButtonState(button: UiBox, hasSelections: boolean) {
    if (hasSelections) {
      button.backgroundColor.copy(Vec3.create({ r: 211, g: 47, b: 47 }));
    } else {
      button.backgroundColor.copy(Vec3.create({ r: 120, g: 144, b: 156 }));
    }
  }

  // Update select all button appearance based on whether there are items
  function updateSelectAllButtonState(button: UiBox, hasItems: boolean) {
    if (hasItems) {
      button.backgroundColor.copy(Vec3.create({ r: 33, g: 150, b: 243 }));
    } else {
      button.backgroundColor.copy(Vec3.create({ r: 120, g: 144, b: 156 }));
    }
  }

  // Update move button appearance based on selection state and animation state
  function updateMoveButtonState(
    button: UiBox,
    isEnabled: boolean,
    isAnimating: boolean
  ) {
    if (isEnabled) {
      if (isAnimating) {
        button.backgroundColor.copy(Vec3.create({ r: 100, g: 151, b: 237 }));
        button.backgroundOpacity = 0.7;
      } else {
        button.backgroundColor.copy(Vec3.create({ r: 66, g: 133, b: 244 }));
        button.backgroundOpacity = 1;
      }
    } else {
      button.backgroundColor.copy(Vec3.create({ r: 189, g: 189, b: 189 }));
      button.backgroundOpacity = 1;
    }
  }

  // Convert hex color to Vec3
  function hexToVec3(hexColor: string): Vec3 {
    const r = parseInt(hexColor.substring(1, 3) || "80", 16) / 255;
    const g = parseInt(hexColor.substring(3, 5) || "80", 16) / 255;
    const b = parseInt(hexColor.substring(5, 7) || "80", 16) / 255;

    return Vec3.create({ r: r * 255, g: g * 255, b: b * 255 });
  }

  // Selection handling functions

  // Handle selection in the left list
  function handleLeftSelect(id: number) {
    if (selectedLeft.includes(id)) {
      selectedLeft = selectedLeft.filter((itemId) => itemId !== id);
    } else {
      selectedLeft.push(id);
    }
  }

  // Handle selection in the right list
  function handleRightSelect(id: number) {
    if (selectedRight.includes(id)) {
      selectedRight = selectedRight.filter((itemId) => itemId !== id);
    } else {
      selectedRight.push(id);
    }
  }

  // Select all items in the left list
  function selectAllLeft() {
    selectedLeft = leftItems.map((item) => item.id);
  }

  // Select all items in the right list
  function selectAllRight() {
    selectedRight = rightItems.map((item) => item.id);
  }

  // Clear all selections in the left list
  function clearSelectionsLeft() {
    selectedLeft = [];
  }

  // Clear all selections in the right list
  function clearSelectionsRight() {
    selectedRight = [];
  }

  // Easing function for smoother animations
  function easeInOutQuad(progress: number): number {
    return progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  }

  // Animation and item transfer functions

  // Move items from left to right
  function moveToRight() {
    if (selectedLeft.length === 0 || isAnimating) return;

    // Start animation
    animatingToRight = true;
    isAnimating = true;

    // Find items to move
    const itemsToMove = leftItems
      .filter((item) => selectedLeft.includes(item.id))
      .map((item, index) => ({
        ...item,
        animating: true,
        direction: "right" as "left" | "right",
        originalIndex: leftItems.findIndex((i) => i.id === item.id),
      }));

    animatingItems = itemsToMove;

    // Create animation elements
    createAnimationElements();

    // Start animation
    let progress = 0;
    const animateInterval = setInterval(() => {
      progress += 0.05;
      animationProgress = progress;
      updateAnimationElements();

      if (progress >= 1) {
        clearInterval(animateInterval);

        // Animation complete, update lists
        rightItems = [
          ...rightItems,
          ...itemsToMove.map((item) => ({
            ...item,
            animating: false,
            direction: undefined,
          })),
        ];

        leftItems = leftItems.filter((item) => !selectedLeft.includes(item.id));
        selectedLeft = [];

        // Reset animation state
        animatingToRight = false;
        animatingItems = [];
        animationProgress = 0;
        isAnimating = false;

        // Update UI
        updateUI();
        console.log(
          "Items moved to right list:",
          itemsToMove.map((item) => item.name)
        );
      }
    }, 16);
  }

  // Move items from right to left
  function moveToLeft() {
    if (selectedRight.length === 0 || isAnimating) return;

    // Start animation
    animatingToLeft = true;
    isAnimating = true;

    // Find items to move
    const itemsToMove = rightItems
      .filter((item) => selectedRight.includes(item.id))
      .map((item, index) => ({
        ...item,
        animating: true,
        direction: "left" as "left" | "right",
        originalIndex: rightItems.findIndex((i) => i.id === item.id),
      }));

    animatingItems = itemsToMove;

    // Create animation elements
    createAnimationElements();

    // Start animation
    let progress = 0;
    const animateInterval = setInterval(() => {
      progress += 0.05;
      animationProgress = progress;
      updateAnimationElements();

      if (progress >= 1) {
        clearInterval(animateInterval);

        // Animation complete, update lists
        leftItems = [
          ...leftItems,
          ...itemsToMove.map((item) => ({
            ...item,
            animating: false,
            direction: undefined,
          })),
        ];

        rightItems = rightItems.filter(
          (item) => !selectedRight.includes(item.id)
        );
        selectedRight = [];

        // Reset animation state
        animatingToLeft = false;
        animatingItems = [];
        animationProgress = 0;
        isAnimating = false;

        // Update UI
        updateUI();
        console.log(
          "Items moved to left list:",
          itemsToMove.map((item) => item.name)
        );
      }
    }, 16);
  }

  // Create animation elements
  function createAnimationElements() {
    // Clear existing animation elements
    while (animationContainer.children.length > 0) {
      animationContainer.children[0].parent = undefined;
    }

    // Create animation elements for each item
    animatingItems.forEach((item) => {
      const animBox = UiBox.create();
      animBox.size.offset.copy(Vec2.create({ x: listWidth - 20, y: 55 }));
      animBox.backgroundColor.copy(Vec3.create({ r: 250, g: 250, b: 250 }));
      animBox.backgroundOpacity = 0.9;
      animBox.parent = animationContainer;

      // Add color indicator
      const colorBox = UiBox.create();
      colorBox.position.offset.copy(Vec2.create({ x: 12, y: 17 }));
      colorBox.size.offset.copy(Vec2.create({ x: 18, y: 18 }));
      colorBox.backgroundColor.copy(hexToVec3(item.color || "#808080"));
      colorBox.parent = animBox;

      // Add item text
      const itemText = UiText.create();
      itemText.position.offset.copy(Vec2.create({ x: 40, y: 17 }));
      itemText.textContent = item.name;
      itemText.parent = animBox;
    });

    // Initial positioning
    updateAnimationElements();
  }

  // Update animation elements position based on animation progress
  function updateAnimationElements() {
    const animBoxes = animationContainer.children;

    animatingItems.forEach((item, index) => {
      if (index >= animBoxes.length) return;

      const animBox = animBoxes[index] as UiBox;

      // Calculate start and end positions
      const startX =
        item.direction === "right"
          ? 20 + 10 // Left list X + left margin
          : containerWidth - listWidth - 20 + 10; // Right list X + left margin

      const endX =
        item.direction === "right"
          ? containerWidth - listWidth - 20 + 10 // Right list X + left margin
          : 20 + 10; // Left list X + left margin

      // Calculate Y positions
      const startY = 20 + 50 + (item.originalIndex || 0) * 60; // List top + header height + index * item height

      // Target position based on current items in the target list
      const targetIndex =
        item.direction === "right"
          ? rightItems.length +
            animatingItems.filter((i) => i.direction === "right").indexOf(item)
          : leftItems.length +
            animatingItems.filter((i) => i.direction === "left").indexOf(item);

      const endY = 20 + 50 + targetIndex * 60; // List top + header height + target index * item height

      // Apply easing
      const easeProgress = easeInOutQuad(animationProgress);

      // Update position
      const currentX = startX + (endX - startX) * easeProgress;
      const currentY = startY + (endY - startY) * easeProgress;

      animBox.position.offset.copy(Vec2.create({ x: currentX, y: currentY }));
    });
  }

  // Update the UI when data changes
  function updateUI() {
    // Update list content
    populateLeftList();
    populateRightList();

    // Update titles
    leftListTitle.textContent = `水果 (${leftItems.length})`;
    rightListTitle.textContent = `蔬菜 (${rightItems.length})`;
  }

  // Update layout based on current screen size
  function updateLayout(screenWidth: number, screenHeight: number) {
    containerWidth = Math.min(screenWidth - 40, 800);
    containerHeight = screenHeight;
    listWidth = (containerWidth - 120) / 2;
    listHeight = containerHeight - 80;

    // Update root container
    rootContainer.size.offset.copy(
      Vec2.create({ x: containerWidth, y: containerHeight })
    );
    rootContainer.position.offset.copy(
      Vec2.create({
        x: (screenWidth - containerWidth) / 2,
        y: (screenHeight - containerHeight) / 2,
      })
    );

    // Full UI update needed after resize
    updateUI();

    console.log("Screen size changed, adjusting layout");
  }
}

// Initialize the transfer list UI
const transferListUI = createTransferListUI();

// Add to UI screen
const uiScreen = UiScreen.create();
transferListUI.parent = uiScreen;
```

## 实现对比

两种实现方式各有优缺点，下面是详细对比：

### React 实现优势

1. **声明式编程**：React 使用 JSX 语法，代码更加简洁易读tsx`<boxstyle={{backgroundColor: Vec3.create({ r:245, g:247, b:250}),size: { offset: Vec2.create({ x: containerWidth, y: containerHeight }) },}}>{/* 组件内容 */}</box>`
2. **状态管理自动化**：使用`useState`和`useEffect`钩子，状态更新会自动触发渲染tsx`const[leftItems,setLeftItems]=useState<ListItem[]>([...]);// 状态更新会自动重新渲染相关组件setLeftItems((prev)=>prev.filter((item)=>!selectedLeft.includes(item.id)));`
3. **组件化思想**：更好的代码组织和复用性tsx`// 可以轻松提取为独立组件functionListItem({item,selected,onSelect}) {return<boxonClick={()=>onSelect(item.id)}>{/* 项目内容 */}</box>;}`
4. **JSX 映射渲染**：使用数组方法快速渲染列表，代码更简洁tsx`{leftItems.map((item,index)=><boxkey={item.id}>{/* 项目内容 */}</box>);}`

### 原生实现优势

1. **性能潜力**：直接操作 UI 节点，理论上可以实现更高的性能ts`// 直接创建和操作 DOM 节点constleftList=UiBox.create();leftList.position.offset.copy(Vec2.create({ x:20, y:20}));`
2. **精细控制**：对 UI 渲染和更新有更精确的控制ts`// 只更新需要变化的部分functionupdateItemBackgroundLeft(itemBox:UiBox,isSelected:boolean) {if(isSelected) {itemBox.backgroundColor.copy(Vec3.create({ r:232, g:240, b:254}));}else{itemBox.backgroundColor.copy(Vec3.create({ r:250, g:250, b:250}));}}`
3. **内存占用**：可能具有更小的内存占用，适合资源受限环境ts`// 只在需要时创建节点functionpopulateLeftList() {// 清除现有节点while(leftListContent.children.length>0) {leftListContent.children[0].parent=undefined;}// 添加新节点// ...}`
4. **更少的抽象层**：没有额外的框架抽象层，减少潜在的复杂性ts`// 直接添加事件监听clearLeftBtn.events.on("pointerdown", ()=>{clearSelectionsLeft();updateUI();});`

### React 实现的不足

1. **额外的抽象层**：React 的虚拟 DOM 和渲染逻辑增加了代码复杂性
2. **更新效率**：某些情况下可能导致不必要的重新渲染tsx`// 状态变化可能导致整个组件树重新渲染setAnimationProgress(progress);`
3. **学习曲线**：需要了解 React 的生命周期和状态管理

### 原生实现的不足

1. **代码冗长**：命令式编程导致代码量更大、重复逻辑较多ts`// 创建并配置多个 UI 元素需要大量重复代码constleftListTitle=UiText.create();leftListTitle.position.offset.copy(Vec2.create({ x:18, y:0}));leftListTitle.textFontSize=16;leftListTitle.textColor.copy(Vec3.create({ r:255, g:255, b:255}));leftListTitle.textContent=\`水果 (${leftItems.length})\`;leftListTitle.parent=leftListHeader;`
2. **手动状态同步**：需要显式调用更新函数同步 UI 状态ts`// 需要手动调用更新函数functionupdateUI() {populateLeftList();populateRightList();leftListTitle.textContent=\`水果 (${leftItems.length})\`;rightListTitle.textContent=\`蔬菜 (${rightItems.length})\`;}`
3. **难以维护**：随着应用复杂度增加，命令式代码的维护难度上升
4. **难以复用**：代码复用性较差，难以提取通用逻辑

## 选择建议

1. **小型项目或性能关键场景**：考虑使用原生 UI 实现
2. **中大型项目或快速开发**：推荐使用 React 实现
3. **团队熟悉度**：基于团队对 React 或原生 API 的熟悉程度选择
4. **混合方案**：在 React 中针对性能瓶颈使用`useImperativeHandle`和`forwardRef`结合原生操作

## 最佳实践

无论选择哪种实现方式，以下是构建高质量双向选择器的最佳实践：

1. **保持状态一致性**：确保左右列表和选中状态始终同步
2. **提供视觉反馈**：通过颜色变化和动画指示当前状态
3. **优化性能**：
  - 只渲染可见项
  - 使用节流或防抖处理频繁事件
  - 避免不必要的状态更新
4. **可访问性**：
  - 支持键盘操作
  - 添加适当的 ARIA 属性
  - 提供足够的颜色对比度
5. **错误处理**：优雅处理空列表和异常情况

## 扩展功能

本示例可以进一步扩展的功能：

1. **搜索/筛选**：在每个列表中添加搜索框
2. **拖拽支持**：允许直接拖拽项目到另一列表
3. **排序功能**：允许用户重新排序列表项
4. **分组/分类**：在列表中添加分组或分类标签
5. **异步数据加载**：支持从服务端加载大型列表并分页显示

通过这些扩展，可以构建更强大和灵活的双向选择器组件，满足各种复杂业务场景的需求。
