class GameQuaternion {
    static rotationBetween(a, b) {
        const dot = a.dot(b);
        let tmpvec3;
        if (dot < -0.999999) {
            tmpvec3 = new GameVector3(1, 0, 0).cross(a);
            if (tmpvec3.mag() < EPSILON$2) {
                tmpvec3 = new GameVector3(0, 1, 0).cross(a);
            }
            tmpvec3 = tmpvec3.normalize();
            return GameQuaternion.fromAxisAngle(tmpvec3, Math.PI);
        } else if (dot > 0.999999) {
            return new GameQuaternion(1, 0, 0, 0);
        } else {
            tmpvec3 = a.cross(b);
            return new GameQuaternion(1 + dot, tmpvec3.x, tmpvec3.y, tmpvec3.z).normalize();
        }
    }
    static fromAxisAngle(axis, rad) {
        rad = rad * 0.5;
        const s = Math.sin(rad);
        return new GameQuaternion(Math.cos(rad), s * axis.x, s * axis.y, s * axis.z);
    }
    static fromEuler(x, y, z) {
        const halfToRad = 0.5 * Math.PI / 180.0;
        x *= halfToRad;
        y *= halfToRad;
        z *= halfToRad;
        const sx = Math.sin(x);
        const cx = Math.cos(x);
        const sy = Math.sin(y);
        const cy = Math.cos(y);
        const sz = Math.sin(z);
        const cz = Math.cos(z);
        return new GameQuaternion(cx * cy * cz + sx * sy * sz, sx * cy * cz - cx * sy * sz, cx * sy * cz + sx * cy * sz, cx * cy * sz - sx * sy * cz);
    }
    set(w, x, y, z) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    copy(q) {
        this.w = q.w;
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        return this;
    }
    getAxisAngle(_q) {
        const q = _q.normalize();
        const angle = Math.acos(q.w) * 2.0;
        const s = Math.sin(angle / 2.0);
        let axis;
        if (s > EPSILON$2) {
            axis = new GameVector3(q.x / s, q.y / s, q.z / s);
        } else {
            axis = new GameVector3(1, 0, 0);
        }
        return {
            axis,
            angle
        };
    }
    rotateX(_rad) {
        const aw = this.w;
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const rad = 0.5 * _rad;
        const bx = Math.sin(rad);
        const bw = Math.cos(rad);
        return new GameQuaternion(aw * bw - ax * bx, ax * bw + aw * bx, ay * bw + az * bx, az * bw - ay * bx);
    }
    rotateY(_rad) {
        const aw = this.w;
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const rad = 0.5 * _rad;
        const by = Math.sin(rad);
        const bw = Math.cos(rad);
        return new GameQuaternion(aw * bw - ay * by, ax * bw - az * by, ay * bw + aw * by, az * bw + ax * by);
    }
    rotateZ(_rad) {
        const aw = this.w;
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const rad = 0.5 * _rad;
        const bz = Math.sin(rad);
        const bw = Math.cos(rad);
        return new GameQuaternion(aw * bw - az * bz, ax * bw + ay * bz, ay * bw - ax * bz, az * bw + aw * bz);
    }
    dot(q) {
        return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
    }
    add(v) {
        return new GameQuaternion(this.w + v.w, this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v) {
        return new GameQuaternion(this.w - v.w, this.x - v.x, this.y - v.y, this.z - v.z);
    }
    angle(q) {
        const dotproduct = this.dot(q);
        return Math.acos(2 * dotproduct * dotproduct - 1);
    }
    mul(q) {
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const aw = this.w;
        const bx = q.x;
        const by = q.y;
        const bz = q.z;
        const bw = q.w;
        return new GameQuaternion(aw * bw - ax * bx - ay * by - az * bz, ax * bw + aw * bx + ay * bz - az * by, ay * bw + aw * by + az * bx - ax * bz, az * bw + aw * bz + ax * by - ay * bx);
    }
    inv() {
        const a0 = this.x;
        const a1 = this.y;
        const a2 = this.z;
        const a3 = this.w;
        const dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        let r = dot;
        if (Math.abs(r) > EPSILON$2) {
            r = 1 / r;
        }
        return new GameQuaternion(a3 * r, -a0 * r, -a1 * r, -a2 * r);
    }
    div(q) {
        return this.mul(q.inv());
    }
    slerp(q, n) {
        const aw = this.w;
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        let bw = q.w;
        let bx = q.x;
        let by = q.y;
        let bz = q.z;
        let omega;
        let cosomg;
        let sinomg;
        let scale0;
        let scale1;
        cosomg = ax * bx + ay * by + az * bz + aw * bw;
        if (cosomg < 0.0) {
            cosomg = -cosomg;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }
        if (1.0 - cosomg > EPSILON$2) {
            omega = Math.acos(cosomg);
            sinomg = Math.sin(omega);
            scale0 = Math.sin((1.0 - n) * omega) / sinomg;
            scale1 = Math.sin(n * omega) / sinomg;
        } else {
            scale0 = 1.0 - n;
            scale1 = n;
        }
        return new GameQuaternion(scale0 * aw + scale1 * bw, scale0 * ax + scale1 * bx, scale0 * ay + scale1 * by, scale0 * az + scale1 * bz);
    }
    mag() {
        return Math.sqrt(this.dot(this));
    }
    sqrMag() {
        return this.dot(this);
    }
    normalize() {
        const w = this.w;
        const x = this.x;
        const y = this.y;
        const z = this.z;
        let r = this.dot(this);
        if (r > 0) {
            r = 1 / Math.sqrt(r);
        }
        return new GameQuaternion(r * w, r * x, r * y, r * z);
    }
    equals(q) {
        return Math.abs(this.w - q.w) < EPSILON$2 && Math.abs(this.x - q.x) < EPSILON$2 && Math.abs(this.y - q.y) < EPSILON$2 && Math.abs(this.z - q.z) < EPSILON$2;
    }
    clone() {
        return new GameQuaternion(this.w, this.x, this.y, this.z);
    }
    toString() {
        return `{ w:${this.w}, x:${this.x}, y:${this.y}, z:${this.z} }`;
    }
    constructor(w, x, y, z){
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
    }
}