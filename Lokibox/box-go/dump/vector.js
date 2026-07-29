t.Vec3Schema = {
  muType: "vector",
  identity: r.vec3.create(),
  json: {
    type: "vector",
    data: [0, 0, 0],
  },
  alloc: function () {
    return o.pop() || r.vec3.create();
  },
  free: function (e) {
    o.push(e);
  },
  assign: function (e, t) {
    return ((e[0] = t[0]), (e[1] = t[1]), (e[2] = t[2]), e);
  },
  equal: function (e, t) {
    return e[0] === t[0] && e[1] === t[1] && e[2] === t[2];
  },
  diff: function (e, t, n) {
    var r = (e[0] !== t[0]) << 0,
      a = (e[1] !== t[1]) << 1,
      o = (e[2] !== t[2]) << 2,
      i = r + a + o;
    return (
      0 !== i &&
      (n.grow(13),
      n.writeUint8(i),
      r && n.writeFloat32(t[0]),
      a && n.writeFloat32(t[1]),
      o && n.writeFloat32(t[2]),
      !0)
    );
  },
  patch: function (e, t) {
    var n = o.pop() || r.vec3.create(),
      a = t.readUint8();
    return (
      (n[0] = 1 & a ? t.readFloat32() : e[0]),
      (n[1] = 2 & a ? t.readFloat32() : e[1]),
      (n[2] = 4 & a ? t.readFloat32() : e[2]),
      n
    );
  },
  clone: function (e) {
    var t = o.pop();
    return t
      ? ((t[0] = e[0]), (t[1] = e[1]), (t[2] = e[2]), t)
      : r.vec3.clone(e);
  },
  toJSON: function (e) {
    return [e[0], e[1], e[2]];
  },
  fromJSON: function (e) {
    var t = o.pop();
    return Array.isArray(e)
      ? (((t = t || r.vec3.create())[0] = +e[0] || 0),
        (t[1] = +e[1] || 0),
        (t[2] = +e[2] || 0),
        t)
      : t
        ? ((t[0] = t[1] = t[2] = 0), t)
        : r.vec3.create();
  },
};
