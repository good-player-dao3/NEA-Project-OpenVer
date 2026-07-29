class ScriptPhysicsSelectorManager {
    _createSelector(test, selector) {
        const result = new ScriptPhysicsSelector(this.selectors.length, selector, test);
        this.selectors.push(result);
        this.selectorIndex.set(selector, result);
        return result;
    }
    _removeZoneSelector(zone) {
        if (!zone.physicsSelector) {
            return;
        }
        const selectorRef = zone.physicsSelector;
        if (--selectorRef.zones <= 0) {
            this.dirty = true;
        }
        zone.physicsSelector = null;
    }
    addFilter(selectorA, selectorB) {
        let a = new ParsedSelector(selectorA);
        let an = a.toNormalizedSelector();
        let b = new ParsedSelector(selectorB);
        let bn = b.toNormalizedSelector();
        if (bn < an) {
            const t = a;
            a = b;
            b = t;
            const tn = an;
            an = bn;
            bn = tn;
        }
        const aSelector = this.selectorIndex.get(an) || this._createSelector(a, an);
        const bSelector = this.selectorIndex.get(bn) || this._createSelector(b, bn);
        if (aSelector.rules.indexOf(bSelector) < 0) {
            aSelector.rules.push(bSelector);
            if (aSelector !== bSelector) {
                bSelector.rules.push(aSelector);
            }
            this.dirty = true;
        }
    }
    removeFilter(selectorA, selectorB) {
        let an = new ParsedSelector(selectorA).toNormalizedSelector();
        let bn = new ParsedSelector(selectorB).toNormalizedSelector();
        if (bn < an) {
            const t = an;
            an = bn;
            bn = t;
        }
        const aSelector = this.selectorIndex.get(an);
        if (!aSelector) {
            return;
        }
        const bSelector = this.selectorIndex.get(bn);
        if (!bSelector) {
            return;
        }
        const aidx = aSelector.rules.indexOf(bSelector);
        if (aidx < 0) {
            return;
        }
        aSelector.rules.splice(aidx, 1);
        if (aSelector !== bSelector) {
            const bidx = bSelector.rules.indexOf(aSelector);
            if (bidx < 0) {
                return;
            }
            bSelector.rules.splice(bidx, 1);
        }
        this.dirty = true;
    }
    list() {
        const result = [];
        for(let i = 0; i < this.selectors.length; ++i){
            const a = this.selectors[i];
            for(let j = 0; j < a.rules.length; ++j){
                const b = a.rules[j];
                if (a.id <= b.id) {
                    result.push([
                        a.selector,
                        b.selector
                    ]);
                }
            }
        }
        return result;
    }
    clear() {
        if (this.selectors.length > 0) {
            this.selectors.length = 0;
            this.selectorIndex.clear();
            this.groups.length = 0;
            this.groupIndex.clear();
            this.dirty = true;
        }
    }
    _getGroup(selectors) {
        let uuid = '';
        for(let i = 0; i < selectors.length; ++i){
            uuid += selectors[i].id + ',';
        }
        let group = this.groupIndex.get(uuid);
        if (!group) {
            const id = this.groups.length;
            group = new ScriptPhysicsSelectorGroup(id, selectors);
            this.groups.push(group);
            this.groupIndex.set(uuid, group);
            const zoneBin = id >>> 5;
            const zoneBit = 1 << (id & 31);
            for(let i = 0; i < selectors.length; ++i){
                const s = selectors[i];
                const adj = s.rules;
                for(let j = 0; j < adj.length; ++j){
                    adj[j].groups.push(id);
                }
                if (s.zones > 0) {
                    const zg = s.zoneGroup;
                    while(zg.groupBits.length <= zoneBin){
                        zg.groupBits.push(0);
                    }
                    zg.groupBits[zoneBin] |= zoneBit;
                }
            }
            const filter = {};
            const sortedGroups = [];
            for(let i = 0; i < selectors.length; ++i){
                const selectorGroups = selectors[i].groups;
                for(let j = 0; j < selectorGroups.length; ++j){
                    const g = selectorGroups[j];
                    if (!filter[g]) {
                        filter[g] = true;
                        sortedGroups.push(g);
                    }
                }
            }
            sortedGroups.push(id + 1);
            sortedGroups.sort((a, b)=>a - b);
            const rleGroups = CollisionGroupSchema.alloc();
            rleGroups.length = 0;
            this.filter.push(rleGroups);
            rleGroups.push(sortedGroups[0]);
            for(let i = 1; i < sortedGroups.length; ++i){
                const x = sortedGroups[i];
                const y = sortedGroups[i - 1] + 1;
                if (x <= y) {
                    continue;
                }
                rleGroups.push(y, x);
            }
            if (rleGroups[rleGroups.length - 1] === id + 1) {
                rleGroups.pop();
            }
            this.indexDirty = true;
        }
        return group;
    }
    _updateEntityGroup(entity) {
        if (!entity.entity.collides) {
            entity.collisionGroup = null;
            return;
        }
        const selectors = [];
        for(let i = 0; i < this.selectors.length; ++i){
            const selector = this.selectors[i];
            if (selector.test.testEntity(entity)) {
                selectors.push(selector);
            }
        }
        entity.collisionGroup = this._getGroup(selectors);
    }
    update(entities) {
        if (!this.dirty) {
            return;
        }
        let ptr = 0;
        this.zoneSelectors.length = 0;
        for(let i = 0; i < this.selectors.length; ++i){
            const s = this.selectors[i];
            if (s.rules.length <= 0 && s.zones <= 0) {
                this.selectorIndex.delete(s.selector);
            } else {
                s.id = i;
                s.groups.length = 0;
                this.selectors[ptr++] = s;
                if (s.zones > 0) {
                    const zg = s.zoneGroup;
                    zg.id = s.id;
                    zg.groupBits.length = 0;
                    this.zoneSelectors.push(zg);
                }
            }
        }
        this.selectors.length = ptr;
        this.groups.length = 0;
        this.groupIndex.clear();
        CollisionFilterSchema.assign(this.filter, CollisionFilterSchema.identity);
        this._getGroup(this.selectors.filter((s)=>s.test.matchPlayer));
        for(let i = 0; i < entities.length; ++i){
            this._updateEntityGroup(entities[i]);
        }
        this.dirty = false;
        this.indexDirty = true;
    }
    notifyDirty() {
        this.dirty = true;
    }
    constructor(){
        this.dirty = true;
        this.indexDirty = true;
        this.selectors = [];
        this.selectorIndex = new Map();
        this.groups = [];
        this.groupIndex = new Map();
        this.zoneSelectors = [];
        this.filter = CollisionFilterSchema.clone(CollisionFilterSchema.identity);
        this.setZoneSelector = (zone, selectorSrc)=>{
            if (!selectorSrc) {
                this._removeZoneSelector(zone);
            } else {
                const selector = new ParsedSelector(selectorSrc);
                const expr = selector.toNormalizedSelector();
                const selectorRef = this.selectorIndex.get(expr) || this._createSelector(selector, expr);
                if (zone.physicsSelector !== selectorRef) {
                    if (selectorRef.zones++ <= 0) {
                        this.dirty = true;
                    }
                    this._removeZoneSelector(zone);
                    zone.physicsSelector = selectorRef;
                }
            }
        };
    }
}