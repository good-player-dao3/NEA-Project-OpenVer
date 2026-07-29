---
title: "常驻频道"
source: "https://docs.dao3.fun/api/GameWorld/chat/resident.html"
---

# 常驻频道

## 方法

#### say(message: string): void

向所有玩家广播一条消息

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| message | *是* |  | srting | 要广播的消息 |

点击查看示例代码

javascript

```
/* 玩家进入地图时，向所有玩家发送消息 */
world.onPlayerJoin(({ entity }) => {
  world.say(`${entity.player.name}进入了地图`);
})
```

---

javascript

```
/* 每隔 15 秒广播一条消息，并循环切换内容 */
let seasonDuration = 1000 * 15  // 单位是毫秒：1秒 = 1000 毫秒

async function seasonChange(){
  while(true){
    world.say('春季来临')
    await sleep(seasonDuration)
    world.say('夏季来临')
    await sleep(seasonDuration)
    world.say('秋季来临')
    await sleep(seasonDuration)
    world.say('冬季来临')
    await sleep(seasonDuration)
  }
}

seasonChange() // 调用方法
```

---

javascript

```
function startTimer(){
  const start = new Date().getTime()    // 记录开始计时前的时间。
  const step = 1000 * 1                 // 每隔多少秒，喊一次话。单位是毫秒(1秒 = 1000毫秒)
  const end = 1000 * 5                  // 计时多少秒后结束计时。单位是毫秒(1秒 = 1000毫秒)
  world.say('======开始计时======');
  const interval = setInterval(()=> {
    const current = new Date().getTime()   // 计时过程中的时间
    const duration = current - start       // 计时累计时长。单位是毫秒(1秒 = 1000毫秒)
    if (duration > end) {                  // 如果时长超过结束时间
      world.say('======计时结束======');  // 广播一条消息
      clearInterval(interval);           // 结束计时器
      return;
    }
    world.say(`计时 ${Math.round(duration/1000)} 秒`);  
  }, step);
}

startTimer()  // 调用方法
```

---

#### 事件onChat(handler:(event:[GameChatEvent](./resident.md#GameChatEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当玩家在聊天窗口说话时触发

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | *是* |  | function | 监听到聊天的处理函数 |

点击查看示例代码

javascript

```
// 当玩家发送'grow'文字的时候放大1.2倍，当玩家发送'shrink'文字的时候缩小1.2倍
world.onChat(({ entity, message }) => {
  if (message === 'grow') {
    entity.player.scale *= 1.2;
  } else if (message === 'shrink') {
    entity.player.scale /= 1.2;
  }
})
```

---

javascript

```
// 在聊天窗口回复 '1', 开启飞行功能。
world.onChat(({ entity:user, message }) => {
  if(message === '1'){
    user.player.canFly = true;
    user.player.directMessage(`====开启飞行功能====`)
  }else if (message === '2') {
    user.player.canFly = false;
    user.player.directMessage(`====关闭飞行功能====`)
  }
});
```

---

javascript

```
// 在聊天窗口回复 '1', 世界中的所有实体会与你打招呼
world.onChat(({ entity, message })=>{
  if(message==='1'){ //如果玩家输入是 1
    //让所有实体对TA说欢迎
    let allEntities = world.querySelectorAll('*');
    for(let e of allEntities){
      if(e.isPlayer){continue} //如果实体是玩家, 就跳过
      e.say(`欢迎 ${entity.player.name}`)
    }
  }else if(message==='2'){ //如果玩家输入是 2
    //让位置在(60,0,60)~(70,120,70)之间的实体对你说欢迎
    let foundEntities = world.searchBox(new Game3Bounds3(
      new GameVector3(60, 0, 60),
      new GameVector3(70, 120, 70),
    ))
    for(let e of foundEntities){
      if(e.isPlayer){continue} //如果实体是玩家, 就跳过
      e.say(`你好 ${entity.player.name}`)
    }
  }
})0
```

---

javascript

```
world.onPlayerJoin(({ entity })=>{
  entity.enableDamage = true
});

world.onChat(({ entity, message }) => {
  switch (message) {
    case 'die':
      if (entity.player.dead) { // 如果在说话时已经死亡则跳过
        entity.player.directMessage('你目前已经躺下了。');
        return;
      }
      entity.hurt(entity.maxHp)
      break;
    case 'revive':
      if (!entity.player.dead) { // 在说话时，是否已经死亡
        entity.player.directMessage('你目前还很健康');
        return;
      }
      entity.hp = entity.maxHp
      entity.player.directMessage('原地满血复活！');
      break;
    default:
      break;
  }
})
```

## 接口

#### GameChatEvent

由聊天触发的事件

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| entity | [GameEntity](/api/GameEntity/index.md) | 发起聊天的实体 |
| message | string | 聊天事件中说话的内容 |
| tick | number | 聊天事件发生时间 |
