import { useId, type ReactNode } from 'react'
import { onCurve } from './geom'

/**
 * 사실적인 화초 일러스트용 공통 도구.
 * - 모든 일러스트는 viewBox 0 0 200 200, 화분 중심 x = 100
 * - 잎은 밑동이 (0,0), 위쪽(-y)으로 자라는 좌표로 그린 뒤 translate/rotate 로 배치한다.
 */

export interface IllustrationProps {
  className?: string
  title?: string
}

/** 한 화면에 같은 일러스트가 여러 번 나와도 gradient id 가 겹치지 않게 한다. */
export function useIds() {
  const base = 'i' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (name: string) => `${base}-${name}`
}

export const url = (id: string) => `url(#${id})`

export function Svg({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
      {children}
    </svg>
  )
}

/** 잎 그라데이션: 왼쪽 위가 밝고 오른쪽 아래가 어둡다(빛이 왼쪽 위에서 들어오는 기준). */
export function Grad({ id, stops, x2 = 1, y2 = 1, x1 = 0, y1 = 0 }: {
  id: string
  stops: string[]
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}) {
  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
      {stops.map((c, i) => (
        <stop key={i} offset={stops.length === 1 ? 0 : i / (stops.length - 1)} stopColor={c} />
      ))}
    </linearGradient>
  )
}

// ───────────────────────── 화분 ─────────────────────────

const POT_COLORS = {
  terracotta: { light: '#eba57f', mid: '#cc7650', dark: '#8e4a2b', inner: '#5e3220' },
  white: { light: '#ffffff', mid: '#e8e3d8', dark: '#aca596', inner: '#7d776b' },
  gray: { light: '#c9cdcc', mid: '#a1a6a5', dark: '#666c6b', inner: '#434847' },
  blue: { light: '#9cbcd3', mid: '#6489a8', dark: '#37587a', inner: '#263f57' },
  black: { light: '#6d6d6d', mid: '#3d3d3d', dark: '#1c1c1c', inner: '#111111' },
} as const

export type PotKind = keyof typeof POT_COLORS

/** top: 화분 입구 y, rx: 입구 반지름, h: 몸통 높이 */
export const POT_SIZE = {
  standard: { top: 136, rx: 44, h: 54 },
  tall: { top: 128, rx: 40, h: 62 },
  low: { top: 152, rx: 50, h: 36 },
} as const

export type PotSize = keyof typeof POT_SIZE

/**
 * 화분 뒤쪽 테두리·흙 → children(식물) → 화분 앞쪽 순으로 그려
 * 줄기가 흙 속으로 들어가는 것처럼 보이게 한다.
 */
