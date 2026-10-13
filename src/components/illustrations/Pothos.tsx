import { Grad, HeartLeaf, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

/** 노란 대리석 무늬 */
function Marble() {
  return (
    <g stroke="#ecd97a" fill="none" strokeLinecap="round">
      <path d="M4 -8 C12 -16 8 -28 14 -36" strokeWidth="5" strokeOpacity="0.45" />
      <path d="M-6 -22 C-12 -28 -10 -36 -14 -40" strokeWidth="3" strokeOpacity="0.4" />
      <path d="M10 -18 C16 -20 18 -14 19 -10" strokeWidth="2" strokeOpacity="0.5" />
    </g>
  )
}

// [x, y, 회전, 크기]
const TOP: [number, number, number, number][] = [
  [100, 96, -4, 1.15], [80, 104, -40, 1.05], [120, 104, 40, 1.05], [70, 126, -76, 0.9], [130, 126, 76, 0.9],
  [90, 120, -18, 0.85], [111, 120, 20, 0.82], [62, 108, -58, 0.7], [138, 108, 58, 0.7],
]
const LEFT_VINE = 'M68 140 C50 144 44 160 48 182'
const RIGHT_VINE = 'M132 140 C150 146 156 162 152 186'
const HANG: [number, number, number, number][] = [
  [52, 150, -150, 0.5], [46, 166, -175, 0.46], [50, 180, 160, 0.42], [148, 152, 150, 0.5], [154, 170, 175, 0.46], [152, 186, -165, 0.4],
]

export default function Pothos({ className, title = '스킨답서스' }: IllustrationProps) {
  const id = useIds()
  const fill = url(id('leaf'))
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#6bb362', '#348343', '#1f5a2c']} />
      </defs>
      <Pot kind="blue">
        {TOP.map(([x, y, r, s]) => (
          <HeartLeaf key={`${x}${y}`} x={x} y={y + 30} r={r} scale={s} fill={fill}>
            <Marble />
          </HeartLeaf>
        ))}
      </Pot>
      {/* 화분 밖으로 늘어지는 덩굴 */}
      <g stroke="#3d7a3a" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d={LEFT_VINE} />
        <path d={RIGHT_VINE} />
      </g>
      {HANG.map(([x, y, r, s]) => (
        <HeartLeaf key={`${x}${y}`} x={x} y={y} r={r} scale={s} fill={fill}>
          <Marble />
        </HeartLeaf>
      ))}
    </Svg>
  )
}
