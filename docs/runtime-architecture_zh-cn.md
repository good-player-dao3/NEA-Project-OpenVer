# 运行时架构

NEA Project OpenVer 保留了分层兼容模型。各层故意保持独立，因为存档的 Player 客户端是证据和渲染/传输消费者，而不是完整服务器实现的证明。

```text
Importable project package
?? client scripts -> Client Script Runtime
?? server scripts -> Server Script Runtime
|
v
MuDB transport
|
v
Authoritative Game Runtime
|
v
Preserved Player browser client
```

## 所有权

| 层 | 主要位置 | 职责 |
| --- | --- | --- |
| 项目包 | `demo-map/`、导入的包 | 地图、脚本清单和项目拥有的内容。 |
| 客户端脚本运行时 | `demo-map/` 和已发布的客户端资产 | 已记录的客户端脚本表面和 UI/事件桥接。 |
| 服务器脚本运行时 | `demo-map/src/runtime/` | 脚本全局变量、世界/实体 API、生命周期事件和兼容性包装器。 |
| MuDB 传输 | `mudb/`、`local-player/`、`runtime-compat/abi/` | 恢复的协议模式和浏览器/服务器传输证据。 |
| 权威游戏运行时 | `local-player/backend/` 加上控制桥接 | Player/实体状态、保留副本数据和面向浏览器的投影。 |

## 证据规则

API 表面可以在其引擎行为恢复之前声明。因此，项目区分可执行的本地适配器和历史声明，并在生成的兼容性矩阵中记录已知缺口。

请结合使用以下工件：

- `runtime-compat/abi/current-runtime.json` 用于可执行的 ABI 条目。
- `runtime-compat/abi/compatibility-matrix.json` 用于规范的覆盖范围/状态。
- `runtime-compat/generated/gap-report.md` 用于人类可读的优先级。
- `runtime-compat/generated/script-corpus-gap-report.md` 用于真实脚本使用压力。
- `runtime-compat/generated/capability-gate-audit.md` 用于每个匿名语料库 API 要求的保守 `ready` / `partial` / `blocked` 启动分类，包括能力授权和可执行绑定证据。

未知行为保持缺失或证据待定；不得用合理近似值替换并呈现为原生 DAO3 行为。

## 平台目标

兼容性目标是已记录和本地恢复的 DAO3 项目/运行时合约，而不是选定的保留作品。捕获的地图是一致性语料库和导入夹具：它们可能优先处理缺失的 API，但可执行行为必须在共享项目包、脚本运行时、传输、权威运行时或 Player 层实现。作品名称、私有事件类型、私有资产标识和地图特定规则永远不能成为运行时分支。

仅当项目包字段、服务器脚本、客户端脚本、资源、UI、传输要求和权威状态依赖项要么通过共享 ABI 实现，要么在启动前报告为明确不支持的能力时，项目才被视为可玩。单个捕获地图的成功启动是这些被执行合约的证据，而非平台兼容性的完成。

因此，项目包携带生成的能力清单。它是导入器和运行时层之间的启动合约，而不是任一脚本运行时的替代品：它记录静态可见的 API、模块、UI、实体、Player 和资源要求，而运行时在调用时继续执行能力。静态不确定性保留为诊断或阻止，而不是静默扩大执行环境。

捕获的运行时包还携带显式的归档相对 Player 运行时和引导清单路径。包构建器通过清单格式发现兼容模板，并将其移至生成的包标识下；后端通过环境配置接收这些路径。旧固定路径仍作为保留独立归档的回退默认值，但生成的项目绝不要求在运行时代码中使用选定的作品名称。

`NEA_RUNTIME_PACKAGE` 在任何运行时层启动之前作为启动描述符进行验证。其包标识、启动器路由、十进制内容 ID 和相对 JSON 清单路径构成一个一致性边界。缺少动态 Player 运行时/引导路径或遍历形路径会阻止启动；它们从不会基于已安装的任意保留归档触发隐式兼容性声明。

