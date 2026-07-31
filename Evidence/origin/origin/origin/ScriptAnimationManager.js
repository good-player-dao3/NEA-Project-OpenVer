class ScriptAnimationManager {
    preTick(nextTick) {
        const prevTick = this.currentTick;
        this.currentTick = nextTick;
        for (const anim of this.animations.values()){
            const data = anim.data;
            const startTick = data.startTick;
            if (startTick < nextTick && !anim.readyFired) {
                anim.readyFired = true;
                this.schedule(anim.onReady, new GameAnimationEvent(Math.max(startTick, prevTick), anim.group.target, anim.animation, false));
            }
            const endTick = animEndTick(data) + data.endTicks;
            if (endTick < nextTick) {
                this.schedule(anim.onFinish, new GameAnimationEvent(Math.max(prevTick, endTick), anim.group.target, anim.animation, false));
                this.modifyAnimationSet(anim, false, false);
            }
        }
    }
    postTick(changes) {
        this.perf.animationsLive += this.animations.size;
        this.binding.syncSchema.assign(changes, this.binding.syncSchema.identity);
        if (this.dirtyAnimations.size === 0) {
            return;
        }
        for (const id of this.dirtyAnimations.values()){
            const anim = this.animations.get(id);
            if (anim) {
                changes.upserts.push(this.binding.schema.clone(anim.data));
            } else {
                changes.removes.push(id);
            }
        }
        this.dirtyAnimations.clear();
        changes.removes.sort(compareNum$1);
        changes.upserts.sort(idExports.compareId);
    }
    createAnimationGroup(id, target) {
        const wrapper = new ScriptAnimationTarget(id, this, target);
        this.groups.set(id, wrapper);
        return wrapper;
    }
    modifyAnimationSet(animation, active, cancelEvent) {
        if (active) {
            animation.readyFired = false;
            this.dirtyAnimations.add(animation.data.id);
            if (animation.scheduled) {
                return;
            }
            this.perf.animationsCreated++;
            animation.scheduled = true;
            this.animations.set(animation.data.id, animation);
            animation.group.animations.add(animation);
            this.binding.accumFlags(animation.data, animation.group.flags, 1);
        } else {
            if (!animation.scheduled) {
                return;
            }
            this.perf.animationsDestroyed++;
            this.binding.accumFlags(animation.data, animation.group.flags, -1);
            animation.scheduled = false;
            this.animations.delete(animation.data.id);
            animation.group.animations.delete(animation);
            this.dirtyAnimations.add(animation.data.id);
            if (cancelEvent) {
                this.schedule(animation.onFinish, new GameAnimationEvent(this.currentTick, animation.group.target, animation.animation, true));
            }
        }
    }
    constructor(binding, schedule, scheduler, perf, parserAPI, config){
        this.binding = binding;
        this.schedule = schedule;
        this.scheduler = scheduler;
        this.perf = perf;
        this.parserAPI = parserAPI;
        this.config = config;
        this.idCounter = 1;
        this.animations = new Map();
        this.groups = new Map();
        this.currentTick = 0;
        this.dirtyAnimations = new Set();
        this.getAnimations = ()=>{
            return [];
        };
    }
}