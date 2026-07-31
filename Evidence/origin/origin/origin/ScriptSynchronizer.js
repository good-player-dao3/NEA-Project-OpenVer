class ScriptSynchronizer {
    free(x) {
        for(let i = 0; i < x.ids.length; ++i){
            const id = x.ids[i];
            const data = x.data[i];
            this.schemas[id].free(data);
        }
        x.ids.length = 0;
        x.data.length = 0;
        ScriptSyncPool.push(x);
    }
    clone(x) {
        const result = allocScriptSyncPatch();
        result.id = x.id;
        for(let i = 0; i < x.ids.length; ++i){
            const id = x.ids[i];
            const data = x.data[i];
            result.ids.push(id);
            result.data.push(this.schemas[id].clone(data));
        }
        return result;
    }
    equal(x, y) {
        if (x.id !== y.id || x.ids.length !== y.ids.length) {
            return false;
        }
        for(let i = 0; i < x.ids[i]; ++i){
            const id = x.ids[i];
            if (id !== y.ids[i] || !this.schemas[id].equal(x.data[i], y.data[i])) {
                return false;
            }
        }
        return true;
    }
    assign(x, y) {
        x.id = y.id;
        for(let i = 0; i < x.ids.length; ++i){
            const id = x.ids[i];
            const data = x.data[i];
            this.schemas[id].free(data);
        }
        x.ids.length = 0;
        x.data.length = 0;
        for(let i = 0; i < y.ids.length; ++i){
            const id = y.ids[i];
            const data = y.data[i];
            x.ids.push(id);
            x.data.push(this.schemas[id].clone(data));
        }
        return x;
    }
    toJSON(x) {
        return {
            id: x.id,
            ids: x.ids.slice(),
            data: x.data.map((y, i)=>this.schemas[x.ids[i]].toJSON(y))
        };
    }
    fromJSON(y) {
        const result = allocScriptSyncPatch();
        if (Array.isArray(y.ids) && Array.isArray(y.data) && y.ids.length === y.data.length) {
            for(let i = 0; i < y.ids.length; ++i){
                const id = y.ids[i];
                const data = y.data[i];
                if (typeof id === 'number' && (i === 0 || y.ids[i - 1] < id) && 0 <= id && id < this.schemas.length) {
                    result.ids.push(id);
                    result.data.push(this.schemas[id].fromJSON(data));
                } else {
                    break;
                }
            }
        }
        result.id = y.id | 0;
        return result;
    }
    diff(_, target, stream) {
        stream.grow(8);
        stream.writeUint32(target.id);
        stream.writeUint32(target.ids.length);
        for(let i = 0; i < target.ids.length; ++i){
            const id = target.ids[i];
            const head = stream.offset;
            stream.grow(4);
            stream.offset += 4;
            const schema = this.schemas[id];
            const hasPatch = schema.diff(schema.identity, target.data[i], stream);
            stream.writeUint32At(head, id << 1 | +hasPatch);
        }
        return true;
    }
    patch(_, stream) {
        const result = allocScriptSyncPatch();
        result.id = stream.readUint32();
        const count = stream.readUint32();
        for(let i = 0; i < count; ++i){
            const info = stream.readUint32();
            const id = info >> 1;
            const needsPatch = info & 1;
            if (id < 0 || id >= this.schemas.length || i > 0 && id <= result.ids[i - 1]) {
                throw new Error('bad sync packet from script shell');
            }
            const schema = this.schemas[id];
            result.ids.push(id);
            if (needsPatch) {
                result.data.push(schema.patch(schema.identity, stream));
            } else {
                result.data.push(schema.clone(schema.identity));
            }
        }
        return result;
    }
    constructor(name, engineSchema, bindings, hasComponent, setComponent){
        this.name = name;
        this.engineSchema = engineSchema;
        this.bindings = bindings;
        this.hasComponent = hasComponent;
        this.setComponent = setComponent;
        this.muType = 'synchronizer';
        this.identity = {
            id: 0,
            ids: [],
            data: []
        };
        this.pool = [];
        this.alloc = allocScriptSyncPatch;
        const schemas = this.schemas = bindings.map((b)=>b.schema);
        this.muData = {
            type: 'synchronizer',
            data: schemas.map((s)=>s.muData)
        };
        this.json = {
            type: 'synchronizer',
            data: schemas.map((s)=>s.json)
        };
        const procs = generateSyncMethods(name, bindings);
        this.preTick = procs.preTick;
        this.postTick = procs.postTick;
        this.synchronize = procs.synchronize;
    }
}