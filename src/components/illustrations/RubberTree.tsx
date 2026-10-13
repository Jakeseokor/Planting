import { Grad, Leaf, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// 줄기 위 [x, y, 회전, 길이, 폭] — 어긋나게 달리는 두껍고 윤기 나는 타원형 잎
const LEAVES: [number, number, number, number, number][] = [
  [99, 112, -78, 40, 19],
  [101, 104, 74, 42, 20],
  [99, 88, -62, 44, 21],
  [102, 78, 58, 44, 21],
  [100, 62, -44, 42, 20],
  [103, 52, 40, 40, 19],
  [102, 40, -20, 36, 17],
  [104, 34, 18, 32, 15],
]

export default function RubberTree({ className, title = '고무나무' }: IllustrationProps) {
  const id = useIds()
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#4e8a52', '#245a2f', '#123a1c']} />
        <Grad id={id('trunk')} stops={['#7a6a52', '#a8977a', '#5e5040']} x2={1} y2={0} />
      </defs>
      <Pot kind="white">
        <path d="M97 140 C97 110 99 70 103 30 L106 30 C103 70 103 110 103 140 Z" fill={url(id('trunk'))} />
        {LEAVES.map(([x, y, r, len, width]) => (
          <g key={`${x}${y}`}>
            <path d={`M${x} ${y} l${r > 0 ? 6 : -6} -3`} stroke="#5e5040" strokeWidth="1.6" />
            <Leaf
              x={x + (r > 0 ? 5 : -5)}
              y={y - 3}
              r={r}
              s={{ len, width, a: 0.95, b: 0.7, bend: (r > 0 ? 1 : -1) * 3 }}
              fill={url(id('leaf'))}
              vein="#d9e9c9"
              veins={7}
              veinOpacity={0.18}
              gloss
            />
          </g>
        ))}
        {/* 새잎을 감싼 붉은 덮개 */}
        <path d="M103 32 Q100 18 106 8 Q110 20 107 32 Z" fill="#b5404a" />
        <path d="M104 28 Q103 18 106 11" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" fill="none" />
      </Pot>
    </Svg>
  )
}
