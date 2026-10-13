import { Grad, Leaf, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// 잘린 굵은 줄기(높이 다른 2개) 위로 긴 잎이 뭉쳐 나온다. [x, 줄기 꼭대기 y, 굵기]
const CANES: [number, number, number][] = [
  [90, 92, 13],
  [111, 64, 12],
]

function Rosette({ x, y, fill }: { x: number; y: number; fill: string }) {
  const angles = [-82, -62, -42, -24, -8, 8, 24, 42, 62, 82]
  return (
    <g>
      {angles.map((r, i) => {
        const len = 52 - Math.abs(r) * 0.18 + (i % 2) * 4
        const sign = r < 0 ? -1 : 1
        return (
          <Leaf
            key={r}
            x={x}
            y={y}
            r={r * 0.9}
            s={{ len, width: 9, bend: sign * len * 0.35, droop: Math.abs(r) * 0.3, a: 0.9, b: 0.45 }}
            fill={fill}
            inner={{ k: 0.38, fill: '#c3d26a' }}
            vein="#e4efb0"
            shade={0.15}
          />
        )
      })}
    </g>
  )
}

export default function Dracaena({ className, title = '행운목' }: IllustrationProps) {
  const id = useIds()
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#4f9147', '#2a6630', '#17421d']} />
        <Grad id={id('bark')} stops={['#6d5a44', '#a08a6b', '#8a7558', '#4d3f30']} x2={1} y2={0} />
      </defs>
      <Pot kind="white" size="tall">
        {CANES.map(([x, top, w]) => (
          <g key={x}>
            <rect x={x - w / 2} y={top} width={w} height={132 - top} fill={url(id('bark'))} />
            {/* 마디 무늬 */}
            {Array.from({ length: Math.floor((132 - top) / 7) }, (_, i) => (
              <path
                key={i}
                d={`M${x - w / 2} ${top + 8 + i * 7} q${w / 2} 2 ${w} 0`}
                stroke="#3c3125"
                strokeOpacity="0.45"
                strokeWidth="0.8"
                fill="none"
              />
            ))}
            <ellipse cx={x} cy={top} rx={w / 2} ry="2" fill="#d8c7a2" />
          </g>
        ))}
        {CANES.map(([x, top]) => (
          <Rosette key={x} x={x + 2} y={top + 6} fill={url(id('leaf'))} />
        ))}
      </Pot>
    </Svg>
  )
}
