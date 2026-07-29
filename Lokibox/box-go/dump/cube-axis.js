((t.CubeAxisSchema = {
  muType: "cube-axis",
  muData: {
    type: "cube-axis",
  },
  json: {
    type: "cube-axis",
  },
  identity: c.vec3.fromValues(1, 0, 0),
  diff: function (e, t, n) {
    var r = W(e),
      a = W(t);
    return r !== a && (n.grow(1), n.writeUint8(a), !0);
  },
  patch: function (e, n) {
    var r = n.readUint8();
    return (
      (r < 0 || r >= 6) && c.vec3.set(e, 0, 0, 0),
      i.Vec3Schema.clone(t.CUBE_AXIS[r])
    );
  },
  alloc: function () {
    return i.Vec3Schema.alloc();
  },
  free: function (e) {
    return i.Vec3Schema.free(e);
  },
  equal: function (e, t) {
    return W(e) === W(t);
  },
  clone: function (e) {
    return i.Vec3Schema.clone(e);
  },
  assign: function (e, t) {
    return c.vec3.copy(e, t);
  },
  toJSON: function (e) {
    return W(e);
  },
  fromJSON: function (e) {
    return "number" === typeof e && e >= 0 && e <= 5
      ? i.Vec3Schema.clone(t.CUBE_AXIS[0 | e])
      : i.Vec3Schema.clone(t.CUBE_AXIS[0]);
  },
}),
  (t.BodyContactSchema = new a.MuStruct({
    otherId: new a.MuVarint(),
    nx: new a.MuFloat32(),
    ny: new a.MuFloat32(),
    nz: new a.MuFloat32(),
    fx: new a.MuFloat32(),
    fy: new a.MuFloat32(),
    fz: new a.MuFloat32(),
  })),
  (t.BodyContactSetSchema = new a.MuSortedArray(t.BodyContactSchema, 1 / 0, J)),
  (t.VoxelContactSchema = new a.MuStruct({
    x: new a.MuVarint(0),
    y: new a.MuVarint(0),
    z: new a.MuVarint(0),
    b: new a.MuVarint(0),
    axis: new a.MuInt8(),
    fx: new a.MuFloat32(),
    fy: new a.MuFloat32(),
    fz: new a.MuFloat32(),
  })),
  (t.VoxelContactSetSchema = new a.MuSortedArray(
    t.VoxelContactSchema,
    1 / 0,
    Q,
  )),
  (t.FluidContactSchema = new a.MuStruct({
    b: new a.MuVarint(),
    volumeFraction: new a.MuQuantizedFloat(1 / 256, 0),
  })),
  (t.FluidContactSetSchema = new a.MuSortedArray(
    t.FluidContactSchema,
    1 / 0,
    $,
  )),
  (t.ContactRecordSchema = new a.MuStruct({
    id: new a.MuVarint(),
    body: t.BodyContactSetSchema,
    voxel: t.VoxelContactSetSchema,
    fluidVoxels: new a.MuArray(new a.MuVarint(), 1 / 0),
    fluidVolumeFraction: new a.MuArray(new a.MuFloat32(), 1 / 0),
  })),
  (t.ContactIndexSchema = new a.MuSortedArray(
    t.ContactRecordSchema,
    1 / 0,
    o.compareId,
  )));
