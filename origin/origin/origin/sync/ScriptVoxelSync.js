class ScriptVoxelSync {
    isValidVoxelType(b) {
        return this.blockIndex.valid[b & VOXEL_TYPE_MASK];
    }
    cuteBlockType(b) {
        if (typeof b === 'string') {
            return this.voxelId(b);
        }
        const r = b & VOXEL_TYPE_MASK;
        if (this.isValidVoxelType(r)) {
            return r;
        }
        return 0;
    }
    cuteRotation(r) {
        if (typeof r === 'number') {
            return r & 3;
        } else {
            switch(r){
                case 'north':
                case 'n':
                case '北':
                case '0':
                    return 0;
                case 'south':
                case 's':
                case '南':
                case '1':
                    return 1;
                case 'east':
                case 'e':
                case '东':
                case '2':
                    return 2;
                case 'west':
                case 'w':
                case '西':
                case '3':
                    return 3;
            }
        }
        return 0;
    }
    cuteVoxelId(b, r) {
        return this.cuteBlockType(b) | this.cuteRotation(r) << VOXEL_ROTATION_SHIFT;
    }
    reset(voxelConfig) {
        voxelExports.freeVoxels(this.voxels);
        this.voxels = voxelExports.allocVoxels(voxelConfig.x, voxelConfig.y, voxelConfig.z);
        this.voxels.fill(0);
        let ptr = 0;
        for(let z = 0; z < voxelConfig.z; z += CHUNK_SIZE){
            for(let y = 0; y < voxelConfig.y; y += CHUNK_SIZE){
                for(let x = 0; x < voxelConfig.x; x += CHUNK_SIZE){
                    blitBoxesToChunk(this.voxels.slice([
                        x,
                        y,
                        z
                    ], [
                        x + CHUNK_SIZE,
                        y + CHUNK_SIZE,
                        z + CHUNK_SIZE
                    ]), voxelConfig.chunks[ptr++]);
                }
            }
        }
        this.voxelAPI.VoxelTypes = this.blockIndex.name.filter((x)=>!!x).sort();
    }
    preTick(voxelUpdate) {
        if (voxelUpdate.type === 'reset') {
            this.reset(voxelUpdate.data);
        } else if (voxelUpdate.type === 'writes') {
            const writes = voxelUpdate.data;
            for(let i = 0; i < writes.length; ++i){
                const w = writes[i];
                this.voxels.setVoxel(w.x, w.y, w.z, w.b);
            }
        }
        this._shape.x = this.voxels.shape[0] - 1;
        this._shape.y = this.voxels.shape[1] - 1;
        this._shape.z = this.voxels.shape[2] - 1;
    }
    postTick(out) {
        out.length = 0;
        this._pendingWrites.sort(compareWrite);
        for(let i = 0; i < this._pendingWrites.length;){
            const w = this._pendingWrites[i];
            let b = w.b;
            for(; i < this._pendingWrites.length; ++i){
                const o = this._pendingWrites[i];
                if (o.x !== w.x || o.y !== w.y || o.z !== w.z) {
                    break;
                }
                b = o.b;
            }
            if (b !== w.p) {
                const ev = VoxelWriteSchema.alloc();
                ev.x = w.x;
                ev.y = w.y;
                ev.z = w.z;
                ev.b = b;
                out.push(ev);
            }
        }
        this._pendingWrites.length = 0;
    }
    constructor(blockInfo, blockIndex, logger){
        this.blockInfo = blockInfo;
        this.blockIndex = blockIndex;
        this._shape = new GameVector3(32, 32, 32);
        this.voxelId = (name)=>{
            if (typeof name !== 'string' || !(name in this.blockIndex.id)) {
                return 0;
            }
            return this.blockIndex.id[name] | 0;
        };
        this.voxelName = (id)=>{
            if (typeof id !== 'number' || !this.isValidVoxelType(id)) {
                return '';
            }
            return '' + this.blockIndex.name[id & VOXEL_TYPE_MASK];
        };
        this._writeCounter = 0;
        this._pendingWrites = [];
        this.setVoxelId = (x, y, z, b_)=>{
            const b = b_ | 0;
            if (x >= 0 && y >= 0 && z >= 0 && x < this.voxels.shape[0] - 1 && y < this.voxels.shape[1] - 1 && z < this.voxels.shape[2] - 1 && this.isValidVoxelType(b)) {
                const xi = Math.floor(x);
                const yi = Math.floor(y);
                const zi = Math.floor(z);
                const prev = this.voxels.getVoxel(xi, yi, zi);
                if (prev !== b) {
                    this._pendingWrites.push(new PendingVoxelWrite(xi, yi, zi, b, prev, this._writeCounter++));
                    this.voxels.setVoxel(xi, yi, zi, b);
                }
                return b;
            }
            return 0;
        };
        this.setVoxel = (x, y, z, b, r)=>{
            return this.setVoxelId(x | 0, y | 0, z | 0, this.cuteVoxelId(b, r || 0));
        };
        this.getVoxelId = (x, y, z)=>{
            if (x >= 0 && y >= 0 && z >= 0 && x < this.voxels.shape[0] - 1 && y < this.voxels.shape[1] - 1 && z < this.voxels.shape[2] - 1) {
                return this.voxels.getVoxel(Math.floor(x), Math.floor(y), Math.floor(z));
            }
            return 0;
        };
        this.getVoxel = (x, y, z)=>{
            return this.getVoxelId(x, y, z) & VOXEL_TYPE_MASK;
        };
        this.getVoxelRotation = (x, y, z)=>{
            return this.getVoxelId(x, y, z) >>> VOXEL_ROTATION_SHIFT;
        };
        this.logger = logger.create('voxels');
        this.voxels = voxelExports.allocVoxels(32, 32, 32);
        this.voxelAPI = new GameVoxels(this._shape, blockIndex.name.slice(), this.voxelId, this.voxelName, this.setVoxel, this.getVoxel, this.getVoxelRotation, this.setVoxelId, this.getVoxelId);
    }
}