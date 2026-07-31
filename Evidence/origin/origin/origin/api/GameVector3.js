class GameVector3 {
    static fromPolar(mag, phi, theta) {
        return new GameVector3(mag * Math.sin(theta) * Math.sin(phi), mag * Math.cos(theta), mag * Math.sin(theta) * Math.cos(phi));
    }
    set(x, y, z) {
        this.x = +x;
        this.y = +y;
        this.z = +z;
        return this;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    add(v) {
        return new GameVector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v) {
        return new GameVector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mul(v) {
        return new GameVector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }
    div(v) {
        return new GameVector3(v.x === 0 ? 0 : this.x / v.x, v.y === 0 ? 0 : this.y / v.y, v.z === 0 ? 0 : this.z / v.z);
    }
    addEq(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }
    subEq(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }
    mulEq(v) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
    }
    divEq(v) {
        this.x = v.x === 0 ? 0 : this.x / v.x;
        this.y = v.y === 0 ? 0 : this.y / v.y;
        this.z = v.z === 0 ? 0 : this.z / v.z;
        return this;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    cross(v) {
        return new GameVector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }
    scale(n) {
        return new GameVector3(this.x * n, this.y * n, this.z * n);
    }
    clone() {
        return new GameVector3(this.x, this.y, this.z);
    }
    lerp(v, n) {
        return new GameVector3(this.x + (v.x - this.x) * n, this.y + (v.y - this.y) * n, this.z + (v.z - this.z) * n);
    }
    mag() {
        return Math.sqrt(this.dot(this));
    }
    sqrMag() {
        return this.dot(this);
    }
    towards(v) {
        return v.sub(this);
    }
    distance(v) {
        return this.sub(v).mag();
    }
    normalize() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        let r = x * x + y * y + z * z;
        if (r > 0) {
            r = 1 / Math.sqrt(r);
        }
        return new GameVector3(x * r, y * r, z * r);
    }
    angle(v) {
        let r = v.sqrMag() * this.sqrMag();
        if (r > 0) {
            r = 1 / Math.sqrt(r);
        }
        const cos = r * this.dot(v);
        if (1 < cos) {
            return 0;
        } else if (cos < -1) {
            return Math.PI;
        } else {
            return Math.acos(cos);
        }
    }
    max(v) {
        return new GameVector3(Math.max(this.x, v.x), Math.max(this.y, v.y), Math.max(this.z, v.z));
    }
    min(v) {
        return new GameVector3(Math.min(this.x, v.x), Math.min(this.y, v.y), Math.min(this.z, v.z));
    }
    exactEquals(v) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }
    equals(v) {
        return Math.abs(this.x - v.x) < EPSILON$2 && Math.abs(this.y - v.y) < EPSILON$2 && Math.abs(this.z - v.z) < EPSILON$2;
    }
    toString() {
        return `{ x:${this.x}, y:${this.y}, z:${this.z} }`;
    }
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}