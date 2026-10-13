/** 줄기 위 점에서 잎 방향(위 = 0°, 시계 방향 +)을 각도로 구한다. */
export const angleOf = (dx: number, dy: number) => (Math.atan2(dx, -dy) * 180) / Math.PI

/** 2차 베지어 위의 점과 기울기 각도 */
export function onCurve(p0: [number, number], p1: [number, number], p2: [number, number], t: number) {
  const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
  const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
  const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0])
  const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])
  return { x, y, angle: angleOf(dx, dy) }
}
