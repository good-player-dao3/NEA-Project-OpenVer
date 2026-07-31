class GameRGBColor {
    static random() {
        return new GameRGBColor(Math.random(), Math.random(), Math.random());
    }
    set(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
        return this;
    }
    copy(c) {
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
        return this;
    }
    add(rgb) {
        return new GameRGBColor(this.r + rgb.r, this.g + rgb.g, this.b + rgb.b);
    }
    sub(rgb) {
        return new GameRGBColor(this.r - rgb.r, this.g - rgb.g, this.b - rgb.b);
    }
    mul(rgb) {
        return new GameRGBColor(this.r * rgb.r, this.g * rgb.g, this.b * rgb.b);
    }
    div(rgb) {
        return new GameRGBColor(rgb.r === 0 ? 0 : this.r / rgb.r, rgb.g === 0 ? 0 : this.g / rgb.g, rgb.b === 0 ? 0 : this.b / rgb.b);
    }
    addEq(rgb) {
        this.r += rgb.r;
        this.g += rgb.g;
        this.b += rgb.b;
        return this;
    }
    subEq(rgb) {
        this.r -= rgb.r;
        this.g -= rgb.g;
        this.b -= rgb.b;
        return this;
    }
    mulEq(rgb) {
        this.r *= rgb.r;
        this.g *= rgb.g;
        this.b *= rgb.b;
        return this;
    }
    divEq(rgb) {
        this.r = rgb.r === 0 ? 0 : this.r / rgb.r;
        this.g = rgb.g === 0 ? 0 : this.g / rgb.g;
        this.b = rgb.b === 0 ? 0 : this.b / rgb.b;
        return this;
    }
    lerp(rgb, n) {
        return new GameRGBColor(this.r + (rgb.r - this.r) * n, this.g + (rgb.g - this.g) * n, this.b + (rgb.b - this.b) * n);
    }
    equals(rgb) {
        return Math.abs(this.r - rgb.r) < EPSILON$2 && Math.abs(this.g - rgb.g) < EPSILON$2 && Math.abs(this.b - rgb.b) < EPSILON$2;
    }
    clone() {
        return new GameRGBColor(this.r, this.g, this.b);
    }
    toRGBA() {
        return new GameRGBAColor(this.r, this.g, this.b, 1.0);
    }
    toString() {
        return `{ r:${this.r}, g:${this.g}, b:${this.b} }`;
    }
    constructor(r, g, b){
        this.r = r;
        this.g = g;
        this.b = b;
    }
}