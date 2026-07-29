class ScriptAnimationWrapper {
    _checkTarget() {
        if (this.group.destroyed) {
            throw new Error('Animation target is destroyed');
        }
    }
    parsePlayback(playback) {
        const data = this.data;
        const info = coercePlaybackInfo(playback, {
            startTick: this.group.manager.currentTick,
            delay: 16,
            endDelay: 0,
            duration: 16,
            direction: GameAnimationDirection.NORMAL,
            iterationStart: 0,
            iterations: 1
        });
        data.startTick = info.startTick + Math.max(info.delay || 0, 0);
        data.endTicks = Math.max(info.endDelay, 0);
        data.cycleTicks = Math.max(0, info.duration);
        data.cycleCount = info.iterations === Infinity ? -1 : Math.max(info.iterations, 0);
        data.cyclePhase = Math.max(info.iterationStart, 0);
        switch(info.direction){
            case GameAnimationDirection.REVERSE:
                data.playbackMode = AnimationPlaybackMode.REVERSE;
                break;
            case GameAnimationDirection.ALTERNATE:
                data.playbackMode = AnimationPlaybackMode.MIRROR;
                break;
            case GameAnimationDirection.ALTERNATE_REVERSE:
                data.playbackMode = AnimationPlaybackMode.MIRROR_REVERSE;
                break;
            case GameAnimationDirection.WRAP:
                data.playbackMode = AnimationPlaybackMode.WRAP;
                break;
            case GameAnimationDirection.WRAP_REVERSE:
                data.playbackMode = AnimationPlaybackMode.WRAP_REVERSE;
                break;
            default:
                data.playbackMode = AnimationPlaybackMode.FORWARD;
                break;
        }
    }
    fixReverseWrapOffset(playbackInfo) {
        if (this.data.playbackMode !== AnimationPlaybackMode.WRAP_REVERSE || typeof playbackInfo !== 'object' || 'iterationStart' in playbackInfo) {
            return;
        }
        const keyframes = this.data.keyframes;
        const l = keyframes[keyframes.length - 1].tick;
        const offset = (l - (keyframes.length >= 2 ? keyframes[keyframes.length - 2].tick : 0)) / Math.max(0.0001, l);
        this.data.cyclePhase += offset;
        if (this.data.cycleCount > 0) {
            this.data.cycleCount += offset;
        }
    }
    constructor(group, data){
        this.group = group;
        this.data = data;
        this.scheduled = false;
        this.readyFired = false;
        this.onReady = new ScriptDispatcher();
        this.onFinish = new ScriptDispatcher();
        this.currentTime = ()=>{
            this._checkTarget();
            const tick = this.group.manager.currentTick;
            const startTick = this.data.startTick;
            if (tick < startTick) {
                return 0;
            }
            if (this.data.cycleCount > 0) {
                const animTicks = Math.max(this.data.cycleTicks * (this.data.cycleCount - this.data.cyclePhase), 0);
                return Math.min(tick - startTick, animTicks);
            } else {
                return tick - startTick;
            }
        };
        this.startTime = ()=>{
            this._checkTarget();
            return this.data.startTick;
        };
        this.playState = ()=>{
            this._checkTarget();
            if (!this.scheduled) {
                return GameAnimationPlaybackState.FINISHED;
            }
            const curTick = this.group.manager.currentTick;
            if (curTick < this.data.startTick) {
                return GameAnimationPlaybackState.PENDING;
            }
            if (curTick < animEndTick(this.data)) {
                return GameAnimationPlaybackState.RUNNING;
            }
            return GameAnimationPlaybackState.FINISHED;
        };
        this.playbackRate = ()=>{
            this._checkTarget();
            return this.data.keyframes[this.data.keyframes.length - 1].tick / this.data.cycleTicks;
        };
        this.play = (playback)=>{
            this._checkTarget();
            if (!this.scheduled) {
                if (this.group.manager.animations.size >= this.group.manager.config.animationLimit) {
                    throw new Error('Animation limit exceeded');
                }
            }
            this.parsePlayback(playback);
            this.fixReverseWrapOffset(playback);
            this.group.manager.modifyAnimationSet(this, true, true);
        };
        this.cancel = ()=>{
            this._checkTarget();
            this.group.manager.modifyAnimationSet(this, false, true);
        };
        this.frames = ()=>{
            this._checkTarget();
            return this.group.manager.binding.serialize(this.data, this.group.manager.parserAPI);
        };
        this.animation = new GameAnimation(group.target, this.frames, this.currentTime, this.startTime, this.playState, this.playbackRate, this.play, this.cancel, this.onReady.channel, this.onReady.future, this.onFinish.channel, this.onFinish.future);
    }
}