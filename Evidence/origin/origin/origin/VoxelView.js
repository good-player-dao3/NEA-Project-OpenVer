    class VoxelView {
	    getVoxel(x, y, z) {
	        return this.getVoxelByPtr(this.index(x, y, z));
	    }
	    getVoxels() {
	        const voxels = [];
	        (0, helper_1.traverseVoxels)(this, [
	            0,
	            0,
	            0
	        ], this.shape.map((v)=>v - 1), (i, j, k, d)=>{
	            if (d != 0) {
	                voxels.push([
	                    i,
	                    j,
	                    k
	                ]);
	            }
	        });
	        return voxels;
	    }
	    getDimension() {
	        return gl_matrix_1.vec3.add(gl_matrix_1.vec3.clone(this.shape), this.shape, [
	            -1,
	            -1,
	            -1
	        ]);
	    }
	    index(x, y, z) {
	        return this.stride[0] * x + this.stride[1] * y + this.stride[2] * z + this.offset;
	    }
	    contains(x, y, z, start, end) {
	        return x >= start[0] && x < end[0] && y >= start[1] && y < end[1] && z >= start[2] && z < end[2];
	    }
	    setVoxel(x, y, z, b) {
	        return this.setVoxelByPtr(this.index(x, y, z), b);
	    }
	    setVoxelRotate(x, y, z, rotate) {
	        const b = this.getVoxel(x, y, z) | rotate << 14;
	        return this.data[this.stride[0] * x + this.stride[1] * y + this.stride[2] * z + this.offset] = b;
	    }
	    slice(lo, hi) {
	        return new VoxelView(this.data, [
	            hi[0] - lo[0],
	            hi[1] - lo[1],
	            hi[2] - lo[2]
	        ], this.stride, this.offset + this.stride[0] * lo[0] + this.stride[1] * lo[1] + this.stride[2] * lo[2], this.dataStart, this.dataEnd, this.dataStride);
	    }
	    transpose(px, py, pz) {
	        return new VoxelView(this.data, [
	            this.shape[px],
	            this.shape[py],
	            this.shape[pz]
	        ], [
	            this.stride[px],
	            this.stride[py],
	            this.stride[pz]
	        ], this.offset);
	    }
	    step(sx, sy, sz) {
	        return new VoxelView(this.data, [
	            Math.floor(this.shape[0] / sx),
	            Math.floor(this.shape[1] / sy),
	            Math.floor(this.shape[2] / sz)
	        ], [
	            this.stride[0] * sx,
	            this.stride[1] * sy,
	            this.stride[2] * sz
	        ], this.offset);
	    }
	    copy(other) {
	        const [nx_, ny_, nz_] = this.shape;
	        const [mx_, my_, mz_] = other.shape;
	        const nx = Math.min(nx_, mx_);
	        const ny = Math.min(ny_, my_);
	        const nz = Math.min(nz_, mz_);
	        const tdata = this.data;
	        const [tx, ty, tz] = this.stride;
	        let tptr = this.offset;
	        const dtdi = tx;
	        const dtdj = ty - nx * tx;
	        const dtdk = tz - ny * ty;
	        const sdata = other.data;
	        const [sx, sy, sz] = other.stride;
	        let sptr = other.offset;
	        const dsdi = sx;
	        const dsdj = sy - nx * sx;
	        const dsdk = sz - ny * sy;
	        for(let k = 0; k < nz; ++k){
	            for(let j = 0; j < ny; ++j){
	                for(let i = 0; i < nx; ++i){
	                    tdata[tptr] = sdata[sptr];
	                    tptr += dtdi;
	                    sptr += dsdi;
	                }
	                tptr += dtdj;
	                sptr += dsdj;
	            }
	            tptr += dtdk;
	            sptr += dsdk;
	        }
	    }
	    fill(b) {
	        const [nx, ny, nz] = this.shape;
	        const tdata = this.data;
	        const [tx, ty, tz] = this.stride;
	        let tptr = this.offset;
	        const dtdi = tx;
	        const dtdj = ty - nx * tx;
	        const dtdk = tz - ny * ty;
	        for(let k = 0; k < nz; ++k){
	            for(let j = 0; j < ny; ++j){
	                for(let i = 0; i < nx; ++i){
	                    tdata[tptr] = b;
	                    tptr += dtdi;
	                }
	                tptr += dtdj;
	            }
	            tptr += dtdk;
	        }
	    }
	    equals(other) {
	        if (this.shape[0] !== other.shape[0] || this.shape[1] !== other.shape[1] || this.shape[2] !== other.shape[2]) {
	            return false;
	        }
	        const [nx, ny, nz] = this.shape;
	        const tdata = this.data;
	        const [tx, ty, tz] = this.stride;
	        let tptr = this.offset;
	        const dtdi = tx;
	        const dtdj = ty - nx * tx;
	        const dtdk = tz - ny * ty;
	        const sdata = other.data;
	        const [sx, sy, sz] = other.stride;
	        let sptr = other.offset;
	        const dsdi = sx;
	        const dsdj = sy - nx * sx;
	        const dsdk = sz - ny * sy;
	        for(let k = 0; k < nz; ++k){
	            for(let j = 0; j < ny; ++j){
	                for(let i = 0; i < nx; ++i){
	                    if (tdata[tptr] !== sdata[sptr]) {
	                        return false;
	                    }
	                    tptr += dtdi;
	                    sptr += dsdi;
	                }
	                tptr += dtdj;
	                sptr += dsdj;
	            }
	            tptr += dtdk;
	            sptr += dsdk;
	        }
	        return true;
	    }
	    clear() {
	        for(let i = 0; i < this.data.length; i++){
	            this.data[i] = 0;
	        }
	    }
	    destroy() {
	        this.data = TEMP_UINT16ARRAY;
	    }
	    getStartPosition() {
	        let idx = this.data.findIndex((data)=>data !== 0);
	        if (idx < 0) {
	            return undefined;
	        }
	        const [strideX, strideY, strideZ] = this.stride;
	        let x = 0;
	        let y = 0;
	        let z = 0;
	        z = Math.floor(idx / strideZ);
	        idx -= z * strideZ;
	        y = Math.floor(idx / strideY);
	        idx -= y * strideY;
	        x = Math.floor(idx / strideX);
	        return [
	            x,
	            y,
	            z
	        ];
	    }
	    constructor(data, shape, stride, offset, dataStart, dataEnd, dataStride){
	        this.getVoxelByPtr = (ptr)=>{
	            if (!this.dataStart || !this.dataEnd || !this.dataStride) {
	                return this.data[ptr];
	            }
	            const z = Math.floor(ptr / this.stride[2]);
	            const y = Math.floor(ptr % this.stride[2] / this.stride[1]);
	            const x = ptr % this.stride[1];
	            if (!this.contains(x, y, z, this.dataStart, this.dataEnd)) {
	                return 0;
	            }
	            return this.data[this.dataStride[0] * (x - this.dataStart[0]) + this.dataStride[1] * (y - this.dataStart[1]) + this.dataStride[2] * (z - this.dataStart[2])];
	        };
	        this.setVoxelByPtr = (ptr, b)=>{
	            if (!this.dataStart || !this.dataEnd || !this.dataStride) {
	                return this.data[ptr] = b;
	            }
	            const z = Math.floor(ptr / this.stride[2]);
	            const y = Math.floor(ptr % this.stride[2] / this.stride[1]);
	            const x = ptr % this.stride[1];
	            if (!this.contains(x, y, z, this.dataStart, this.dataEnd)) {
	                return 0;
	            }
	            return this.data[this.dataStride[0] * (x - this.dataStart[0]) + this.dataStride[1] * (y - this.dataStart[1]) + this.dataStride[2] * (z - this.dataStart[2])] = b;
	        };
	        this.data = data;
	        this.shape = shape;
	        this.stride = stride;
	        this.offset = offset | 0;
	        this.dataStart = dataStart;
	        this.dataEnd = dataEnd;
	        this.dataStride = dataStride;
	    }
	}