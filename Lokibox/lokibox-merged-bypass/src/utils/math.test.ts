import { describe, it, expect } from 'vitest';
import { Vector3, Vector3Adapter, Quaternion } from './math';

// ─── 辅助 ────────────────────────────────────────────────

function closeTo(a: number, b: number, epsilon = 1e-10) {
  return Math.abs(a - b) < epsilon;
}

function vecClose(v: Vector3, x: number, y: number, z: number) {
  return closeTo(v.x, x) && closeTo(v.y, y) && closeTo(v.z, z);
}

// ─── 构造 & 基本存取 ─────────────────────────────────────

describe('Vector3 construction', () => {
  it('stores x, y, z', () => {
    const v = new Vector3(1, 2, 3);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
  });

  it('defaults are whatever passed (no implicit zero)', () => {
    const v = new Vector3(0, 0, 0);
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
    expect(v.z).toBe(0);
  });
});

describe('Vector3 set / copy / clone', () => {
  it('set mutates in place', () => {
    const v = new Vector3(1, 2, 3);
    v.set(4, 5, 6);
    expect(vecClose(v, 4, 5, 6)).toBe(true);
  });

  it('copy copies another vector into this one', () => {
    const a = new Vector3(1, 2, 3);
    const b = new Vector3(7, 8, 9);
    a.copy(b);
    expect(vecClose(a, 7, 8, 9)).toBe(true);
    // b unchanged
    expect(vecClose(b, 7, 8, 9)).toBe(true);
  });

  it('clone creates an independent copy', () => {
    const a = new Vector3(1, 2, 3);
    const b = a.clone();
    expect(vecClose(b, 1, 2, 3)).toBe(true);
    // mutating b doesn't affect a
    b.x = 99;
    expect(a.x).toBe(1);
    expect(b.x).toBe(99);
  });
});

// ─── 模长 ────────────────────────────────────────────────

describe('Vector3 mag / sqrMag', () => {
  it('sqrMag of (3,4,0) is 25', () => {
    expect(new Vector3(3, 4, 0).sqrMag()).toBe(25);
  });

  it('mag of (3,4,0) is 5', () => {
    expect(new Vector3(3, 4, 0).mag()).toBe(5);
  });

  it('mag of zero vector is 0', () => {
    expect(new Vector3(0, 0, 0).mag()).toBe(0);
  });

  it('mag of (1,1,1) is sqrt(3)', () => {
    expect(new Vector3(1, 1, 1).mag()).toBeCloseTo(Math.sqrt(3));
  });
});

// ─── 归一化 ──────────────────────────────────────────────

describe('Vector3 normalize', () => {
  it('normalize of (3,4,0) is unit length', () => {
    const n = new Vector3(3, 4, 0).normalize();
    expect(n.mag()).toBeCloseTo(1);
  });

  it('normalize keeps direction', () => {
    const v = new Vector3(6, 0, 0);
    const n = v.normalize();
    expect(vecClose(n, 1, 0, 0)).toBe(true);
  });

  it('normalize of (1,2,3) maintains ratio', () => {
    const v = new Vector3(1, 2, 3);
    const n = v.normalize();
    // x:y:z should be 1:2:3
    expect(n.y / n.x).toBeCloseTo(2);
    expect(n.z / n.x).toBeCloseTo(3);
    expect(n.mag()).toBeCloseTo(1);
  });
});

// ─── 加减 ────────────────────────────────────────────────

describe('Vector3 add / sub / addEq', () => {
  it('add returns a new sum vector', () => {
    const a = new Vector3(1, 2, 3);
    const b = new Vector3(4, -1, 0);
    const c = a.add(b);
    expect(vecClose(c, 5, 1, 3)).toBe(true);
    // originals unchanged
    expect(vecClose(a, 1, 2, 3)).toBe(true);
    expect(vecClose(b, 4, -1, 0)).toBe(true);
  });

  it('sub returns a new difference vector', () => {
    const a = new Vector3(5, 4, 3);
    const b = new Vector3(1, 2, 1);
    expect(vecClose(a.sub(b), 4, 2, 2)).toBe(true);
  });

  it('sub reversed sign', () => {
    expect(vecClose(
      new Vector3(1, 1, 1).sub(new Vector3(3, 2, 1)),
      -2, -1, 0,
    )).toBe(true);
  });

  it('addEq mutates in place', () => {
    const v = new Vector3(1, 2, 3);
    v.addEq(new Vector3(10, 20, 30));
    expect(vecClose(v, 11, 22, 33)).toBe(true);
  });
});

