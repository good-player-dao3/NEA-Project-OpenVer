import { Matrix4, Vector3, Vector4 } from "./math";

export function worldToScreen(
  position: Vector3,
  viewProjection: Matrix4,
  viewport: [number, number]
) {
  const { x, y, z } = position;
  const v = new Vector4(x, y, z, 1.0);

  const clip = viewProjection.transformVec4(v);

  const ndc = new Vector3(clip.x, clip.y, clip.z).scale(1 / clip.w);

  const [width, height] = viewport;

  return {
    x: (ndc.x * 0.5 + 0.5) * width,
    y: (1 - (ndc.y * 0.5 + 0.5)) * height,
    z: ndc.z,
    w: clip.w
  };
}