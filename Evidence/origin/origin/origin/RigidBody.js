class RigidBody {
    getBounds() {
        return fromValues$4(this.rx, this.ry, this.rz);
    }
    setBounds(v) {
        this.rx = v[0];
        this.ry = v[1];
        this.rz = v[2];
    }
    copyBounds(out) {
        out[0] = this.rx;
        out[1] = this.ry;
        out[2] = this.rz;
    }
    getPosition() {
        return fromValues$4(this.px, this.py, this.pz);
    }
    setPosition(v) {
        this.px = v[0];
        this.py = v[1];
        this.pz = v[2];
    }
    copyPosition(out) {
        out[0] = this.px;
        out[1] = this.py;
        out[2] = this.pz;
    }
    getVelocity() {
        return fromValues$4(this.vx, this.vy, this.vz);
    }
    setVelocity(v) {
        this.vx = v[0];
        this.vy = v[1];
        this.vz = v[2];
    }
    copyVelocity(out) {
        out[0] = this.vx;
        out[1] = this.vy;
        out[2] = this.vz;
    }
    dist(other) {
        return Math.sqrt(Math.pow(this.px - other.px, 2) + Math.pow(this.py - other.py, 2) + Math.pow(this.pz - other.pz, 2));
    }
    vecDist(v) {
        return Math.sqrt(Math.pow(this.px - v[0], 2) + Math.pow(this.py - v[1], 2) + Math.pow(this.pz - v[2], 2));
    }
    getRotation() {
        const x2 = this.qx + this.qx;
        const y2 = this.qy + this.qy;
        const z2 = this.qz + this.qz;
        const xx = this.qx * x2;
        const yx = this.qy * x2;
        const yy = this.qy * y2;
        const zx = this.qz * x2;
        const zy = this.qz * y2;
        const zz = this.qz * z2;
        const wx = this.qw * x2;
        const wy = this.qw * y2;
        const wz = this.qw * z2;
        const m0 = 1 - yy - zz;
        const m1 = yx + wz;
        const m2 = zx - wy;
        const m3 = yx - wz;
        const m4 = 1 - xx - zz;
        const m5 = zy + wx;
        const m6 = zx + wy;
        const m7 = zy - wx;
        const m8 = 1 - xx - yy;
        return fromValues$6(m0, m1, m2, m3, m4, m5, m6, m7, m8);
    }
    constructor(){
        this.id = 0;
        this.flags = RigidBodyFlags.COLLIDES | RigidBodyFlags.GRAVITY;
        this.mass = 1;
        this.friction = 0;
        this.restitution = 0;
        this.group = 0;
        this.rx = 1;
        this.ry = 1;
        this.rz = 1;
        this.px = 0;
        this.py = 0;
        this.pz = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.qx = 0;
        this.qy = 0;
        this.qz = 0;
        this.qw = 1;
        this.hsx = 1;
        this.hsy = 1;
        this.hsz = 1;
        this.ax = 0;
        this.ay = 0;
        this.az = 0;
    }
}