export function Pot({ kind = 'terracotta', size = 'standard', children }: {
  kind?: PotKind
  size?: PotSize
  children?: ReactNode
}) {
  const id = useIds()
  const c = POT_COLORS[kind]
  const { top: T, rx: R, h: H } = POT_SIZE[size]
  const ry = R * 0.16
  const band = 9
  const bl = 100 - R * 0.72
  const br = 100 + R * 0.72
  const body = `M${100 - R + 3} ${T + band} L${bl} ${T + H - 3} Q100 ${T + H + 4} ${br} ${T + H - 3} L${100 + R - 3} ${T + band} Z`
  return (
    <g>
      <defs>
        <Grad id={id('body')} stops={[c.mid, c.light, c.mid, c.dark]} x2={1} y2={0} />
        <Grad id={id('rim')} stops={[c.mid, c.light, c.light, c.mid, c.dark]} x2={1} y2={0} />
        <clipPath id={id('clip')}>
          <path d={body} />
        </clipPath>
        <radialGradient id={id('soil')} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#6e4b34" />
          <stop offset="1" stopColor="#33221a" />
        </radialGradient>
      </defs>
      {/* 바닥 그림자 */}
      <ellipse cx="100" cy={T + H + 3} rx={R * 0.95} ry="4.5" fill="#000" opacity="0.16" />
      {/* 화분 안쪽 + 흙 */}
      <ellipse cx="100" cy={T} rx={R} ry={ry} fill={c.inner} />
      <ellipse cx="100" cy={T + 1.5} rx={R - 4} ry={ry - 1.5} fill={url(id('soil'))} />
      {children}
      {/* 몸통 */}
      <path d={body} fill={url(id('body'))} />
      {/* 테두리 아래 그림자 */}
      <path
        d={`M${100 - R + 3} ${T + band + ry * 0.6} Q100 ${T + band + ry * 2.2} ${100 + R - 3} ${T + band + ry * 0.6} L${100 + R - 3.4} ${T + band + ry * 0.6 + 4} Q100 ${T + band + ry * 2.2 + 4} ${100 - R + 3.4} ${T + band + ry * 0.6 + 4} Z`}
        fill="#000"
        opacity="0.14"
        clipPath={url(id('clip'))}
      />
      {/* 앞쪽 테두리 */}
      <path
        d={`M${100 - R} ${T} A${R} ${ry} 0 0 0 ${100 + R} ${T} V${T + band} A${R} ${ry} 0 0 1 ${100 - R} ${T + band} Z`}
        fill={url(id('rim'))}
      />
      <path d={`M${100 - R} ${T} A${R} ${ry} 0 0 0 ${100 + R} ${T}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" fill="none" />
    </g>
  )
}

// ───────────────────────── 잎 ─────────────────────────

type Pt = [number, number]

export interface LeafShape {
  /** 잎 길이 */
  len: number
  /** 가장 넓은 곳의 폭 */
  width: number
  /** 잎 끝이 옆으로 휘는 정도(+ 는 오른쪽) */
  bend?: number
  /** 잎 끝이 아래로 처지는 정도 */
  droop?: number
  /** 폭이 가장 넓은 위치. 1 = 가운데, <1 = 밑동 쪽, >1 = 끝 쪽 */
  a?: number
  /** 잎 모양의 통통함. 작을수록 뭉툭하다 */
  b?: number
}

function leafGeom({ len, width, bend = 0, droop = 0, a = 1, b = 0.8 }: LeafShape) {
  const p1: Pt = [0, -len * 0.55]
  const p2: Pt = [bend, -len + droop]
  const at = (t: number): Pt => [2 * (1 - t) * t * p1[0] + t * t * p2[0], 2 * (1 - t) * t * p1[1] + t * t * p2[1]]
  const normal = (t: number): Pt => {
    const tx = 2 * (1 - t) * p1[0] + 2 * t * (p2[0] - p1[0])
    const ty = 2 * (1 - t) * p1[1] + 2 * t * (p2[1] - p1[1])
    const m = Math.hypot(tx, ty) || 1
    return [-ty / m, tx / m]
  }
  const half = (t: number) => (width / 2) * Math.pow(Math.sin(Math.PI * Math.pow(t, a)), b)
  const side = (t: number, k: number, sign: number): Pt => {
    const c = at(t)
    const n = normal(t)
    const w = half(t) * k * sign
    return [c[0] + n[0] * w, c[1] + n[1] * w]
  }
  return { at, side, p2 }
}

const STEPS = 24
const pt = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`
const range = (from = 0, to = 1) => Array.from({ length: STEPS + 1 }, (_, i) => from + ((to - from) * i) / STEPS)

function outline(g: ReturnType<typeof leafGeom>, k = 1) {
  const right = range().map((t) => g.side(t, k, 1))
  const left = range().map((t) => g.side(t, k, -1)).reverse()
  return `M${[...right, ...left].map(pt).join('L')}Z`
}

export interface LeafProps {
  x?: number
  y?: number
  r?: number
  s: LeafShape
  fill: string
  /** 오른쪽 절반을 어둡게 하는 정도(0~1) */
  shade?: number
  vein?: string
  veins?: number
  veinWidth?: number
  veinOpacity?: number
  midrib?: boolean
  gloss?: boolean
  /** 가운데 무늬(행운목 줄무늬, 칼라데아 깃털 무늬 등). k = 잎 폭 대비 비율 */
  inner?: { k: number; fill: string }
  /** 가로 띠 무늬(산세베리아) */
  bands?: { count: number; color: string; opacity?: number }
  /** 잎 테두리 선 색 */
  edge?: string
}

export function Leaf({
  x = 0,
  y = 0,
  r = 0,
  s,
  fill,
  shade = 0.18,
  vein = '#cfe8c4',
  veins = 0,
  veinWidth = 0.7,
  veinOpacity = 0.5,
  midrib = true,
  gloss = false,
  inner,
  bands,
  edge,
}: LeafProps) {
  const g = leafGeom(s)
  const mid = range().map(g.at)
  const rightHalf = `M${range().map((t) => pt(g.side(t, 1, 1))).join('L')}L${[...mid].reverse().map(pt).join('L')}Z`
  const veinPaths: string[] = []
  for (let i = 1; i <= veins; i++) {
    const t = 0.06 + (i / (veins + 1)) * 0.86
    const t2 = Math.min(t + 0.09, 0.98)
    for (const sign of [1, -1]) {
      veinPaths.push(`M${pt(g.at(t))}Q${pt(g.side(t + 0.03, 0.5, sign))} ${pt(g.side(t2, 0.88, sign))}`)
    }
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d={outline(g)} fill={fill} />
      {inner && <path d={outline(g, inner.k)} fill={inner.fill} />}
      {bands &&
        Array.from({ length: bands.count }, (_, i) => {
          const t = 0.08 + (i / bands.count) * 0.84
          return (
            <path
              key={i}
              d={`M${pt(g.side(t, 0.92, -1))}Q${pt(g.side(t + 0.035, 0.2, 1))} ${pt(g.side(t + 0.01, 0.92, 1))}`}
              stroke={bands.color}
              strokeOpacity={bands.opacity ?? 0.6}
              strokeWidth={(s.len / bands.count) * 0.32}
              fill="none"
              strokeLinecap="round"
            />
          )
        })}
      {shade > 0 && <path d={rightHalf} fill="#000" opacity={shade} />}
      {veinPaths.map((d) => (
        <path key={d} d={d} stroke={vein} strokeOpacity={veinOpacity} strokeWidth={veinWidth} fill="none" strokeLinecap="round" />
      ))}
      {midrib && (
        <path
          d={`M${mid.slice(0, -2).map(pt).join('L')}`}
          stroke={vein}
          strokeOpacity={0.75}
          strokeWidth={Math.max(0.7, s.width * 0.05)}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {edge && <path d={outline(g)} fill="none" stroke={edge} strokeWidth="0.7" strokeOpacity="0.7" />}
      {gloss && (
        <path
          d={`M${range(0.18, 0.62).map((t) => pt(g.side(t, 0.55, -1))).join('L')}`}
          stroke="#fff"
          strokeOpacity="0.28"
          strokeWidth={Math.max(1, s.width * 0.08)}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  )
}

/** 야자류 깃털 잎: 휘어진 잎줄기 양쪽으로 가는 잎이 달린다. */
export function Frond({
  from,
  ctrl,
  to,
  count,
  leaflet,
  fill,
  stem,
  spread = 55,
  start = 0.12,
  stemWidth = 1.6,
}: {
  from: Pt
  ctrl: Pt
  to: Pt
  count: number
  leaflet: { len: number; width: number }
  fill: string
  stem: string
  spread?: number
  start?: number
  stemWidth?: number
}) {
  const items = []
  for (let i = 0; i < count; i++) {
    const t = start + ((1 - start) * i) / (count - 1)
    const p = onCurve(from, ctrl, to, t)
    const len = leaflet.len * (1 - 0.55 * Math.pow((t - start) / (1 - start), 1.6))
    for (const side of [1, -1]) {
      items.push(
        <Leaf
          key={`${i}${side}`}
          x={p.x}
          y={p.y}
          r={p.angle + side * spread}
          s={{ len, width: leaflet.width, bend: side * len * 0.18, droop: len * 0.1, a: 0.8, b: 0.9 }}
          fill={fill}
          shade={0.12}
          vein="#e2f2c8"
        />,
      )
    }
  }
  return (
    <g>
      <path d={`M${pt(from)}Q${pt(ctrl)} ${pt(to)}`} stroke={stem} strokeWidth={stemWidth} fill="none" strokeLinecap="round" />
      {items}
    </g>
  )
}

// ───────────────────────── 하트 잎 ─────────────────────────

const HEARTS = {
  // 스킨답서스: 짧고 둥근 하트
  round: {
    d: 'M0 0 C-10 4 -26 -2 -26 -18 C-26 -34 -10 -44 0 -56 C10 -44 26 -34 26 -18 C26 -2 10 4 0 0 Z',
    right: 'M0 0 C10 4 26 -2 26 -18 C26 -34 10 -44 0 -56 Z',
    len: 56,
    w: 26,
  },
  // 필로덴드론: 끝이 길고 뾰족한 하트
  pointed: {
    d: 'M0 0 C-10 5 -24 0 -24 -16 C-24 -32 -8 -44 0 -64 C8 -44 24 -32 24 -16 C24 0 10 5 0 0 Z',
    right: 'M0 0 C10 5 24 0 24 -16 C24 -32 8 -44 0 -64 Z',
    len: 64,
    w: 24,
  },
}

export function HeartLeaf({
  x,
  y,
  r,
  scale = 1,
  fill,
  shape = 'round',
  vein = '#cfe8c4',
  children,
}: {
  x: number
  y: number
  r: number
  scale?: number
  fill: string
  shape?: keyof typeof HEARTS
  vein?: string
  children?: ReactNode
}) {
  const h = HEARTS[shape]
  const veins = [0.16, 0.36, 0.56].flatMap((k) =>
    [1, -1].map(
      (s) => `M0 ${-h.len * k}Q${s * h.w * 0.45} ${-h.len * (k + 0.05)} ${s * h.w * 0.78} ${-h.len * (k + 0.2)}`,
    ),
  )
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${scale})`}>
      <path d={h.d} fill={fill} />
      {children}
      <path d={h.right} fill="#000" opacity="0.16" />
      {veins.map((d) => (
        <path key={d} d={d} stroke={vein} strokeOpacity="0.45" strokeWidth="1" fill="none" strokeLinecap="round" />
      ))}
      <path d={`M0 -1 V${-h.len + 6}`} stroke={vein} strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
      <path d={`M${-h.w * 0.55} ${-h.len * 0.5} Q${-h.w * 0.4} ${-h.len * 0.75} -3 ${-h.len * 0.85}`} stroke="#fff" strokeOpacity="0.25" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  )
}