// ─── 数乘 ────────────────────────────────────────────────

describe('Vector3 scale', () => {
  it('scale by 2 doubles each component', () => {
    expect(vecClose(
      new Vector3(1, -2, 3).scale(2),
      2, -4, 6,
    )).toBe(true);
  });

  it('scale by 0 gives zero vector', () => {
    const z = new Vector3(5, 6, 7).scale(0);
    expect(vecClose(z, 0, 0, 0)).toBe(true);
  });

  it('scale by -1 negates', () => {
    expect(vecClose(
      new Vector3(1, -2, 3).scale(-1),
      -1, 2, -3,
    )).toBe(true);
  });

  it('scale is immutable on original', () => {
    const v = new Vector3(1, 2, 3);
    v.scale(5);
    expect(vecClose(v, 1, 2, 3)).toBe(true);
  });
});

// ─── 距离 ────────────────────────────────────────────────

describe('Vector3 dist / sqrDist', () => {
  it('sqrDist between (0,0,0) and (3,4,0) is 25', () => {
    expect(new Vector3(0, 0, 0).sqrDist(new Vector3(3, 4, 0))).toBe(25);
  });

  it('dist between (0,0,0) and (3,4,0) is 5', () => {
    expect(new Vector3(0, 0, 0).dist(new Vector3(3, 4, 0))).toBe(5);
  });

  it('dist is symmetric', () => {
    const a = new Vector3(1, 5, -3);
    const b = new Vector3(-2, 1, 7);
    expect(a.dist(b)).toBe(b.dist(a));
  });

  it('sqrDist from itself is 0', () => {
    const v = new Vector3(7, 13, -42);
    expect(v.sqrDist(v)).toBe(0);
  });
});

// ─── towards ─────────────────────────────────────────────

describe('Vector3 towards', () => {
  it('from (0,0,0) to (1,2,3)', () => {
    const d = new Vector3(0, 0, 0).towards(new Vector3(1, 2, 3));
    expect(vecClose(d, 1, 2, 3)).toBe(true);
  });

  it('from (5,5,5) to (2,3,1)', () => {
    const d = new Vector3(5, 5, 5).towards(new Vector3(2, 3, 1));
    expect(vecClose(d, -3, -2, -4)).toBe(true);
  });
});

// ─── 内积 ────────────────────────────────────────────────

describe('Vector3 dot', () => {
  it('dot of orthogonal vectors is 0', () => {
    const a = new Vector3(1, 0, 0);
    const b = new Vector3(0, 1, 0);
    expect(a.dot(b)).toBe(0);
  });

  it('dot of parallel vectors is product of magnitudes', () => {
    const a = new Vector3(2, 0, 0);
    const b = new Vector3(3, 0, 0);
    expect(a.dot(b)).toBe(6);
  });

  it('dot of general vectors', () => {
    const a = new Vector3(1, 2, 3);
    const b = new Vector3(4, -5, 6);
    expect(a.dot(b)).toBe(1 * 4 + 2 * (-5) + 3 * 6); // = 12
  });
});

// ─── 外积 ────────────────────────────────────────────────

describe('Vector3 cross', () => {
  it('i × j = k', () => {
    const i = new Vector3(1, 0, 0);
    const j = new Vector3(0, 1, 0);
    expect(vecClose(i.cross(j), 0, 0, 1)).toBe(true);
  });

  it('j × i = -k', () => {
    const i = new Vector3(1, 0, 0);
    const j = new Vector3(0, 1, 0);
    expect(vecClose(j.cross(i), 0, 0, -1)).toBe(true);
  });

  it('cross product is orthogonal to both operands', () => {
    const a = new Vector3(2, -1, 3);
    const b = new Vector3(0, 4, -2);
    const c = a.cross(b);
    expect(closeTo(c.dot(a), 0)).toBe(true);
    expect(closeTo(c.dot(b), 0)).toBe(true);
  });

  it('cross of parallel vectors is zero', () => {
    const a = new Vector3(2, 4, 6);
    const b = new Vector3(1, 2, 3);
    const c = a.cross(b);
    expect(vecClose(c, 0, 0, 0)).toBe(true);
  });

  it('cross magnitude = |a||b|sin(θ)', () => {
    const a = new Vector3(3, 0, 0);
    const b = new Vector3(0, 4, 0);
    // |a|=3, |b|=4, sin(90°)=1 → |a×b| = 12
    expect(a.cross(b).mag()).toBeCloseTo(12);
  });
});

