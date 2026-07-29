var d = (function () {
  function e(t, n) {
    (r(this, e),
      (this.precision = t),
      (this.invPrecision = 1),
      (this.identity = i.vec2.create()),
      (this.muData = {
        type: "quantized-vec2",
        precision: 0,
        identity: [0, 0],
      }),
      (this.muType = "quantized-vec2"),
      (this.invPrecision = 1 / this.precision),
      n &&
        ((this.identity[0] =
          this.precision * (Math.round(this.invPrecision * n[0]) >> 0)),
        (this.identity[1] =
          this.precision * (Math.round(this.invPrecision * n[1]) >> 0))),
      (this.json = this.muData =
        {
          type: "quantized-vec2",
          precision: this.precision,
          identity: [this.identity[0], this.identity[1]],
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
            e
          );
        },
      },
      {
        key: "clone",
        value: function (e) {
          var t = s.Vec2Schema.alloc();
          return this.assign(t, e);
        },
      },
      {
        key: "alloc",
        value: function () {
          return s.Vec2Schema.alloc();
        },
      },
      {
        key: "free",
        value: function (e) {
          return s.Vec2Schema.free(e);
        },
      },
      {
        key: "toJSON",
        value: function (e) {
          return [
            this.precision * (Math.round(this.invPrecision * e[0]) >> 0),
            this.precision * (Math.round(this.invPrecision * e[1]) >> 0),
          ];
        },
      },
      {
        key: "fromJSON",
        value: function (e) {
          return Array.isArray(e) &&
            2 === e.length &&
            "number" === typeof e[0] &&
            "number" === typeof e[1]
            ? this.clone(e)
            : s.Vec2Schema.clone(this.identity);
        },
      },
      {
        key: "equal",
        value: function (e, t) {
          var n = this.invPrecision;
          return (
            Math.round(n * e[0]) >> 0 === Math.round(n * t[0]) >> 0 &&
            Math.round(n * e[1]) >> 0 === Math.round(n * t[1]) >> 0
          );
        },
      },
      {
        key: "diff",
        value: function (e, t, n) {
          var r = this.invPrecision,
            a = Math.round(r * e[0]) >> 0,
            o = Math.round(r * e[1]) >> 0,
            i = Math.round(r * t[0]) >> 0,
            s = Math.round(r * t[1]) >> 0;
          if (a === i && o === s) return !1;
          var u = ((c + (i - a)) ^ c) >>> 0,
            l = ((c + (s - o)) ^ c) >>> 0,
            f = (u ? 1 : 0) | (l ? 2 : 0);
          return (
            n.grow(16),
            u ? (h(f, u, n), l && n.writeVarint(l)) : h(f, l, n),
            !0
          );
        },
      },
      {
        key: "patch",
        value: function (e, t) {
          var n = t.readUint8(),
            r = 0,
            a = 0;
          32 & n ? ((r = f(n, t)), 64 & n && (a = u(t))) : (a = f(n, t));
          var o = s.Vec2Schema.alloc(),
            i = this.invPrecision,
            c = this.precision,
            l = Math.round(i * e[0]) >> 0,
            h = Math.round(i * e[1]) >> 0;
          return ((o[0] = c * (l + r)), (o[1] = c * (h + a)), o);
        },
      },
    ]),
    e
  );
})();
