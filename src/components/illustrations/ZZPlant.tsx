import { onCurve } from './geom'
import { Grad, Leaf, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

type P = [number, number]
// 줄기: [밑동, 조절점, 끝]
const STEMS: [P, P, P][] = [
  [
    [90, 140],
    [84, 100],
    [62, 52],
  ],
  [
    [96, 140],
    [94, 90],
    [88, 26],
  ],
  [
    [104, 140],
    [108, 92],
    [118, 30],
  ],
  [
    [110, 140],
    [120, 104],
    [144, 60],
  ],
  [
    [100, 140],
    [100, 110],
    [100, 70],
  ],
]

export default function ZZPlant({ className, title = '금전수' }: IllustrationProps) {
  const id = useIds()
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#3f8a45', '#1f5a2a', '#0f3418']} />
        <Grad id={id('stem')} stops={['#5f8f4a', '#8bb26b', '#3f6a32']} x2={1} y2={0} />
      </defs>
      <Pot kind="black">
        {STEMS.map(([a, c, b], si) => (
          <g key={si}>
            {/* 밑동이 통통한 줄기 */}
            <path
              d={`M${a[0] - 3} ${a[1]} Q${c[0] - 1} ${c[1]} ${b[0]} ${b[1]} Q${c[0] + 1} ${c[1]} ${a[0] + 3} ${a[1]} Z`}
              fill={url(id('stem'))}
            />
            {Array.from({ length: 7 }, (_, i) => {
              const t = 0.32 + i * 0.105
              const p = onCurve(a, c, b, t)
              const side = i % 2 ? 1 : -1
              const len = 20 - i * 1.2
              return (
                <Leaf
                  key={i}
                  x={p.x}
                  y={p.y}
                  r={p.angle + side * 48}
                  s={{ len, width: len * 0.5, a: 0.9, b: 0.7, bend: side * 2 }}
                  fill={url(id('leaf'))}
                  vein="#cfe6c2"
                  gloss
                />
              )
            })}
            <Leaf
              x={b[0]}
              y={b[1]}
              r={onCurve(a, c, b, 1).angle}
              s={{ len: 14, width: 7, a: 0.9, b: 0.7 }}
              fill={url(id('leaf'))}
              gloss
            />
          </g>
        ))}
      </Pot>
    </Svg>
  )
}
