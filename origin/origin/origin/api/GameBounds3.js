class GameBounds3 {
    static fromPoints(...points) {
        const lo = new GameVector3(Infinity, Infinity, Infinity);
        const hi = new GameVector3(-Infinity, -Infinity, -Infinity);
        for(let i = 0; i < points.length; ++i){
            const p = points[i];
            lo.x = Math.min(lo.x, p.x);
            lo.y = Math.min(lo.y, p.y);
            lo.z = Math.min(lo.z, p.z);
            hi.x = Math.max(hi.x, p.x);
            hi.y = Math.max(hi.y, p.y);
            hi.z = Math.max(hi.z, p.z);
        }
        return new GameBounds3(lo, hi);
    }
    intersect(b) {
        return new GameBounds3(this.lo.max(b.lo), this.hi.min(b.hi));
    }
    contains(b) {
        return !(b.x < this.lo.x || b.x > this.hi.x || b.y < this.lo.y || b.y > this.hi.y || b.z < this.lo.z || b.z > this.hi.z);
    }
    containsBounds(b) {
        return !(b.lo.x < this.lo.x || b.hi.x > this.hi.x || b.lo.y < this.lo.y || b.hi.y > this.hi.y || b.lo.z < this.lo.z || b.hi.z > this.hi.z);
    }
    intersects(b) {
        return this.lo.x < b.hi.x && b.lo.x < this.hi.x && this.lo.y < b.hi.y && b.lo.y < this.hi.y && this.lo.z < b.hi.z && b.lo.z < this.hi.z;
    }
    set(lox, loy, loz, hix, hiy, hiz) {
        this.lo.x = lox;
        this.lo.y = loy;
        this.lo.z = loz;
        this.hi.x = hix;
        this.hi.y = hiy;
        this.hi.z = hiz;
        return this;
    }
    copy(b) {
        this.lo.copy(b.lo);
        this.hi.copy(b.hi);
        return this;
    }
    toString() {
        return `{ lo:${this.lo.toString()}, hi:${this.hi.toString()} }`;
    }
    constructor(lo, hi){
        this.lo = lo;
        this.hi = hi;
    }
}