恢复包的客户端能力授权选自当前运行时 ABI 中已确认的公共绑定。运行时内部脚本交付被排除，授权与兼容性保持分离：被授权的成员在其证据支持的行为不完整时仍可能是部分的。这避免了过时授予不足和“权限意味着语义完整”的错误主张。

能力清单 v10 还记录项目实际需要的跨层流。客户端模块需要恢复的 `player.game-net.syncClientScriptModules` 交付流；RemoteChannel 调用需要其方向特定的 MuDB 流；经过证据验证的 Player 变换/重生写入需要已确认的权威 Player 状态桥接加上身体轮廓合约；而经过验证的捕获网格 `world.createEntity()` 调用需要回环权威实体投影流。具有多个本地绑定的规范成员选择与静态推断所有者匹配的适配器，而访问模式区分读、写和调用。RuntimeEntity 的 `collides`、`fixed`、`gravity`、`mass`、`friction` 和 `restitution` 写入解析为规范的部分要求，同时经过验证的创建站点提供就绪的投影依赖。这些依赖项共同影响 same ready/partial/blocked 启动决策。属性读取、无关的 Player 扩展和未绑定的脚本本地实体不会被误标记为权威状态流，因为合约证据中不存在这种等价关系。

只有当直接提供者证据证明脚本无法访问时，ABI 条目才可以是 `unavailable`。这与 `declared-only` 不同，后者仅缺少实现证据。所选归档 Player 的 `UiInput.placeholderOpacity` 是第一个此类条目：可渲染项拥有该状态，模块 21031 省略了公共 getter，模块 93474 硬化了构造函数，阻止交付的项目脚本安装兼容包装器。启动门控报告此确切阻止器，而不是将内部字段视为公共 API。

服务器地形访问是一个单独的能力边界。`server.world.voxels` 门控 `voxels` 外观的每个脚本面对成员以及在清单分析时和运行时访问时恢复的 `world.size` 投影。内部物理和权威地形代码保留原始 `GameVoxelsRuntime`；只有服务器脚本运行时全局被包装，因此地形授权不会与实体查询或后端实现层混淆。

相同的门控模式门控已记录的 GameGUI 成员与 `server.gui`，而未知的 GUI 属性保持为普通 JavaScript 项目状态。能力清单分析在分类模块读取和调用之前构建项目范围的静态分配的 `world.*` 和 `gui.*` 表面集。这些条目作为 `script-owned` 发出；它们既不声称 DAO3 兼容性，也不会仅因为地图使用全局变量作为其共享状态命名空间而阻止启动。

GameStorage 隔离在 `server.storage` 后面。服务器脚本运行时公开受门控的外观，同时内部保留原始 `LocalGameStorage` 提供程序。授权和兼容性保持分离：授权允许访问，但 `getGroupStorage()` 仍为部分，因为默认本地提供程序没有证据支持的跨地图命名空间，并故意返回 `undefined` 而不是将其别名为单地图存储。

世界配置使用属性级别的 `server.world.config` 边界，而不是保护整个共享 `world` 命名空间。仅保护恢复的 `gravity`、`airFriction` 和 `fogColor` 属性；地图拥有的状态保持为普通脚本数据。授权后绑定仍为部分，因为本地值分配不是权威求解器或每个连接的 Player 环境已使用该更改的证据。

客户端模块传输取决于包结构，而非源真实性。没有声明的客户端模块意味着没有客户端模块交付流。即使其 UTF-8 源为空，声明的模块仍是传输依赖项，与恢复的 `syncClientScriptModules` 字典合约匹配，并防止分析助手为仅服务器项目发明虚构的 `client.js`。

GameGUI 也是传输依赖的。带有 `server.gui` 的项目要求添加通过 `player.gui` 的 `gui-command` 流，涵盖基于句柄的 init/show/remove/get/set 命令以及协议模式和本地后端传输证明的返回/throw/sendMessage 响应。项目拥有的 `gui.*` 字段保持本地 JavaScript 状态，不创建 MuDB 依赖。

