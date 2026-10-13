import { Grad, Leaf, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// [밑동 x, 회전, 잎자루 길이, 잎 길이, 뒷면(보라색)인지]
const LEAVES: [number, number, number, number, boolean][] = [
  [94, -58, 36, 42, false],
  [106, 56, 34, 42, false],
  [96, -32, 50, 46, false],
  [104, 30, 52, 46, true],
  [99, -10, 58, 46, false],
  [101, 12, 44, 44, false],
  [92, -78, 20, 38, true],
  [108, 78, 22, 38, false],
]

export default function Calathea({ className, title = '칼라데아' }: IllustrationProps) {
  const id = useIds()
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#3d7a4a', '#24553a', '#173d29']} />
        <Grad id={id('under')} stops={['#9a4f80', '#6e2f5c', '#4f1f42']} />
      </defs>
      <Pot kind="gray">
        {LEAVES.map(([x, r, stalk, len, under]) => {
          const rad = (r * Math.PI) / 180
          const lx = x + Math.sin(rad) * stalk
          const ly = 140 - Math.cos(rad) * stalk
          return (
            <g key={`${x}${r}`}>
              <path d={`M${x} 140 L${lx} ${ly}`} stroke={under ? '#7a3c63' : '#4f7a45'} strokeWidth="1.8" />
              {under ? (
                <Leaf
                  x={lx}
                  y={ly}
                  r={r * 1.1}
                  s={{ len, width: len * 0.55, a: 0.95, b: 0.7 }}
                  fill={url(id('under'))}
                  vein="#d7a8c8"
                  veins={9}
                  veinOpacity={0.35}
                />
              ) : (
                <Leaf
                  x={lx}
                  y={ly}
                  r={r * 1.1}
                  s={{ len, width: len * 0.55, a: 0.95, b: 0.7 }}
                  fill={url(id('leaf'))}
                  inner={{ k: 0.62, fill: '#8fc283' }}
                  vein="#1f4a2c"
                  veins={9}
                  veinWidth={1.8}
                  veinOpacity={0.9}
                  shade={0.12}
                />
              )}
            </g>
          )
        })}
      </Pot>
    </Svg>
  )
}
