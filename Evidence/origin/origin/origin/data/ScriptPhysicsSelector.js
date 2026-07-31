class ScriptPhysicsSelector {
    constructor(id, selector, test){
        this.id = id;
        this.selector = selector;
        this.test = test;
        this.rules = [];
        this.zones = 0;
        this.groups = [];
        this.zoneGroup = ZoneSelectorGroupSchema.clone(ZoneSelectorGroupSchema.identity);
    }
}