出站服务器聊天被建模为通过 `player.game-chat.log` 的独立 `chat-delivery` 流。仅当调用从服务器脚本运行时向 Player 会话发送文本时，能力清单分析才会添加它：`world.say`、映射实体的 `say` 和针对 Player 的私有消息。`world.onChat`、实体 `onChat` 和 `nextChat` 被故意排除，因为本地证据证明了它们的历史事件形状，但未恢复浏览器到服务器的聊天入口。这使交付一致性不会被误报为双向聊天兼容性。

Player 动作输入被建模为 `input-event-ingress`，从 Player 浏览器客户端直接通过 `player.game-net.input` 到服务器脚本运行时。后端接受恢复的数据包，发出有界结构化事件行，启动器解析器验证并克隆它，运行时使用历史 `ScriptShell` 位掩码和调度顺序重建点击/按下/释放事件。按下/释放使用类型化的 `RuntimeInputEvent` 值；点击使用类型化的 `RuntimeClickEvent` 值，两者都嵌套 `RuntimeRaycastResult`。能力清单分析保留两个事件所有者，并将分配的 player、target、clicker 和 raycast 变量传播到各自的 ABI 所有者。订阅这些事件族的项目在启动时需要此流。客户端脚本不插入路径，不相关世界事件不继承依赖，非 Player 点击目标仍需要经过验证的权威实体绑定。

实体交互是一个单独的 `entity-interact-ingress` 流，通过 `player.entity-interact`。归档的 Player 拥有同步半径目标选择并发送 `{ id, tick }`；后端仅记录接受的协议消息并确认它，而启动器通过权威实体映射解析 id，并再现历史的目标-前-世界 `GameInteractEvent` 调度。该流不声称交互组件投影：`replica.interactive` 在本地仍未被使用，因此脚本运行时 `enableInteract` 写入仍仅脚本可见，无法伪造提示、半径检查、声音或目标。

服务器实体查询共享一个恢复的 `ParsedSelector` 实现。它保留字符串强制、逗号并集语义、`*` / `entity`、`player`、id 和标签匹配、已销毁过滤、实体顺序以及规范 `testSelector(selector, entity)` 签名。`querySelectorAll` 返回恢复的新可变结果数组，保持脚本修改与权威运行时集合分离。它故意不将空格重新解释为 CSS 交集语法，也不将 `#` 映射为显示名称。全局 API 仍为部分，因为历史泛型 `testComponent` 辅助程序缺失，但能力清单可以在每次调用仅由恢复令牌组成的字面量时，将具体项目要求标记为就绪。动态和未知组件路径保持部分。

项目启动在客户端脚本/UI 发布、块目录加载、脚本运行时构建、后端生成或 Player 导航之前使用单独的能力清单门控。门控要求当前清单模式，并将其 API 版本和客户端/服务器合约 id 绑定到选定的 `dao3.project.json.engine`；兼容性结果不能针对另一个运行时合约重放。清单 v10 按 side、同步名称、字节长度和 SHA-256 绑定每个分析的服务器/客户端模块，绑定影响要求解析的确切能力授权，通过规范 JSON 摘要绑定已验证的客户端 UI 状态，绑定规范化的资产文件标识加上项目实体 `id/kind/mesh` 投影证据，并绑定 `current-runtime.json`、`compatibility-matrix.json` 和 `runtime-contracts.json` 的语义内容。运行时 ABI 摘要递归排除易变的 `generatedAt` 字段，但拒绝语义条目或合约更改。运行时包启动从项目服务器文件、Player 归档客户端/UI 文件、资产索引、实体快照和当前仓库 ABI 工件重建这些输入，然后读取每个资产主体并验证索引字节长度和 SHA-256；直接导入在发布前验证相应的内存输入、ABI 工件和资产字节。非能力世界状态（如实体位置）不在此摘要内。门控验证封闭状态词汇表，重新计算每个汇总计数器，并从每个证据集合派生状态，而不是信任清单报告：要求、模块解析、资源、UI、实体、跨运行时依赖和静态诊断。`script-owned` 仅在要求清单中被接受。版本/合约不匹配、模块集/哈希不匹配、授权集不匹配、UI/资产/实体摘要不匹配、运行时 ABI 语义不匹配、资产主体不匹配、摘要不匹配、声明/派生状态不匹配或未知状态均为无效包状态；任何派生的阻止器都会停止启动，而每个部分项都包含在启动警告中。

