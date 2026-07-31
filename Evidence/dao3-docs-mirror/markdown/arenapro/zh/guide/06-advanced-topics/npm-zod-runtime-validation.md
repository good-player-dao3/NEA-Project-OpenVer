---
title: "教程：用 Zod 做 JavaScript 运行时校验"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/npm-zod-runtime-validation.html"
---

# 教程：用 Zod 做 JavaScript 运行时校验

想象这样一个场景：你在地图里做了个“自定义规则器”，要求玩家输入一段数据，例如：

json

```
{ "name": "Alex", "level": 10, "vip": false }
```

结果玩家们五花八门地输入：有的把`level`写成字符串，有的漏了`name`，还有人把`vip`写成`"yes"`。你的程序要么直接报错，要么需要你写一大坨 if/else 去判断，每个入口都要防御一次，代码变得又长又脆弱。

本教程从浅到深，手把手带你用[Zod](https://zod.dev/)在 ArenaPro 项目中完成数据校验，并作为一次“如何使用 NPM 包”的完整示例：安装、导入、编写、落地到真实场景。

> Zod 是一个声明式、类型安全的运行时校验库。与 TS 类型一一对应，支持链式组合、错误提示友好、类型推导强大。

## 1. 安装 Zod

bash

```
npm install zod
```

## TypeScript 与 Zod 有何不同？

- **TypeScript 是“编译期”的类型系统**
  - 作用时间：只在“开发与构建阶段”。编译后所有类型都会被擦除（运行时不存在类型）。
  - 保障能力：约束你的“代码写法”和 IDE 提示，防止你把`number`当`string`用等“静态错误”。
  - 无法做到：拦截“外部世界”的脏数据（例如`JSON.parse()`返回的内容、`process.env`、玩家输入、后端响应）。
- **Zod 是“运行时”的数据校验与转换**
  - 作用时间：在“程序运行时”对真实数据进行检查和清洗（parse/safeParse/transform）。
  - 保障能力：用声明式 Schema 描述“应当长什么样”，发现不合法数据并给出详细错误；必要时还能做默认值与格式转换。
  - 额外收益：可通过`z.infer<typeof Schema>`自动得到 TS 类型，保持“类型与校验”单一来源。
- **两者是互补关系**：代码对比：为什么仅有 TS 不够？ts`// 仅有 TypeScript 类型，并不能校验运行时数据typeUser={name:string;age:number};// 来自外部的 JSON：类型信息丢失，TS 无法保证其真实结构constraw:unknown=JSON.parse('{"name":"Alex","age":"18"}');// 即便你强转类型，运行时仍可能是错误的（"18" 是字符串）constu=rawasUser;// 编译通过，但运行时并未校验！// u.age + 1// 这里可能出现 NaN 或逻辑错误`ts`// 使用 Zod：运行时校验 + 自动类型推导import{ z }from"zod";constUserSchema=z.object({name: z.string(),age: z.preprocess((v)=>(typeofv==="string"?Number(v):v),z.number().int()),});constparsed=UserSchema.safeParse(JSON.parse('{"name":"Alex","age":"18"}'));if(!parsed.success) {console.error(parsed.error.issues);}else{// parsed.data 的类型自动为 z.infer<typeof UserSchema>constuser=parsed.data;// user.age 现在是 number(18)}`
  - 用 TypeScript 约束你的代码结构与可读性。
  - 用 Zod 守住“数据边界”（IO 入口）：任何来自外部的值，先过 Zod，再进入业务逻辑。

## 2. 第一个 Schema：校验玩家配置

我们从“最小可用”的例子开始，先理解 Zod 的基本用法，然后再看对象校验，最后给出一个稍复杂的玩家配置示例。

1. 最简单：校验基础类型

ts

```
import { z } from "zod";

// 字符串：OK
z.string().parse("Alex");

// 字符串：报错（会抛异常）
// z.string().parse(123);

// 数字：使用 safeParse（不抛异常，返回 success 布尔值）
const age = z.number().int().safeParse(18);
if (!age.success) {
  console.log("不是整数");
} else {
  console.log("校验通过，值为", age.data);
}
```

1. 最小对象：只校验一个字段

ts

```
import { z } from "zod";

const UserSchema = z.object({ name: z.string() });

// OK
UserSchema.parse({ name: "Alex" });

// 报错：name 不是字符串
// UserSchema.parse({ name: 123 });
```

1. 进一步：玩家配置（稍复杂的对象）

ts

```
// client/src/config/playerConfig.ts
import { z } from "zod";

export const PlayerConfigSchema = z.object({
  name: z.string().min(1, "玩家名不能为空"),
  level: z.number().int().min(1).max(100),
  vip: z.boolean().optional().default(false),
});

export function parsePlayerConfig(input: unknown) {
  // parse: 不合法会抛出异常；safeParse：返回 success 布尔值
  return PlayerConfigSchema.parse(input);
}

export type PlayerConfig = z.infer<typeof PlayerConfigSchema>;

// 用法
const data = JSON.parse('{"name":"Alex","level":10}');
const cfg = parsePlayerConfig(data); // 通过则返回强类型对象
```

## 3. 更丰富的类型与组合

- 数组/嵌套对象/枚举/联合：

ts

```
const SkillSchema = z.object({
  id: z.string(),
  cooldownMs: z.number().nonnegative(),
});

const RoleSchema = z.enum(["warrior", "mage", "archer"]);

const PlayerSchema = z.object({
  id: z.string().uuid(),
  role: RoleSchema,
  skills: z.array(SkillSchema).max(8),
  // 联合类型：字符串或数字都可，但会被统一转换为字符串
  teamId: z.union([z.string(), z.number()]).transform(String),
});
```

- 自定义规则（refine/superRefine）：

ts

```
const PositiveEven = z
  .number()
  .int()
  .refine((n) => n > 0 && n % 2 === 0, {
    message: "必须是正偶数",
  });
```

- 预处理（preprocess）和转换（transform）：

ts

```
const DateFromInput = z.preprocess((v) => {
  if (typeof v === "string" || typeof v === "number") return new Date(v);
  return v;
}, z.date());
```

## 4. 错误处理：parse vs safeParse

ts

```
const result = PlayerConfigSchema.safeParse(input);
if (!result.success) {
  console.error("配置不合法", result.error.format());
  // 友好格式化：error.format() 可按字段查看错误
} else {
  // result.data 是通过校验且带类型的值
}
```

> 线上代码建议优先使用`safeParse`，把错误转化为可控的返回值，并结合日志上报。

## 5. 在 ArenaPro 场景的典型用法

- 读取与校验环境变量（配合《管理环境变量》一文）

ts

```
// server/src/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  AP_ENV: z.enum(["development", "production"]).default("development"),
  AP_API_BASE: z.string().url(),
  AP_FEATURE_FLAG: z
    .string()
    .optional()
    .transform((v) => v === "1"),
});

export function getEnv() {
  const raw = {
    AP_ENV: process.env.AP_ENV,
    AP_API_BASE: process.env.AP_API_BASE,
    AP_FEATURE_FLAG: process.env.AP_FEATURE_FLAG,
  } satisfies Record<string, unknown>;

  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      "环境变量不合法: " + JSON.stringify(parsed.error.flatten())
    );
  }
  return parsed.data;
}
```

- 校验服务器返回的数据（防御“后端不可信”）

ts

```
// client/src/services/user.ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
});

export async function fetchUser(userId: string) {
  const res = await fetch(`/api/user/${userId}`);
  const json = await res.json();

  const parsed = UserSchema.safeParse(json);
  if (!parsed.success) {
    // 记录错误并回退到安全默认值
    console.warn("后端返回不符合预期", parsed.error.issues);
    return { id: userId, name: "Unknown", score: 0 } as z.infer<
      typeof UserSchema
    >;
  }
  return parsed.data;
}
```

- 校验玩家输入/表单数据（防止异常导致逻辑崩溃）

ts

```
const FormSchema = z.object({
  action: z.enum(["buy", "sell"]),
  amount: z.number().int().positive(),
});

function onSubmit(raw: unknown) {
  const ok = FormSchema.safeParse(raw);
  if (!ok.success) {
    // 提示玩家输入有误
    return { ok: false, message: "请输入正确的数值" };
  }
  return { ok: true, data: ok.data };
}
```

## 6. 与 TypeScript 的最佳实践

- 使用`z.infer<typeof Schema>`作为“单一类型来源（Single Source of Truth）”。
- 在模块内导出`Schema`与`Type`，避免重复维护 TS 类型。示例：

ts

```
export const ItemSchema = z.object({
  id: z.string(),
  price: z.number().nonnegative(),
});
export type Item = z.infer<typeof ItemSchema>;
```

- 对外暴露“解析函数”，在内部集中使用`safeParse`并统一错误处理：

ts

```
export function parseItem(
  input: unknown
): { ok: true; data: Item } | { ok: false; error: string } {
  const r = ItemSchema.safeParse(input);
  if (!r.success) return { ok: false, error: "Item 不合法" };
  return { ok: true, data: r.data };
}
```

## 7. 性能与组织建议

- 在性能敏感路径（高频 tick）避免过度校验；只在边界（IO 边界/外部输入）做校验。
- 将 schema 拆分为多个小模块，按需组合，便于维护与复用。
- 对复杂 schema 提前编写单元测试，避免线上数据演化导致隐蔽问题。

## 8. 常见问题（FAQ）

- 运行时报错`require is not defined`或`Cannot use import statement outside a module`
  - 请确认你的项目为 ESM 模式（`"type": "module"`），或确保打包工具正确处理。
- 接口/环境变量经常“变形”导致大量报错
  - 对外部输入统一走`safeParse`，并集中记录错误与降级逻辑，避免在业务代码散落 try/catch。
- 与`io-ts`,`yup`的区别？
  - Zod 更贴近 TS 类型系统、链式 API 简洁、类型推导友好；选择哪一个更多取决于团队习惯。

## 9. 参考资料

- Zod 官方文档（强烈推荐）：[https://zod.dev/](https://zod.dev/)
