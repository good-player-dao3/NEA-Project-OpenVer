class ScriptAnimationTarget {
    destroy(reason) {
        for (const anim of this.animations.values()){
            anim.onFinish.destroy(reason, this.manager.scheduler);
            anim.onReady.destroy(reason, this.manager.scheduler);
            this.manager.modifyAnimationSet(anim, false, true);
        }
        this.animations.clear();
        this.manager.groups.delete(this.id);
        this.destroyed = true;
    }
    constructor(id, manager, target){
        this.id = id;
        this.manager = manager;
        this.target = target;
        this.destroyed = false;
        this.animations = new Set();
        this.animate = (keyframes, playbackInfo)=>{
            if (this.destroyed) {
                throw new Error('Animation target is destroyed');
            }
            if (!Array.isArray(keyframes) || keyframes.length < 1) {
                throw new Error('Must specify keyframes for animation');
            }
            if (keyframes.length > this.manager.config.keyframeLimit) {
                throw new Error('Too many keyframes.  Maximum allowed keyframes is ' + this.manager.config.keyframeLimit);
            }
            if (this.manager.animations.size >= this.manager.config.animationLimit) {
                throw new Error('Animation limit exceeded');
            }
            const data = this.manager.binding.schema.alloc();
            data.id = this.manager.idCounter++;
            data.targetId = this.id;
            const animation = new ScriptAnimationWrapper(this, data);
            animation.parsePlayback(playbackInfo);
            this.manager.binding.parse(keyframes, data, this.manager.parserAPI);
            animation.fixReverseWrapOffset(playbackInfo);
            this.manager.modifyAnimationSet(animation, true, true);
            return animation.animation;
        };
        this.getAnimations = ()=>{
            if (this.destroyed) {
                throw new Error('Animation target is destroyed');
            }
            const result = [];
            for (const anim of this.animations.values()){
                if (anim.scheduled) {
                    result.push(anim.animation);
                }
            }
            return result;
        };
        this.flags = manager.binding.flagSchema.clone(manager.binding.flagSchema.identity);
    }
}