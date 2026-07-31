class ScriptZoneWrapper {
    needsPhysicsSelector() {
        if (this.zone.fogEnabled || this.zone.rainEnabled || this.zone.skyEnabled || this.zone.snowEnabled) {
            return true;
        }
        const f = this.zone.force;
        if (f instanceof GameVector3) {
            return !!(f.x || f.y || f.z);
        } else if (Array.isArray(f)) {
            return !!(f[0] || f[1] || f[2]);
        }
        return false;
    }
    testEntity(wrapper) {
        if (!wrapper.entity.collides) {
            return false;
        }
        if (!this.currentSelectorTest.testEntity(wrapper)) {
            return false;
        }
        const bounds = this.zone.bounds;
        const ebounds = wrapper.entity.bounds;
        const epos = wrapper.entity.position;
        const lo = bounds.lo;
        const hi = bounds.hi;
        if (epos.x < lo.x - ebounds.x || epos.y < lo.y - ebounds.y || epos.z < lo.z - ebounds.z || epos.x > hi.x + ebounds.x || epos.y > hi.y + ebounds.y || epos.z > hi.z + ebounds.z) {
            return false;
        }
        return true;
    }
    constructor(id, system){
        this.id = id;
        this.physicsSelector = null;
        this.currentSelectorString = '*';
        this.currentSelectorTest = new ParsedSelector('*');
        this.activeEntities = new Set();
        this.onEnter = new ScriptDispatcher(false);
        this.onLeave = new ScriptDispatcher(false);
        this.entities = ()=>{
            const result = [];
            for (const e of this.activeEntities){
                result.push(e.entity);
            }
            return result;
        };
        this.prevPhysicsSelectorState = false;
        this.zone = new GameZone(this.entities, this.onEnter.channel, this.onEnter.future, this.onLeave.channel, this.onLeave.future, ()=>system.removeZone(this.zone));
    }
}