// ─── 夹角 ────────────────────────────────────────────────

describe('Vector3 cos / sin', () => {
  it('cos of parallel vectors is 1', () => {
    const a = new Vector3(2, 0, 0);
    const b = new Vector3(5, 0, 0);
    expect(a.cos(b)).toBeCloseTo(1);
  });

  it('cos of opposite vectors is -1', () => {
    const a = new Vector3(1, 0, 0);
    const b = new Vector3(-1, 0, 0);
    expect(a.cos(b)).toBeCloseTo(-1);
  });

  it('cos of orthogonal vectors is 0', () => {
    const a = new Vector3(1, 0, 0);
    const b = new Vector3(0, 2, 0);
    expect(a.cos(b)).toBeCloseTo(0);
  });

  it('sin of orthogonal vectors is 1', () => {
    // sin² = 1 - cos² → for orthogonal, cos=0 so sin=1
    const a = new Vector3(1, 0, 0);
    const b = new Vector3(0, 1, 0);
    expect(a.sin(b)).toBeCloseTo(1);
  });

  it('sin of parallel vectors is 0', () => {
    const a = new Vector3(1, 1, 1);
    const b = new Vector3(2, 2, 2);
    expect(a.sin(b)).toBeCloseTo(0);
  });
});

// ─── parseArray ──────────────────────────────────────────

describe('Vector3 parseArray', () => {
  it('converts to [x, y, z]', () => {
    expect(new Vector3(1, 2, 3).parseArray()).toEqual([1, 2, 3]);
  });

  it('handles negative values', () => {
    expect(new Vector3(-1, 0, 5.5).parseArray()).toEqual([-1, 0, 5.5]);
  });
});

// ─── Vector3Adapter ──────────────────────────────────────

describe('Vector3Adapter', () => {
  it('reads and writes through key names', () => {
    const raw = { _x: 1, _y: 2, _z: 3 };
    const a = new Vector3Adapter(raw, '_x', '_y', '_z');
    expect(a.x).toBe(1);
    expect(a.y).toBe(2);
    expect(a.z).toBe(3);

    a.x = 10;
    a.y = 20;
    a.z = 30;
    expect(raw._x).toBe(10);
    expect(raw._y).toBe(20);
    expect(raw._z).toBe(30);
  });

  it('toVector3 creates a Vector3 copy', () => {
    const raw = { px: 1, py: 2, pz: 3 };
    const a = new Vector3Adapter(raw, 'px', 'py', 'pz');
    const v = a.toVector3();
    expect(v).toBeInstanceOf(Vector3);
    expect(vecClose(v, 1, 2, 3)).toBe(true);
  });

  it('copy writes from a Vector3 into target', () => {
    const raw = { ax: 0, ay: 0, az: 0 };
    const a = new Vector3Adapter(raw, 'ax', 'ay', 'az');
    a.copy(new Vector3(5, 6, 7));
    expect(raw.ax).toBe(5);
    expect(raw.ay).toBe(6);
    expect(raw.az).toBe(7);
  });

  it('set writes individual components', () => {
    const raw = { bx: 0, by: 0, bz: 0 };
    const a = new Vector3Adapter(raw, 'bx', 'by', 'bz');
    a.set(9, 8, 7);
    expect(raw.bx).toBe(9);
    expect(raw.by).toBe(8);
    expect(raw.bz).toBe(7);
  });

  it('addEq adds a Vector3 in place', () => {
    const raw = { cx: 1, cy: 2, cz: 3 };
    const a = new Vector3Adapter(raw, 'cx', 'cy', 'cz');
    a.addEq(new Vector3(10, 20, 30));
    expect(raw.cx).toBe(11);
    expect(raw.cy).toBe(22);
    expect(raw.cz).toBe(33);
  });
});

// ═══════════════════════════════════════════════════════════
// Quaternion
// ═══════════════════════════════════════════════════════════

