import { Grad, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// 다섯 갈래로 갈라진 아이비 잎 (밑동 (0,0), 위쪽으로)
const IVY =
  'M0 0 C-5 1 -9 0 -12 -2 C-17 -3 -18 -7 -14 -9 C-17 -13 -16 -18 -10 -17 C-8 -22 -4 -27 0 -28 C4 -27 8 -22 10 -17 C16 -18 17 -13 14 -9 C18 -7 17 -3 12 -2 C9 0 5 1 0 0 Z'
const IVY_RIGHT = 'M0 0 C5 1 9 0 12 -2 C17 -3 18 -7 14 -9 C17 -13 16 -18 10 -17 C8 -22 4 -27 0 -28 Z'

function IvyLeaf({ x, y, r, s = 1, fill }: { x: number; y: number; r: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d={IVY} fill={fill} />
      <path d={IVY_RIGHT} fill="#000" opacity="0.15" />
      {/* 흰 잎맥 */}
      <g stroke="#dfeccd" strokeOpacity="0.85" strokeWidth="0.9" fill="none" strokeLinecap="round">
        <path d="M0 -1 L0 -24" />
        <path d="M0 -2 L-13 -16" />
        <path d="M0 -2 L13 -16" />
        <path d="M0 -1 L-15 -5" />
        <path d="M0 -1 L15 -5" />
      </g>
    </g>
  )
}

type L = [number, number, number, number]
const TOP: L[] = [
  [100, 104, 0, 1.4],
  [84, 112, -40, 1.25],
  [116, 112, 40, 1.25],
  [92, 92, -18, 1.1],
  [110, 94, 20, 1.1],
  [74, 126, -70, 1.1],
  [126, 126, 70, 1.1],
]
const VINES = ['M66 140 C44 146 36 170 44 198', 'M80 142 C70 156 70 176 76 192', 'M134 140 C158 146 164 170 156 198']
const HANG: L[] = [
  [50, 152, -140, 0.9],
  [40, 170, 160, 0.85],
  [44, 190, -170, 0.75],
  [72, 164, 150, 0.8],
  [76, 184, -160, 0.7],
  [152, 152, 140, 0.9],
  [162, 172, -160, 0.85],
  [156, 192, 170, 0.75],
]

export default function Ivy({ className, title = '아이비' }: IllustrationProps) {
  const id = useIds()
  const fill = url(id('leaf'))
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#3f7d44', '#1f5229', '#123a1b']} />
      </defs>
      <Pot kind="white">
        {TOP.map(([x, y, r, s]) => (
          <IvyLeaf key={`${x}${y}`} x={x} y={y + 30} r={r} s={s} fill={fill} />
        ))}
      </Pot>
      <g stroke="#7a4a3a" strokeWidth="1.4" fill="none" strokeLinecap="round">
        {VINES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {HANG.map(([x, y, r, s]) => (
        <IvyLeaf key={`${x}${y}`} x={x} y={y} r={r} s={s} fill={fill} />
      ))}
    </Svg>
  )
}
