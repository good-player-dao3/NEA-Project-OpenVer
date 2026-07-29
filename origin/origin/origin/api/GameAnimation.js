class GameAnimation {
    then(resolve, reject) {
        return this.nextFinish().then(resolve, reject);
    }
    constructor(target, keyframes, currentTime, startTime, playState, playbackRate, play, cancel, onReady, nextReady, onFinish, nextFinish){
        this.target = target;
        this.keyframes = keyframes;
        this.play = play;
        this.cancel = cancel;
        this.onReady = onReady;
        this.nextReady = nextReady;
        this.onFinish = onFinish;
        this.nextFinish = nextFinish;
        this.currentTime = 0;
        this.startTime = 0;
        this.playState = GameAnimationPlaybackState.PENDING;
        this.playbackRate = 1;
        Object.defineProperties(this, {
            currentTime: {
                get: currentTime
            },
            startTime: {
                get: startTime
            },
            playState: {
                get: playState
            },
            playbackRate: {
                get: playbackRate
            }
        });
    }
}