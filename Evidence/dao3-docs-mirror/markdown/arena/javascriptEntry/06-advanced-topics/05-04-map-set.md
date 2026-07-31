---
title: "Map 与 Set"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-04-map-set.html"
---

# Map 与 Set

`Map`适合需要任意键类型的映射；`Set`适合维护不重复集合。

## Map 基础

javascript

```
const mp = new Map();
const keyObj = { id: 1 };
mp.set(keyObj, "metadata");
console.log(mp.get(keyObj)); // 'metadata'
console.log(mp.has(keyObj)); // true
mp.delete(keyObj);
```

## Set 基础

javascript

```
const s = new Set([1, 2, 2, 3]);
console.log(s.size); // 3
s.add(4);
console.log([...s]); // [1,2,3,4]
```

## 何时使用

- Map：键不是字符串/需要稳定遍历顺序；
- Set：数组去重、 membership 查询（是否存在）。

## 迭代与遍历

`Map`与`Set`都是可迭代的，保持插入顺序：

javascript

```
const mp = new Map([
  ["name", "Elara"],
  ["level", 5],
]);

for (const [k, v] of mp) {
  console.log(k, v);
}

const s = new Set(["A", "B", "C"]);
for (const v of s) {
  console.log(v);
}
```

常用迭代器：

javascript

```
mp.keys(); // 键的迭代器
mp.values(); // 值的迭代器
mp.entries(); // [key, value] 迭代器
s.values(); // 与 s.keys() 相同
s.entries(); // [value, value]
```

## 常见操作与转换

javascript

```
// 对象 <-> Map
const obj = { a: 1, b: 2 };
const fromObj = new Map(Object.entries(obj));
const backToObj = Object.fromEntries(fromObj); // { a: 1, b: 2 }

// 数组去重（Set）
const unique = [...new Set([1, 1, 2, 3])]; // [1,2,3]

// 交集、差集、并集（示例）
const A = new Set([1, 2, 3]);
const B = new Set([2, 3, 4]);
const union = new Set([...A, ...B]); // 并集 {1,2,3,4}
const intersect = new Set([...A].filter((x) => B.has(x))); // 交集 {2,3}
const diff = new Set([...A].filter((x) => !B.has(x))); // 差集 {1}
```

## 典型场景

- 配置/元数据字典（键可为对象）：`Map`更直观且不污染原型链。
- 计数器/频率统计：

javascript

```
function countBy(arr) {
  const m = new Map();
  for (const x of arr) m.set(x, (m.get(x) || 0) + 1);
  return m;
}
```

- 访问历史记录/去重：`Set`快速判断是否已出现。
- 图/关系结构：用`Map<Node, Set<Node>>`来表示邻接表。

## 容易踩坑

- 对象键按“引用相等”比较：

javascript

```
const m = new Map();
m.set({ id: 1 }, "X");
console.log(m.get({ id: 1 })); // undefined（不同引用）
```

解决：先缓存对象引用，或使用可稳定标识（如 id 字符串）作为键。

- `Set`与`Map`中 NaN 视为相等（符合 SameValueZero）。
- 不要把`Map`当作 JSON 直接序列化/反序列化，需`Array.from(map)`或`Object.fromEntries`转换。

## 性能与最佳实践

- `Map`/`Set`在大量插入/查找上通常优于对象/数组拼接与`indexOf`；
- 选择合适键：对象引用或稳定的字符串 ID；
- 与`WeakMap`/`WeakSet`区分：后者键/元素是弱引用，适合缓存与私有数据（见相邻章节）。
