---
title: "WeakMap 与 WeakSet"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-10-weakmap-weakset.html"
---

# WeakMap 与 WeakSet

WeakMap/WeakSet 持有“弱引用”，键（或元素）只接受对象，且不阻止垃圾回收。常用于缓存、私有数据存放。

## WeakMap

javascript

```
const _privates = new WeakMap();
class Player {
  constructor(name) {
    _privates.set(this, { hp: 100 });
    this.name = name;
  }
  get hp() {
    return _privates.get(this).hp;
  }
  damage(n) {
    _privates.get(this).hp -= n;
  }
}

const p = new Player("Elara");
console.log(p.hp); // 100
p.damage(10);
console.log(p.hp); // 90
// 当 p 不再被引用时，其私有数据也可被回收
```

## WeakSet

javascript

```
const visited = new WeakSet();
function visit(node) {
  if (visited.has(node)) return;
  visited.add(node);
  // ...处理 node
}
```

要点：

- 不能枚举（无 size/forEach），便于 GC；
- 仅对象可作为键（WeakMap）或元素（WeakSet）。

## 与 Map/Set 的差异

- 键/元素类型：WeakMap/WeakSet 仅接受对象；Map/Set 可用任意可哈希（JS 下等价于任何值）。
- 可枚举性：WeakMap/WeakSet 无法枚举（无`keys/values/entries/size`），以避免阻碍 GC。
- 垃圾回收：若弱引用对象仅被 WeakMap/WeakSet 引用，则可被 GC 回收；Map/Set 的引用是强引用。

## 生命周期与 GC 行为（示意）

javascript

```
let obj = { id: 1 };
const wm = new WeakMap();
wm.set(obj, { cache: "data" });

// 当 obj = null 后（且无其他强引用），{ id:1 } 可被 GC 回收
obj = null; // 将来某时，WeakMap 中对应条目也会被回收
```

注意：由于不可枚举，无法“观察”其何时被回收，这是设计使然。

## 常见模式

### 1) 实例私有数据存储

javascript

```
const _privates = new WeakMap();
class Player {
  constructor(name) {
    _privates.set(this, { hp: 100, log: [] });
    this.name = name;
  }
  damage(n) {
    const s = _privates.get(this);
    s.hp = Math.max(0, s.hp - n);
    s.log.push(["damage", n]);
  }
  getState() {
    return _privates.get(this);
  }
}
```

### 2) 结果缓存（memoization）

javascript

```
const cache = new WeakMap();
function expensive(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = computeFrom(obj); // 假设开销很大
  cache.set(obj, result);
  return result;
}
```

### 3) 访问标记（WeakSet）

javascript

```
const seen = new WeakSet();
function traverse(node) {
  if (seen.has(node)) return; // 防止重复或循环
  seen.add(node);
  for (const child of node.children) traverse(child);
}
```

## 容易踩坑

- 不能遍历/统计大小：若需要枚举或统计，请使用 Map/Set；
- WeakMap 键是按引用比较的：需确保使用相同对象实例作为键；
- 不适合需要持久快照或序列化的场景（不可枚举、不可 JSON 化）。

## 最佳实践

- 将 WeakMap 用于对象生命周期绑定的缓存/私有数据，避免手动清理；
- DOM 或图节点遍历时用 WeakSet 标记访问过的节点，避免泄漏；
- 若需调试观察内容，构造额外的日志或开发模式下镜像到普通 Map（注意只在开发环境）。

## 练习

1. 用 WeakMap 为“模型对象”实现惰性计算的属性缓存，并在对象释放时自动回收缓存。
2. 用 WeakSet 在图遍历中防止环导致的无限递归，并记录访问顺序。
3. 将某类的私有状态从闭包/Map 改写为 WeakMap，对比内存与可维护性。
