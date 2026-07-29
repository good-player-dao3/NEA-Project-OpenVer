    function GameAnalytics(/**
     * 神策埋点实例
     * @example
     * const sa = analytics.sensor;
     * world.onPlayerJoin(({ entity }) => {
     *    console.log(entity.player.userId)
     *    // 初始化神策配置
     *    sa.init('https://shence-data.XXX.cn/sa?project=XXX&token=XXX')
     *    // 追踪一个测试事件
     *    sa.track(entity.player.userId, 'test', { n: 3, s: 'string', b: true, d: Date.now() })
     * })
     */ sensor) {
        this.sensor = sensor;
    }