服务器持久性保持为独立的脚本运行时服务，而非 MuDB 游戏传输。`RuntimeGameStorage` 创建项目本地的 `RuntimeDataStorage` 命名空间，由原子文件替换支持，递归强制执行声明的 JSONValue 联合，无需序列化器强制，并通过一个进程本地变异队列序列化 set、async update、increment、remove 和 destroy 操作；这防止了同进程丢失更新，而不声称分布式锁定。`RuntimeQueryList` 建模页索引游标遍历和恢复的最后一页行为。本地列表查询强制实施文档化的页大小上限，最多遍历五个 `constraintTarget` 级别，对无效或缺失路径发出警告并回退到存储值，应用数字 `min`/`max`，并对同类型标量目标排序。能力分析传播返回的对象类型。每个成员仍为部分，因为历史云数据库提供了配额、分布式票据/重试语义、后端错误映射、跨进程一致性、精确的自然/混合类型排序和权威组范围。默认启动器阻止 `getGroupStorage()`，而不是发明团队/组标识符。

服务器区域保持在脚本运行时层内。`RuntimeGameZone` 保留恢复的可调用世界生命周期（`addZone`、`removeZone`、`zones`）、规范化和变异刷新的选择器成员资格、`collides=false` 排除、实体边界重叠测试、`{ tick, entity }` 进入/离开事件以及区域拥有的移除。能力分析传播返回的 `GameZone` 所有者。非 Player/实体组件选择器仍不受支持，因为历史 `testComponent` 辅助程序未恢复。原生物理选择器和 Player 端环境渲染是单独未恢复的层，因此区域 force、fog、rain、snow 和 sky 字段保持显式部分配置，而非模拟成功。

捕获网格 RuntimeEntity 物理属性通过现有的回环实体状态传输跨越脚本运行时/权威运行时边界。初始和后续整体属性 `collides`、`fixed`、`gravity`、`mass`、`friction` 和 `restitution` 值被验证并复制到权威 `replica.body` 中，连同变换状态，重建补丁保留相同的更新路径。这关闭了脚本可见写入的仅恢复 ABI 缺口，但仍为部分：权威运行时将通用实体主体序列化到 Player，并不对这些属性执行原生通用刚体求解器。

流体接触检测停留在权威物理层，仅消费保留的 BlockInfo 流体 id 和当前 Player 主体 AABB。固定步状态保留活动体素重叠并生成进入/离开转换；服务器脚本运行时构造类型化的 `RuntimeFluidContactEvent`，包含历史 `tick`、`entity` 和 `voxel` 字段，并按 world-before-entity 调度。能力分析通过内联和命名的 world/entity 处理程序携带该事件所有者。活动 `fluidContacts` 使用文档化的本地 AABB 重叠分数。原生流体力和历史生成器的精确体积计算仍未实现，而不是从视觉块元数据推断。

固体体素接触生成从本地固定步物理层跨越到服务器脚本运行时，作为类型化的 `RuntimeVoxelContactEvent`。其八个规范字段和 world-before-entity 调度由恢复的 ScriptShell 和声明支持。能力分析通过内联和命名处理程序携带此事件所有者，而本地碰撞器诊断保持为扩展。这仅增加对象 ABI 保真度，并不声称本地扫掠求解器再现了原生刚体引擎或每个 GameEntity/GameVector3 行为。

