---
title: "Proxy 与 Reflect"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-15-proxy-reflect.html"
---

# Proxy 与 Reflect

Proxy 可拦截对象的基本操作，Reflect 提供与之对应的默认实现。

javascript

```
const data = { hp: 100 };
const p = new Proxy(data, {
  get(target, key, receiver) {
    console.log("get", key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    if (key === "hp" && value < 0) value = 0; // 校正
    return Reflect.set(target, key, value, receiver);
  },
});

p.hp -= 150; // 触发 set
console.log(p.hp); // 0
```

场景：数据验证、响应式、跟踪。

## 常见 Trap 与用途

- get/set：拦截属性读/写（常用于日志、校验、响应式依赖收集）。
- has：拦截`in`操作（如`key in obj`）。
- deleteProperty：拦截`delete obj.key`。
- ownKeys：拦截`Object.keys`、`Reflect.ownKeys`等枚举键。
- defineProperty/getOwnPropertyDescriptor：拦截属性定义与描述符读取。
- apply/construct：拦截函数调用与构造调用（函数/类代理）。

建议搭配`Reflect.*`完成默认行为，避免破坏语言不变量。

## 读写追踪与校验示例

javascript

```
const store = { coins: 0 };
const observed = new Proxy(store, {
  get(t, k, r) {
    console.log("[read]", k);
    return Reflect.get(t, k, r);
  },
  set(t, k, v, r) {
    if (k === "coins" && !Number.isInteger(v))
      throw new TypeError("coins must be int");
    console.log("[write]", k, "=>", v);
    return Reflect.set(t, k, v, r);
  },
});

observed.coins += 1;
```

## 屏蔽私有属性（约定`_`前缀）

javascript

```
const obj = { _secret: 42, value: 7 };
const safe = new Proxy(obj, {
  get(t, k, r) {
    if (String(k).startsWith("_")) return undefined;
    return Reflect.get(t, k, r);
  },
  has(t, k) {
    if (String(k).startsWith("_")) return false;
    return Reflect.has(t, k);
  },
  ownKeys(t) {
    return Reflect.ownKeys(t).filter((k) => !String(k).startsWith("_"));
  },
});

console.log("_secret" in safe); // false
console.log(Object.keys(safe)); // ['value']
```

## 函数/类代理：apply 与 construct

javascript

```
function sum(a, b) {
  return a + b;
}
const logged = new Proxy(sum, {
  apply(target, thisArg, args) {
    console.log("call", args);
    const res = Reflect.apply(target, thisArg, args);
    console.log("=>", res);
    return res;
  },
});
logged(2, 3);

class Enemy {
  constructor(name) {
    this.name = name;
  }
}
const EnemyNew = new Proxy(Enemy, {
  construct(target, args, newTarget) {
    console.log("new Enemy", args);
    return Reflect.construct(target, args, newTarget);
  },
});
new EnemyNew("slime");
```

## 注意语言不变量与可扩展性

- 不要让 trap 返回与目标对象不一致的描述符（如 configurable:false 的属性不能被删除）。
- 冻结或不可扩展对象（`Object.freeze`/`preventExtensions`）时，trap 行为必须与之保持一致。
- 建议用`Reflect`保持与默认语义同步。

## 性能与实践建议

- Proxy 有一定性能开销，热点路径谨慎大量使用；
- 可在开发环境启用代理（调试/日志），生产环境用原对象；
- 对于响应式系统（如 Vue3），利用 get/set 收集与触发依赖是经典做法。

## 练习

1. 实现一个只读代理：禁止写操作并在写入时给出警告。
2. 为某对象实现属性白名单，非白名单属性访问返回 undefined 并记录日志。
3. 为一个函数实现计次代理：统计被调用次数并提供`getCount()`查询。
