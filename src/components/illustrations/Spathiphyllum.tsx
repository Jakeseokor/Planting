import { Grad, Leaf, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// [밑동 x, 회전, 길이, 폭, 휨, 처짐]
const LEAVES: [number, number, number, number, number, number][] = [
  [92, -62, 62, 18, -16, 14],
  [108, 62, 62, 18, 16, 14],
  [94, -40, 74, 19, -14, 8],
  [106, 38, 74, 19, 14, 8],
  [96, -20, 82, 19, -10, 4],
  [104, 18, 80, 19, 10, 4],
  [100, -4, 70, 18, -4, 0],
  [90, -78, 50, 16, -14, 16],
  [110, 80, 48, 16, 14, 16],
]

function Flower({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M0 0 C-12 -6 -14 -26 0 -42 C14 -26 12 -6 0 0 Z" fill="#fbfcf6" />
      <path d="M0 0 C12 -6 14 -26 0 -42 C4 -26 4 -6 0 0 Z" fill="#cfd8c0" opacity="0.7" />
      <path d="M0 -2 V-38" stroke="#dfe7d2" strokeWidth="0.8" />
      <rect x="-2.4" y="-22" width="4.8" height="16" rx="2.4" fill="#efe3a8" />
    </g>
  )
}

export default function Spathiphyllum({ className, title = '스파티필룸' }: IllustrationProps) {
  const id = useIds()
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#4f9450', '#246030', '#143e1d']} />
      </defs>
      <Pot kind="white">
        {/* 꽃대 */}
        <path d="M98 140 C96 100 86 60 80 38" stroke="#4f8a45" strokeWidth="2" fill="none" />
        <path d="M103 140 C106 104 116 70 124 46" stroke="#4f8a45" strokeWidth="2" fill="none" />
        {LEAVES.map(([x, r, len, width, bend, droop]) => (
          <g key={`${x}${r}`}>
            <Leaf
              x={x}
              y={140}
              r={r}
              s={{ len, width, bend, droop, a: 1.25, b: 0.8 }}
              fill={url(id('leaf'))}
              vein="#cfe6c2"
              veins={8}
              veinOpacity={0.25}
              gloss
            />
          </g>
        ))}
        <Flower x={80} y={40} r={-12} />
        <Flower x={124} y={48} r={16} />
      </Pot>
    </Svg>
  )
}