滴答事件计时由服务器脚本运行时时钟边界拥有。运行时保留历史墙上时钟经过公式和滴答跳过谓词，同时保持固定步物理集成分离。由于本地调度器没有权威多滴答帧源，它每个回调前进一个滴答，并不从主机计时器延迟推断跳过的引擎帧。

射线投射结果所有权在脚本运行时和启动门控中保留。`world.raycast` 构造一个 `RuntimeRaycastResult`，包含直接从历史 `GameRaycastResult` 源恢复的九个字段，而能力清单传播结果所有者和嵌套的 `hitEntity` 所有者。这仅是对象 ABI 适配器；不引入传输流，也不将底层的本地 AABB 实体交集、RuntimeEntity/RuntimePlayer 子集或本地向量表示从部分兼容性升级。

商务事件在能力清单层被证据阻止。恢复的 `market-script` 传输证明了市场打开和购买确认方向，而文档证明 `GamePurchaseSuccessEvent` 包含 `tick`、`userId`、`productId` 和 `orderId`。没有恢复的 Player 或后端生产者将购买成功转发到服务器脚本运行时，因此订阅该事件的项目在启动前停止。泛型运行时信号仍为内部外壳，不会提升为传输能力。

入站聊天遵循相同规则。历史声明证明了 `GameChatEvent` 形状，但恢复的 `player.game-chat` 族目前仅证明出站显示。没有 Player/浏览器到后端的聊天生产者，`world.onChat` 和 `world.nextChat` 是启动阻止器。匿名能力门控审计使用显式证据阻止表用于聊天入口、购买入口和组存储范围，使其汇总状态与每个项目的启动行为匹配。

伤害和重生变异被建模为 `damage-state-projection`，从服务器脚本运行时到权威游戏运行时，然后进入恢复的 Player `game-net.PUBLIC.damage` / `scriptEvents.damage` 表面。本地控制桥接经过身份验证，并验证目标是否恰好是一个绑定的 Player 会话或权威实体 id。能力清单分析仅对 `hurt()`/`forceRespawn()` 调用和对 `hp`、`maxHp` 或 `showHealthBar` 的写入要求此流；读取和生命周期订阅保持为本地消费者。没有权威绑定的脚本本地实体保留本地事件，但从不分配伪造的 Player 伤害状态。

脚本产生的伤害使用类型化的 `RuntimeDamageEvent`，并保留历史损坏实体-前-世界调度。能力分析通过处理程序携带事件所有者和嵌套的受害者/攻击者所有者。此类型化负载不创建新的入口路径：独立源自原生权威引擎的伤害仍未证实，因此保持事件族为部分。

相关的正 hp 到零转换使用类型化的 `RuntimeDieEvent`，并保留相同的历史 dying-entity-before-world 调度。能力分析携带 `GameDieEvent` 及其嵌套的受害者/攻击者所有者，但适配器仍为部分，因为未恢复独立的原生死亡状态生成器。

本地强制重生使用不同的类型化 `RuntimeRespawnEvent`，仅包含 `tick` 和重生的 `GamePlayerEntity`，保留历史 player-before-world 调度。它不再重用更广泛的实体生命周期负载或公开伪造的 `player` 别名。自动原生重生生产未经验证，因此此适配器为部分。

实体交互入口使用类型化的 `RuntimeInteractEvent`，携带发起 Player 和映射的权威目标。目标在 world 监听器之前接收事件，能力清单所有者传播区分 `GamePlayerEntity` 和 `GameEntity`。这不声称原生交互组件投影：提示、半径选择、声音以及与未映射脚本本地目标的浏览器交互仍不可用。

世界滴答交付使用类型化的 `RuntimeTickEvent`。ABI 区分恢复的 `tick`、`prevTick`、`skip` 和 `elapsedTimeMS` 字段与本地 `deltaTime` 便利扩展。历史墙上时钟计算被保留，而缺少权威多帧调度器输入使延迟追赶行为保持部分。

