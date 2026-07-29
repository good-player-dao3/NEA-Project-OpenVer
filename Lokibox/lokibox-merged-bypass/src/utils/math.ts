/**@class Vector3引用 */
export class Vector3Adapter {
  constructor(
    private target: any,
    private xKey: string,
    private yKey: string,
    private zKey: string
  ) {}

  get x() {
    return this.target[this.xKey];
  }

  set x(v: number) {
    this.target[this.xKey] = v;
  }

  get y() {
    return this.target[this.yKey];
  }

  set y(v: number) {
    this.target[this.yKey] = v;
  }

  get z() {
    return this.target[this.zKey];
  }

  set z(v: number) {
    this.target[this.zKey] = v;
  }

  toVector3() {
    return new Vector3(this.x, this.y, this.z);
  }

  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  addEq(v: Vector3) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }
}

/**@class 三维向量类 */
export class Vector3 {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }
  /**模的平方 */
  sqrMag() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  /**模 */
  mag() {
    return Math.sqrt(this.sqrMag());
  }
  /**外积 */
  cross(v: Vector3) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }
  /**内积 */
  dot(v: Vector3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  /**夹角余弦值 */
  cos(v: Vector3) {
    return this.dot(v) / this.mag() / v.mag();
  }
  /**夹角正弦值 */
  sin(v: Vector3) {
    const cos = this.cos(v);
    return 1 - cos * cos;
  }
  /**数乘 */
  scale(times: number) {
    return new Vector3(this.x * times, this.y * times, this.z * times);
  }
  add(v: Vector3) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }
  /**减 */
  sub(v: Vector3) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }
  /**距离平方 */
  sqrDist(v: Vector3) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }
  dist(v: Vector3) {
    return Math.sqrt(this.sqrDist(v));
  }
  /**复制 */
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  towards(v: Vector3) {
    return new Vector3(v.x - this.x, v.y - this.y, v.z - this.z);
  }

  normalize() {
    const mag = this.mag();
    return this.scale(1 / mag);
  }

  parseArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  addEq(v: Vector3) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }
}

/**@class Quaternion引用 */
export class QuaternionAdapter {
  constructor(
    private target: any,
    private xKey: string,
    private yKey: string,
    private zKey: string,
    private wKey: string
  ) {}

  get x() {
    return this.target[this.xKey];
  }

  set x(v: number) {
    this.target[this.xKey] = v;
  }

  get y() {
    return this.target[this.yKey];
  }

  set y(v: number) {
    this.target[this.yKey] = v;
  }

  get z() {
    return this.target[this.zKey];
  }

  set z(v: number) {
    this.target[this.zKey] = v;
  }

  get w() {
    return this.target[this.zKey];
  }

  set w(v: number) {
    this.target[this.wKey] = v;
  }

  toQuaternion() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  copy(v: Quaternion) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
  }
}

export class Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  static identity() {
    return new Quaternion(0, 0, 0, 1);
  }

  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  copy(q: Quaternion) {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
    return this;
  }

  set(x: number, y: number, z: number, w: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  mag() {
    return Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }

  normalize() {
    const l = this.mag();
    if (l === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
    } else {
      const inv = 1 / l;
      this.x *= inv;
      this.y *= inv;
      this.z *= inv;
      this.w *= inv;
    }
    return this;
  }

  multiply(q: Quaternion) {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const aw = this.w;

    const bx = q.x;
    const by = q.y;
    const bz = q.z;
    const bw = q.w;

    return new Quaternion(
      aw * bx + ax * bw + ay * bz - az * by,
      aw * by - ax * bz + ay * bw + az * bx,
      aw * bz + ax * by - ay * bx + az * bw,
      aw * bw - ax * bx - ay * by - az * bz
    );
  }

  invert() {
    const d = this.mag() ** 2;
    return new Quaternion(-this.x / d, -this.y / d, -this.z / d, this.w / d);
  }

  static fromEuler(x: number, y: number, z: number) {
    const cx = Math.cos(x * 0.5);
    const sx = Math.sin(x * 0.5);

    const cy = Math.cos(y * 0.5);
    const sy = Math.sin(y * 0.5);

    const cz = Math.cos(z * 0.5);
    const sz = Math.sin(z * 0.5);

    return new Quaternion(
      sx * cy * cz + cx * sy * sz,
      cx * sy * cz - sx * cy * sz,
      cx * cy * sz + sx * sy * cz,
      cx * cy * cz - sx * sy * sz
    );
  }

  toEuler() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const w = this.w;

    const sinr = 2 * (w * x + y * z);
    const cosr = 1 - 2 * (x * x + y * y);
    const roll = Math.atan2(sinr, cosr);

    const sinp = 2 * (w * y - z * x);
    let pitch;

    if (Math.abs(sinp) >= 1) pitch = (Math.sign(sinp) * Math.PI) / 2;
    else pitch = Math.asin(sinp);

    const siny = 2 * (w * z + x * y);
    const cosy = 1 - 2 * (y * y + z * z);
    const yaw = Math.atan2(siny, cosy);

    return { x: roll, y: pitch, z: yaw };
  }

  rotateVector(v: Vector3) {
    const qv = new Quaternion(v.x, v.y, v.z, 0);
    const res = this.multiply(qv).multiply(this.invert());

    return new Vector3(res.x, res.y, res.z);
  }
}

export class Vector4 {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public w: number
  ) {}
}

export class Matrix4 {
  m: Float32Array;
  constructor(m: Float32Array) {
    this.m = new Float32Array(m);
  }

  get(row: number, column: number) {
    return this.m[row * 4 + column];
  }

  copy(matrix: Matrix4) {
    for (let i = 0; i < 16; i++) {
      this.m[i] = matrix.m[i];
    }
  }

  transformVec4(v: Vector4) {
    const m = this.m;

    return new Vector4(
      m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12] * v.w,
      m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13] * v.w,
      m[2] * v.x + m[6] * v.y + m[10] * v.z + m[14] * v.w,
      m[3] * v.x + m[7] * v.y + m[11] * v.z + m[15] * v.w
    );
  }
}
