var v = (function () {
  function e(t, n) {
    (r(this, e),
      (this.precision = t),
      (this.invPrecision = 1),
      (this.identity = i.vec3.create()),
      (this.muData = {
        type: "quantized-vec3",
        precision: 0,
        identity: [0, 0, 0],
      }),
      (this.muType = "quantized-vec3"),
      (this.pool = s.Vec3Schema.pool),
      (this.invPrecision = 1 / this.precision),
      n &&
        ((this.identity[0] =
          this.precision * (Math.round(this.invPrecision * n[0]) >> 0)),
        (this.identity[1] =
          this.precision * (Math.round(this.invPrecision * n[1]) >> 0)),
        (this.identity[2] =
          this.precision * (Math.round(this.invPrecision * n[2]) >> 0))),
      (this.json = this.muData =
        {
          type: "quantized-vec3",
          precision: this.precision,
          identity: [this.identity[0], this.identity[1], this.identity[2]],
        }));
  }
  return (
    o(e, [
      {
        key: "assign",
        value: function (e, t) {
          var n = this.invPrecision,
            r = this.precision;
          return (
            (e[0] = (Math.round(n * t[0]) >> 0) * r),
            (e[1] = (Math.round(n * t[1]) >> 0) * r),
            (e[2] = (Math.round(n * t[2]) >> 0) * r),
            e
          );
        },
      },
      {
        key: "clone",
        value: function (e) {
          var t = s.Vec3Schema.alloc();
          return this.assign(t, e);
        },
      },
      {
        key: "alloc",
        value: function () {
          return s.Vec3Schema.alloc();
        },
      },
      {
        key: "free",
        value: function (e) {
          return s.Vec3Schema.free(e);
        },
      },
      {
        key: "toJSON",
        value: function (e) {
          return [
            this.precision * (Math.round(this.invPrecision * e[0]) >> 0),
            this.precision * (Math.round(this.invPrecision * e[1]) >> 0),
            this.precision * (Math.round(this.invPrecision * e[2]) >> 0),
          ];
        },
      },
      {
        key: "fromJSON",
        value: function (e) {
          return Array.isArray(e) &&
            3 === e.length &&
            "number" === typeof e[0] &&
            "number" === typeof e[1] &&
            "number" === typeof e[2]
            ? this.clone(e)
            : s.Vec3Schema.clone(this.identity);
        },
      },
      {
        key: "equal",
        value: function (e, t) {
          var n = this.invPrecision;
          return (
            Math.round(n * e[0]) >> 0 === Math.round(n * t[0]) >> 0 &&
            Math.round(n * e[1]) >> 0 === Math.round(n * t[1]) >> 0 &&
            Math.round(n * e[2]) >> 0 === Math.round(n * t[2]) >> 0
          );
        },
      },
      {
        key: "diff",
        value: function (e, t, n) {
          var r = this.invPrecision,
            a = Math.round(r * e[0]) >> 0,
            o = Math.round(r * e[1]) >> 0,
            i = Math.round(r * e[2]) >> 0,
            s = Math.round(r * t[0]) >> 0,
            u = Math.round(r * t[1]) >> 0,
            l = Math.round(r * t[2]) >> 0;
          if (a === s && o === u && i === l) return !1;
          var h = ((c + (s - a)) ^ c) >>> 0,
            f = ((c + (u - o)) ^ c) >>> 0,
            d = ((c + (l - i)) ^ c) >>> 0,
            m = (h ? 1 : 0) | (f ? 2 : 0) | (d ? 4 : 0);
          return (
            n.grow(16),
            h
              ? (p(m, h, n), f && n.writeVarint(f), d && n.writeVarint(d))
              : f
                ? (p(m, f, n), d && n.writeVarint(d))
                : p(m, d, n),
            !0
          );
        },
      },
      {
        key: "patch",
        value: function (e, t) {
          var n = t.readUint8(),
            r = 0,
            a = 0,
            o = 0;
          16 & n
            ? ((r = m(n, t)), 32 & n && (a = u(t)), 64 & n && (o = u(t)))
            : 32 & n
              ? ((a = m(n, t)), 64 & n && (o = u(t)))
              : (o = m(n, t));
          var i = s.Vec3Schema.alloc(),
            c = this.invPrecision,
            l = this.precision,
            h = Math.round(c * e[0]) >> 0,
            f = Math.round(c * e[1]) >> 0,
            d = Math.round(c * e[2]) >> 0;
          return (
            (i[0] = l * (h + r)),
            (i[1] = l * (f + a)),
            (i[2] = l * (d + o)),
            i
          );
        },
      },
    ]),
    e
  );
})();
