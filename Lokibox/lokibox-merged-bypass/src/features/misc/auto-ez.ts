import {
  Feature,
  FeatureBase,
  type FeatureContext,
} from 'src/features/registry';
import { props } from 'src/features/schema';
import { send } from 'src/bridge/iframe';

const Channel = {
  PUBLIC: 'public',
  BEDWARS: 'bedwars',
} as const;

const sex = [
  '呐呐~杂鱼哥哥不会这样就被捉弄的不会说话了吧♡',
  '嘻嘻~杂鱼哥哥不会以为竖个大拇哥就能欺负我了吧~不会吧♡不会吧♡',
  '杂鱼哥哥怎么可能欺负得了别人呢~只能欺负自己哦♡~',
  '哥哥真是好欺负啊♡嘻嘻~',
  '哎♡~杂鱼说话就是无趣唉~',
  '呐呐~杂鱼哥哥发这个是想教育我吗~嘻嘻~怎么可能啊♡',
  '什么嘛~废柴哥哥会想这种事情啊~唔呃',
  '把你肮脏的目光拿开啦~很恶心哦♡',
  '咱的期待就是被你这样的笨蛋破坏了~♡',
];

const bot = [
  '人机🤗。',
  '活着干啥？😅',
  '目测打不过我奶😋。',
  '笑死我了🤣。',
  '令人忍俊不禁🤭。',
  '跳梁小丑😱👉🤡。',
  '底层蝼蚁🐜🤷‍♀️。',
  '给你神爹逗乐了🤮。',
  '你妈叫你回家吃饭🐷。',
  '打的令我爆笑如雷😁。',
  '宛如一个猴子的上蹦下蹿🤣👉🐒。',
  '挂狗开挂就别叫了行不行👌😁。',
  '你这个cps是ac, 瞄准是自瞄乐子外挂我举报给吉吉喵了😂👎。',
  'uns大爹拷打起床战争玩家们, 一群废物不玩无限火力就收着吧😴😴。',
  '乐子开挂还打不过别人, 开不明白连点狗活该被我举报给官方, 吉吉喵马上封号你了懂不懂啊🤣👉🤡。',
  '我已经举报给公安局了一会等着进监狱这就是开ac的下场🤓☝。',
  '开挂还打不过绿玩笑死我了😂👐。',
  '不会破防了吧😭😭。',
  '不要举报我, 我怕进入这个prison啊😭😭😭。',
  '你，,这个。,hakecr, ,我叫我妈,。,妈了，等着进去吧,。😤',
  '你是，。否是一个。鼠标点、点、点、的菜狗🧐👉🐕。',
  '小朋友😁，你以为在游戏里开挂💻就能证明你厉害吗？🤔这恰恰暴露了你的无能🤡和懦弱🙌。',
  '垃圾。开挂还没有跑跳搭。还标题上写legit。我已经举报了。你等着秒封号吧。又一个开挂的。开个挂污染游戏环境。你们这群人真无敌了。尊重这个游戏的玩家很难吗。😁',
  '主播很厉害, 但是很明显你作弊了, 别人头上的悬浮窗已经暴露了你的客户端, 我甚至一眼就能看出来你使用的是什么端, 因为我有你的同款作弊端, 没记错的话这是vepu吧, 我知道的, 王牛牛。',
  '这次我也不想多说什么，无益 我正在使用vape client同款配置4 7 8 0 4 1 9 7 7 ,B站搜"box3"获取同款',
  '就知道开挂 故意把梅露g由爱的画面剪出来, 放给别人看, 如果你没有开挂, 你为什么要分段剪辑？每次打人都不一样, 一看就是在打人的时候把g由爱给关了 呵呵。',
  `我是号主的妈妈, 你们这是什么game啊, 好恶俗啊, 我的孩子已经玩外挂玩疯了, 天天说我吴旭淳要出击嗨屁可搜, 上课直接跟老师说L, 还说成功绕过高中反作弊，这不是中考了直接被抓了个作弊0分 试卷上全写L, 昨天考了个倒数第一回家说要和我们对刀拿实力说话，还说如果不敢就要开了我们的户籍`,
  '你🗣️🉐✔️，🥚4️⃣《⭕🗽》4️⃣🈶🍚哈🏊🏻自主🧐發🉐1️⃣款全🆕开放4️⃣界🎩险🎮。',
  '格斗之王🏆是雷欧😠 光线王子👸是艾斯😎 救场🚑英雄是赛罗😏 最快最强🔥麦克斯😤 未来战士🗡是银河😨 神秘❓奥特是诺亚😦 大家👨‍👨‍👦‍👦一起守护光之国🤓',
];

@Feature({
  id: 'auto-ez',
  displayName: 'AutoEZ',
  folderId: 'misc',
})
export class AutoEZFeature extends FeatureBase<AutoEZFeature> {
  buffer = new Set();

  schema = {
    distance: props.number('Distance', {
      default: 15,
      min: 5,
      max: 100,
      step: 1,
    }),
    channel: props.select('Channel', {
      default: Channel.PUBLIC,
      options: [
        { id: Channel.PUBLIC, name: 'Public' },
        { id: Channel.BEDWARS, name: 'Bedwars' },
      ],
    }),
  };

  onTick(ctx: FeatureContext<AutoEZFeature>): void {
    const self = ctx.core.bodies.getSelfBody();
    const d = ctx.props.distance;
    const ezTarget = ctx.core.bodies
      .getPlayerBodies()
      .filter(({ id, position }) => {
        if (
          id !== self.id &&
          position.toVector3().sqrDist(self.position.toVector3()) < d * d &&
          !this.buffer.has(id)
        ) {
          const damage = ctx.core.damage.getDamageById(id);
          return damage && damage.hp <= 0;
        }
      });

    ezTarget.forEach(({ id }) => {
      this.buffer.add(id);
      setTimeout(() => {
        this.buffer.delete(id);
      }, 5000);
      const name = ctx.core.players.getPlayerById(id)?.name;
      const msg = name + ' ' + getRandom([...sex, ...bot]);
      if (ctx.props.channel === Channel.BEDWARS) {
        ctx.core.remote?.sendServerEvent('chat', { text: msg });
      } else {
        send(msg);
      }
    });
  }
}

function getRandom(arr: string[]) {
  return arr[Math.floor(arr.length * Math.random())];
}
