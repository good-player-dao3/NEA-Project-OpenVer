class ScriptMotionTarget {
    loadByName(config) {
        if (this.destroyed) {
            throw new Error('Motion target is destroyed');
        }
        const data = this.parseConfig(config);
        const motion = new ScriptMotionWrapper(this, data);
        return motion.motionHandler;
    }
    parseConfig(config) {
        if (typeof config === 'string') {
            const motionName = coerceString(config, '');
            const scriptMotion = this.getScriptMotionByName(motionName);
            return {
                motions: [
                    {
                        motionId: scriptMotion.id,
                        cycleCount: 1
                    }
                ],
                cycleCount: 1,
                startTick: this.getStartTick(),
                totalTicks: this.durationToTicks(scriptMotion.duration)
            };
        }
        if (Array.isArray(config)) {
            const data = {
                motions: [],
                cycleCount: 1,
                startTick: this.getStartTick(),
                totalTicks: 0
            };
            this.parseMotionConfigs(data, config);
            return data;
        }
        const motionClip = coerceMotionClipConfigInfo(config, {
            motions: [],
            iterations: 1
        });
        const data = {
            motions: [],
            cycleCount: motionClip.iterations === Infinity ? -1 : Math.max(motionClip.iterations, 0),
            startTick: this.getStartTick(),
            totalTicks: 0
        };
        this.parseMotionConfigs(data, motionClip.motions);
        data.totalTicks = data.totalTicks * Math.max(motionClip.iterations, 0);
        return data;
    }
    parseMotionConfigs(out, config) {
        config.forEach((motionConfig)=>{
            const motion = coerceMotionConfigInfo(motionConfig, {
                name: '',
                iterations: 1
            });
            const scriptMotion = this.getScriptMotionByName(motion.name);
            out.motions.push({
                motionId: scriptMotion.id,
                cycleCount: motion.iterations === Infinity ? -1 : Math.max(motion.iterations, 0)
            });
            out.totalTicks += this.durationToTicks(scriptMotion.duration) * Math.max(motion.iterations, 0);
        });
    }
    durationToTicks(duration) {
        return duration * 1000 / MS_PER_TICK;
    }
    pause() {
        if (this.paused) {
            return;
        }
        this.paused = true;
        this.pausedTick = this.manager.currentTick;
        this.pausedSnapshot = {
            defaultMotionId: this.defaultMotionId,
            defaultStartTick: this.defaultStartTick,
            targetMotion: this.targetMotion ? {
                data: jsonExports.deepClone(this.targetMotion.data)
            } : undefined
        };
    }
    resume() {
        if (!this.paused) {
            return;
        }
        const currTick = this.manager.currentTick;
        const dt = currTick - this.pausedTick;
        this.defaultStartTick += dt;
        if (this.targetMotion && this.targetMotion.data.motions.length) {
            this.targetMotion.data.startTick += dt;
        }
        this.paused = false;
        this.pausedSnapshot = undefined;
    }
    setDefaultMotionByName(motionName) {
        if (motionName === undefined) {
            this.defaultMotionId = '';
        } else {
            const name = coerceString(motionName, '');
            this.defaultMotionId = this.getScriptMotionByName(name).id;
        }
        this.defaultStartTick = this.getStartTick();
    }
    getStartTick() {
        if (this.paused) {
            return this.pausedTick;
        }
        return this.manager.currentTick;
    }
    getScriptMotionByName(name) {
        const motions = this.manager.resources.getMeshMotionList(this.target.mesh);
        const meshMotion = motions.find((m)=>m.name === name);
        if (!meshMotion) {
            throw new Error(`Cannot find motion name ${name}`);
        }
        return meshMotion;
    }
    destroy(reason) {
        if (this.targetMotion) {
            this.manager.sendCancelEvent(this.targetMotion);
            this.targetMotion.onFinish.destroy(reason, this.manager.scheduler);
            this.targetMotion = undefined;
        }
        this.manager.groups.delete(this.id);
        this.destroyed = true;
    }
    constructor(id, manager, target){
        this.id = id;
        this.manager = manager;
        this.target = target;
        this.destroyed = false;
        this.defaultMotionId = '';
        this.defaultStartTick = 0;
        this.paused = false;
        this.pausedTick = 0;
    }
}