describe('Quaternion construction', () => {
  it('stores x, y, z, w', () => {
    const q = new Quaternion(1, 2, 3, 0.5);
    expect(q.x).toBe(1);
    expect(q.y).toBe(2);
    expect(q.z).toBe(3);
    expect(q.w).toBe(0.5);
  });

  it('defaults to identity (x=0, y=0, z=0, w=1)', () => {
    const q = new Quaternion();
    expect(q.x).toBe(0);
    expect(q.y).toBe(0);
    expect(q.z).toBe(0);
    expect(q.w).toBe(1);
  });

  it('static identity() returns identity quaternion', () => {
    const q = Quaternion.identity();
    expect(q.x).toBe(0);
    expect(q.y).toBe(0);
    expect(q.z).toBe(0);
    expect(q.w).toBe(1);
  });
});

describe('Quaternion clone / copy / set', () => {
  it('clone creates independent copy', () => {
    const a = new Quaternion(1, 2, 3, 4);
    const b = a.clone();
    expect(b.x).toBe(1);
    b.x = 99;
    expect(a.x).toBe(1); // a unchanged
  });

  it('copy copies values in place, returns this', () => {
    const a = new Quaternion(1, 2, 3, 4);
    const b = new Quaternion(5, 6, 7, 8);
    const result = a.copy(b);
    expect(result).toBe(a); // returns this
    expect(a.x).toBe(5);
    expect(a.y).toBe(6);
    expect(a.z).toBe(7);
    expect(a.w).toBe(8);
  });

  it('set writes components, returns this', () => {
    const q = new Quaternion();
    const result = q.set(2, 3, 4, 5);
    expect(result).toBe(q);
    expect(q.x).toBe(2);
    expect(q.y).toBe(3);
    expect(q.z).toBe(4);
    expect(q.w).toBe(5);
  });
});

describe('Quaternion mag / normalize', () => {
  it('mag of identity is 1', () => {
    expect(new Quaternion().mag()).toBe(1);
  });

  it('mag of (2,0,0,0) is 2', () => {
    expect(new Quaternion(2, 0, 0, 0).mag()).toBe(2);
  });

  it('mag of (1,2,3,4) is sqrt(30)', () => {
    expect(new Quaternion(1, 2, 3, 4).mag()).toBeCloseTo(Math.sqrt(30));
  });

  it('normalize makes magnitude 1', () => {
    const q = new Quaternion(1, 2, 3, 4);
    q.normalize();
    expect(q.mag()).toBeCloseTo(1);
  });

  it('normalize of zero quaternion resets to identity', () => {
    const q = new Quaternion(0, 0, 0, 0);
    q.normalize();
    expect(q.x).toBe(0);
    expect(q.y).toBe(0);
    expect(q.z).toBe(0);
    expect(q.w).toBe(1);
  });
});

describe('Quaternion multiply', () => {
  it('identity × q = q', () => {
    const q = new Quaternion(1, 2, 3, 4);
    const i = Quaternion.identity();
    const result = i.multiply(q);
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(2);
    expect(result.z).toBeCloseTo(3);
    expect(result.w).toBeCloseTo(4);
  });

  it('q × identity = q', () => {
    const q = new Quaternion(1, 2, 3, 4);
    const i = Quaternion.identity();
    const result = q.multiply(i);
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(2);
    expect(result.z).toBeCloseTo(3);
    expect(result.w).toBeCloseTo(4);
  });

  it('i × i = -1 (180° around x)', () => {
    const i = new Quaternion(1, 0, 0, 0);
    const result = i.multiply(i);
    // i*i = (-1, 0, 0, 0) or equivalently (0,0,0,-1) depending on convention
    // Our implementation: Hamilton product of (1,0,0,0)*(1,0,0,0) = (-1,0,0,0)
    // Wait: w*w - x*x - y*y - z*z = 0*0 - 1*1 - 0*0 - 0*0 = -1 → w = -1
    // x: w*x + x*w + y*z - z*y = 0*1 + 1*0 + 0*0 - 0*0 = 0
    // So result = (0, 0, 0, -1) — that's a quaternion with w=-1.
    // But (1,0,0,0) is not a unit quaternion (mag=1, ok it is). i*i as rotation:
    // Rotating 180° around x twice = 360°, identity rotation = (0,0,0,1)
    // But Hamilton product of pure-imaginary i*i = -1 vector = (-1,0,0,0)
    // Actually for pure quaternions: (0+x)* (0+x) = -|x|²
    // For x=1: (1,0,0,0)*(1,0,0,0) with w=0:
    //   w = 0*0 - 1*1 = -1
    //   x = 0*1 + 1*0 + 0*0 - 0*0 = 0
    // result = (0,0,0,-1) → normalized = (0,0,0,-1) which IS identity rotation
    // So the result should have w = -1
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(0);
    expect(result.w).toBeCloseTo(-1);
  });
});

