class ScriptZoneSystem {
    rebuildPhysicsSelectorIndex() {
        for(let i = 0; i < this.zones.length; ++i){
            const z = this.zones[i];
            if (z.needsPhysicsSelector()) {
                z.prevPhysicsSelectorState = true;
                this.physicsSelectors.setZoneSelector(z, z.currentSelectorString);
            } else {
                z.prevPhysicsSelectorState = false;
                z.physicsSelector = null;
            }
        }
    }
    pollZones(tick, entities) {
        this._tick = tick;
        if (this.zones.length === 0) {
            return;
        }
        for(let i = 0; i < this.zones.length; ++i){
            const t = this.zones[i];
            coerceZone(t.zone, t.zone);
            let stateChanged = false;
            if (t.currentSelectorString !== t.zone.selector) {
                const parsed = t.currentSelectorTest = new ParsedSelector(t.currentSelectorString);
                t.currentSelectorString = parsed.toNormalizedSelector();
                t.zone.selector = t.currentSelectorString;
                stateChanged = true;
            }
            const curPhysics = t.needsPhysicsSelector();
            if (curPhysics && (!t.prevPhysicsSelectorState || stateChanged)) {
                this.physicsSelectors.setZoneSelector(t, t.currentSelectorString);
            } else if (!curPhysics && t.prevPhysicsSelectorState) {
                this.physicsSelectors.setZoneSelector(t, '');
            }
            t.prevPhysicsSelectorState = curPhysics;
            for (const e of t.activeEntities){
                if (!t.testEntity(e)) {
                    t.activeEntities.delete(e);
                    this.schedule(t.onLeave, new GameTriggerEvent(tick, e.entity));
                }
            }
        }
        for(let i = 0; i < entities.length; ++i){
            const e = entities[i];
            for(let j = 0; j < this.zones.length; ++j){
                const t = this.zones[j];
                if (t.activeEntities.has(e)) {
                    continue;
                }
                if (t.testEntity(e)) {
                    t.activeEntities.add(e);
                    this.schedule(t.onEnter, new GameTriggerEvent(tick, e.entity));
                }
            }
        }
    }
    _postTickComponentSparse(synchronizer, component, patch, remove) {
        if (!synchronizer.hasComponent) {
            return;
        }
        const zones = this.zones;
        const resources = this.resources;
        let eptr = 0;
        let cptr = 0;
        while(eptr < zones.length && cptr < component.length){
            const e = zones[eptr];
            const c = component[cptr];
            if (e.id < c.id) {
                if (synchronizer.hasComponent(e.zone, resources)) {
                    const delta = synchronizer.postTick(e.zone, synchronizer.engineSchema.identity, resources) || synchronizer.clone(synchronizer.identity);
                    delta.id = e.id;
                    patch.push(delta);
                }
                eptr++;
            } else if (c.id < e.id) {
                remove.push(e.id);
                cptr++;
            } else {
                if (synchronizer.hasComponent(e.zone, resources)) {
                    const delta = synchronizer.postTick(e.zone, c, resources);
                    if (delta) {
                        delta.id = e.id;
                        patch.push(delta);
                    }
                } else {
                    remove.push(e.id);
                }
                eptr++;
                cptr++;
            }
        }
        while(eptr < zones.length){
            const e = zones[eptr++];
            if (synchronizer.hasComponent(e.zone, resources)) {
                const delta = synchronizer.postTick(e.zone, synchronizer.engineSchema.identity, resources) || synchronizer.clone(synchronizer.identity);
                delta.id = e.id;
                patch.push(delta);
            }
        }
        sortedArrayRemoveExports.sortedArrayDelete(synchronizer.engineSchema, component, remove);
        synchronizeComponent(synchronizer, component, patch, {});
    }
    postTick(update) {
        this.perf.zonesLive = this.zones.length;
        this._postTickComponentSparse(PhysicsZoneBinding, this.physicsZones, update.physicsZones, update.deletedPhysicsZones);
        this._postTickComponentSparse(EnvironmentZoneBinding, this.environmentZones, update.environmentZones, update.deletedEnvironmentZones);
        if (this.physicsSelectors.indexDirty) {
            update.selectorsChanged = true;
            ZoneSelectorGroupSetSchema.assign(update.zoneSelectors, this.physicsSelectors.zoneSelectors);
        } else {
            update.selectorsChanged = false;
            ZoneSelectorGroupSetSchema.assign(update.zoneSelectors, ZoneSelectorGroupSetSchema.identity);
        }
    }
    constructor(resources, schedule, scheduler, physicsSelectors, perf){
        this.resources = resources;
        this.schedule = schedule;
        this.scheduler = scheduler;
        this.physicsSelectors = physicsSelectors;
        this.perf = perf;
        this.zoneCounter = 0;
        this.zones = [];
        this.physicsZones = [];
        this.environmentZones = [];
        this._tick = 0;
        this.listZones = ()=>this.zones.map((t)=>t.zone);
        this.addZone = (config)=>{
            if (this.zones.length > MAX_ZONES) {
                throw new Error('Zone quota exceeded');
            }
            this.perf.zonesCreated++;
            const result = new ScriptZoneWrapper(++this.zoneCounter, this);
            this.zones.push(result);
            ZONE_INDEX.set(result.zone, result);
            coerceZone(config, result.zone);
            result.currentSelectorTest = new ParsedSelector(result.zone.selector);
            result.zone.selector = result.currentSelectorString = result.currentSelectorTest.toNormalizedSelector();
            if (result.needsPhysicsSelector()) {
                result.prevPhysicsSelectorState = true;
                this.physicsSelectors.setZoneSelector(result, result.currentSelectorString);
            } else {
                result.prevPhysicsSelectorState = false;
                result.physicsSelector = null;
            }
            return result.zone;
        };
        this.removeZone = (zone)=>{
            const wrapper = ZONE_INDEX.get(zone);
            if (!wrapper) {
                return;
            }
            this.perf.zonesDestroyed++;
            ZONE_INDEX.delete(zone);
            const idx = this.zones.indexOf(wrapper);
            if (idx >= 0) {
                this.zones.splice(idx, 1);
            }
            for (const e of wrapper.activeEntities){
                this.schedule(wrapper.onLeave, new GameTriggerEvent(this._tick, e.entity));
            }
            wrapper.activeEntities.clear();
            wrapper.onEnter.destroy('removed zone', this.scheduler);
            wrapper.onLeave.destroy('removed zone', this.scheduler);
        };
    }
}