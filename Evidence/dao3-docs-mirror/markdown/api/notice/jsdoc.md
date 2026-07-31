---
title: "JSDoc：JavaScript 的 API 文档生成器"
source: "https://docs.dao3.fun/api/notice/jsdoc.html"
---

# JSDoc：JavaScript 的 API 文档生成器

## 基础概念

JSDoc 是一个用于 JavaScript 的 API 文档生成器，它通过特殊的注释格式来描述代码的结构和行为。JSDoc 注释以`/** ... */`的形式出现，包含特定的标签来描述代码的不同方面。

官方文档：[https://www.jsdoc.com.cn/](https://www.jsdoc.com.cn/)

## 使用示例

### 函数文档示例

javascript

```
/**
 * 表示一本书。
 * @constructor
 * @param {string} title - 书的标题。
 * @param {string} author - 书的作者。
 * @returns {Book} 返回一个新的Book实例
 */
function Book(title, author) {
  this.title = title;
  this.author = author;
}
```

### 变量类型声明示例

javascript

```
/**
 * UI文本元素
 * @type {UiText}
 */
const text = ui.findChildByName("text-1");
```

### 方法文档示例

javascript

```
/**
 * 计算两个数字的和
 * @param {number} a - 第一个数字
 * @param {number} b - 第二个数字
 * @returns {number} 两个数字的和
 * @throws {Error} 当参数不是数字时抛出错误
 */
function add(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("参数必须是数字");
  }
  return a + b;
}
```

## 常用标签参考

### 基础标签

- **@type {类型}**- 指定变量或属性的类型
- **@param {类型} 参数名 - 描述**- 描述函数参数
- **@returns {类型} 描述**- 描述返回值
- **@throws {错误类型} 描述**- 描述可能抛出的错误

### 类相关标签

- **@constructor**- 标记构造函数
- **@class**- 标记类
- **@extends**- 指定父类
- **@implements**- 指定实现的接口
- **@property {类型} 属性名 - 描述**- 描述类的属性

### 文档组织标签

- **@example**- 提供代码示例
- **@see**- 相关引用
- **@since**- 指定功能加入的版本
- **@deprecated**- 标记已废弃的功能

### 高级标签

- **@callback**- 定义回调函数类型
- **@typedef**- 定义自定义类型
- **@namespace**- 定义命名空间
- **@module**- 定义模块
- **@private**- 标记私有成员
- **@public**- 标记公共成员
- **@readonly**- 标记只读属性

提示

- JSDoc 注释必须以`/**`开始，以`*/`结束
- 每行注释前可以添加`*`以提高可读性
- 标签名称前必须加`@`符号
- 类型声明使用花括号`{}`包裹
