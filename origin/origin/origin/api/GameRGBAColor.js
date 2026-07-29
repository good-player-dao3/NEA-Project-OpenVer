class GameRGBAColor {
    set(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        return this;
    }
    copy(c) {
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
        this.a = c.a;
        return this;
    }
    add(rgba) {
        return new GameRGBAColor(this.r + rgba.r, this.g + rgba.g, this.b + rgba.b, this.a + rgba.a);
    }
    sub(rgba) {
        return new GameRGBAColor(this.r - rgba.r, this.g - rgba.g, this.b - rgba.b, this.a - rgba.a);
    }
    mul(rgba) {
        return new GameRGBAColor(this.r * rgba.r, this.g * rgba.g, this.b * rgba.b, this.a * rgba.a);
    }
    div(rgba) {
        return new GameRGBAColor(rgba.r === 0 ? 0 : this.r / rgba.r, rgba.g === 0 ? 0 : this.g / rgba.g, rgba.b === 0 ? 0 : this.b / rgba.b, rgba.a === 0 ? 0 : this.a / rgba.a);
    }
    addEq(rgba) {
        this.r += rgba.r;
        this.g += rgba.g;
        this.b += rgba.b;
        this.a += rgba.a;
        return this;
    }
    subEq(rgba) {
        this.r -= rgba.r;
        this.g -= rgba.g;
        this.b -= rgba.b;
        this.a -= rgba.a;
        return this;
    }
    mulEq(rgba) {
        this.r *= rgba.r;
        this.g *= rgba.g;
        this.b *= rgba.b;
        this.a *= rgba.a;
        return this;
    }
    divEq(rgba) {
        this.r = rgba.r === 0 ? 0 : this.r / rgba.r;
        this.g = rgba.g === 0 ? 0 : this.g / rgba.g;
        this.b = rgba.b === 0 ? 0 : this.b / rgba.b;
        this.a = rgba.a === 0 ? 0 : this.a / rgba.a;
        return this;
    }
    lerp(rgba, n) {
        return new GameRGBAColor(this.r + (rgba.r - this.r) * n, this.g + (rgba.g - this.g) * n, this.b + (rgba.b - this.b) * n, this.a + (rgba.a - this.a) * n);
    }
    blendEq(rgb) {
        const a = this.a;
        const c = 1.0 - a;
        return new GameRGBColor(c * rgb.r + a * this.r, c * rgb.g + a * this.g, c * rgb.b + a * this.b);
    }
    equals(rgba) {
        return Math.abs(this.r - rgba.r) < EPSILON$2 && Math.abs(this.g - rgba.g) < EPSILON$2 && Math.abs(this.b - rgba.b) < EPSILON$2 && Math.abs(this.a - rgba.a) < EPSILON$2;
    }
    clone() {
        return new GameRGBAColor(this.r, this.g, this.b, this.a);
    }
    toString() {
        return `{ r:${this.r}, g:${this.g}, b:${this.b}, a:${this.a} }`;
    }
    constructor(r, g, b, a){
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}