服务器脚本运行时使用类型化的 `RuntimeChatEvent` 表示聊天负载，但对象形状和入口是分离的关注点。历史声明和 ScriptShell 证明 `tick`、`entity`、`message` 和 world-before-entity 调度；恢复的本地传输仅证明出站显示。因此，能力清单报告类型化的部分字段，同时为 `world.onChat` 和 `world.nextChat` 保留硬启动阻止器。

购买成功遵循相同的对象与入口分离。`RuntimePurchaseSuccessEvent` 表示四个声明字段以用于静态 ABI 分析，而恢复的 `market-script` 打开和确认方向不证明浏览器/后端生产者能够产生服务器脚本运行时事件。两个购买订阅仍是硬启动阻止器。

键盘输入与动作按钮输入分离。`RuntimeKeyBoardEvent` 建模声明的 `tick` 和 `keyCode`，而历史生产者需要当前和先前键盘状态数组。恢复的本地数据包仅携带按钮位掩码，因此键盘订阅是要求级别的启动阻止器，不由现有的按下/释放传输满足。

实体到实体碰撞也与本地泛型碰撞器抽象分离。历史 `bodyContact` 和 `bodySeparate` 携带两个实体 id、轴和力；当前求解器没有等效生成器。规范接触订阅因此是启动阻止器，而 `world.onContact` / `onContactSeparate` 保持为非规范的本地扩展，没有适配器关系。

生成的可执行 ABI 在世界、实体和 Player 订阅中一致地引用类型化事件对象。结构内联负载类型仅保留给明确本地或传输特定的事件，且没有恢复的规范对象，防止文档为同一实现事件呈现两个不兼容的形状。

捕获的动态实体复制被单独建模为 `runtime-entity-projection`，通过经过身份验证的 `nea-control.runtime-entity` 创建/状态/销毁操作。启动器仅从接受的 Capability Manifest 中的 `validated-mesh` 资源派生白名单，并将其传递给服务器脚本运行时。后端在生成权威副本之前执行独立的投影描述符查找。只有使用经过验证网格的静态标识脚本实体才会添加此启动依赖；未知或动态网格名称保持部分和脚本本地，没有伪造的边界、几何、碰撞体或后端 id。

Player 对话框被建模为 `dialog-rpc`，直接从服务器脚本运行时通过 `player.dialog` 到 Player 浏览器客户端。经过身份验证的本地控制桥接支持打开并等待结果以及按会话取消所有操作；后端保留 RPC id、验证关闭结果、解析匹配的 promise，并拒绝已取消或断开的调用。能力清单分析仅对 `dialog()` 和 `cancelDialogs()` 调用添加此依赖。API 仍为部分，因为传输一致性不证明每个可选对话框配置字段或历史错误/计时行为。

Player 包装器创建和移除被建模为 `player-session-lifecycle`，从 Player 浏览器客户端的 game-net 会话进入服务器脚本运行时。结构化后端事件使用完整的 SHA-256 派生桥接标签，而非先前的可读前缀/后缀缩写。解析器要求该格式，后端控制/会话注册表解析相同标签，同时保留对精确或旧标签的临时兼容性。这消除了模糊的会话冲突，而不发布原始会话令牌。它仍然仅提供本地匿名 RuntimePlayer 身份，因此生命周期传输就绪并不暗示完整的 DAO3 账户/档案语义。

由 player 加入/离开和实体创建/销毁共享的生命周期负载使用类型化的 `RuntimeEntityEvent`。两个历史字段被保留，回调所有权通过 world 和 entity 处理程序传播；`player` 仅作为本地别名保留。脚本创建的生命周期和经过身份验证的 Player 会话生命周期是真实的本地生产者，而不相关的原生引擎创建或销毁仍处于已证明的入口边界之外。