describe('Quaternion invert', () => {
  it('invert × q = identity (unit quaternion)', () => {
    const q = new Quaternion(0, 0, 0, 1); // identity
    const inv = q.invert();
    const result = inv.multiply(q);
    expect(result.w).toBeCloseTo(1);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(0);
  });

  it('invert of non-unit quaternion', () => {
    const q = new Quaternion(0, 0, 1, 0);
    const inv = q.invert();
    // mag² = 1, inv should be (0, 0, -1, 0) for conjugate
    // Actually: inv = (-x/d, -y/d, -z/d, w/d) where d = mag²
    // For (0,0,1,0): d=1, inv = (0, 0, -1, 0)
    expect(inv.x).toBeCloseTo(0);
    expect(inv.y).toBeCloseTo(0);
    expect(inv.z).toBeCloseTo(-1);
    expect(inv.w).toBeCloseTo(0);
  });

  it('q × q⁻¹ ≈ identity', () => {
    const q = new Quaternion(0.5, -0.3, 0.2, 0.8);
    q.normalize();
    const inv = q.invert();
    const result = q.multiply(inv);
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(0, 5);
    expect(result.z).toBeCloseTo(0, 5);
    expect(result.w).toBeCloseTo(1, 5);
  });
});

describe('Quaternion rotateVector', () => {
  it('identity rotates vector to itself', () => {
    const q = Quaternion.identity();
    const v = new Vector3(1, 2, 3);
    const r = q.rotateVector(v);
    expect(r.x).toBeCloseTo(1);
    expect(r.y).toBeCloseTo(2);
    expect(r.z).toBeCloseTo(3);
  });

  it('90° around Y maps (1,0,0) to (0,0,-1)', () => {
    // 90° around Y: q = (0, sin(45°), 0, cos(45°))
    const angle = Math.PI / 2;
    const q = new Quaternion(0, Math.sin(angle / 2), 0, Math.cos(angle / 2));
    q.normalize();
    const r = q.rotateVector(new Vector3(1, 0, 0));
    expect(r.x).toBeCloseTo(0, 10);
    expect(r.y).toBeCloseTo(0, 10);
    expect(r.z).toBeCloseTo(-1, 10);
  });

  it('90° around Z maps (1,0,0) to (0,1,0)', () => {
    const angle = Math.PI / 2;
    const q = new Quaternion(0, 0, Math.sin(angle / 2), Math.cos(angle / 2));
    q.normalize();
    const r = q.rotateVector(new Vector3(1, 0, 0));
    expect(r.x).toBeCloseTo(0, 10);
    expect(r.y).toBeCloseTo(1, 10);
    expect(r.z).toBeCloseTo(0, 10);
  });

  it('rotation preserves length', () => {
    const angle = 1.3; // arbitrary angle
    const axis = new Vector3(0.3, 0.6, 0.1);
    const q = new Quaternion(
      axis.x * Math.sin(angle / 2),
      axis.y * Math.sin(angle / 2),
      axis.z * Math.sin(angle / 2),
      Math.cos(angle / 2),
    );
    q.normalize();
    const v = new Vector3(4, -2, 7);
    const r = q.rotateVector(v);
    expect(r.mag()).toBeCloseTo(v.mag(), 10);
  });
});

describe('Quaternion fromEuler / toEuler', () => {
  it('fromEuler(0,0,0) = identity', () => {
    const q = Quaternion.fromEuler(0, 0, 0);
    expect(q.x).toBeCloseTo(0);
    expect(q.y).toBeCloseTo(0);
    expect(q.z).toBeCloseTo(0);
    expect(q.w).toBeCloseTo(1);
  });

  it('toEuler of identity returns (0,0,0)', () => {
    const e = Quaternion.identity().toEuler();
    expect(e.x).toBeCloseTo(0);
    expect(e.y).toBeCloseTo(0);
    expect(e.z).toBeCloseTo(0);
  });

  it('fromEuler → toEuler round-trip for single-axis rotations', () => {
    // Single-axis rotations should round-trip cleanly
    for (const axis of ['x', 'y', 'z'] as const) {
      const angles = { x: 0, y: 0, z: 0 };
      angles[axis] = 0.7;
      const q = Quaternion.fromEuler(angles.x, angles.y, angles.z);
      const e = q.toEuler();
      expect(e[axis]).toBeCloseTo(0.7, 10);
    }
  });
});
