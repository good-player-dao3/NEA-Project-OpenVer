class ScriptMotionManager {
    preTick(nextTick) {
        this.currentTick = nextTick;
        for (const group of this.groups.values()){
            if (!group.targetMotion || group.paused) {
                continue;
            }
            const data = group.targetMotion.data;
            if (data.totalTicks === Infinity) {
                continue;
            }
            const startTick = data.startTick;
            const dt = nextTick - startTick;
            if (dt > data.totalTicks) {
                this.schedule(group.targetMotion.onFinish, new GameMotionEvent(nextTick, group.target, group.targetMotion.motionHandler, false));
                group.targetMotion = undefined;
            }
        }
    }
    sendCancelEvent(targetMotion) {
        if (!targetMotion) {
            return;
        }
        this.schedule(targetMotion.onFinish, new GameMotionEvent(this.currentTick, targetMotion.group.target, targetMotion.motionHandler, true));
    }
    createMotionGroup(id, target) {
        const wrapper = new ScriptMotionTarget(id, this, target);
        this.groups.set(id, wrapper);
        return wrapper;
    }
    constructor(resources, schedule, scheduler){
        this.resources = resources;
        this.schedule = schedule;
        this.scheduler = scheduler;
        this.currentTick = 0;
        this.groups = new Map();
    }
}