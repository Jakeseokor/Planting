import { Grad, Leaf, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// [회전, 잎자루 길이, 잎 길이] — 짧은 줄기에 둥글고 두꺼운 잎이 촘촘히
const LEAVES: [number, number, number][] = [
  [-78, 18, 30],
  [78, 18, 30],
  [-56, 28, 34],
  [56, 28, 34],
  [-34, 36, 34],
  [34, 36, 34],
  [-14, 44, 32],
  [14, 42, 32],
  [0, 30, 30],
  [-66, 10, 26],
  [66, 10, 26],
  [-26, 20, 28],
  [26, 22, 28],
]

export default function Peperomia({ className, title = '페페로미아' }: IllustrationProps) {
  const id = useIds()
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#62a85a', '#2f7535', '#1a4d22']} />
      </defs>
      <Pot kind="terracotta">
        {LEAVES.map(([r, stalk, len], i) => {
          const rad = (r * Math.PI) / 180
          const x = 100 + Math.sin(rad) * stalk
          const y = 140 - Math.cos(rad) * stalk
          return (
            <g key={i}>
              <path d={`M100 140 L${x} ${y}`} stroke="#6f8f4a" strokeWidth="2.4" strokeLinecap="round" />
              <Leaf
                x={x}
                y={y}
                r={r * 1.05}
                s={{ len, width: len * 0.8, a: 0.85, b: 0.55 }}
                fill={url(id('leaf'))}
                vein="#cfe6c2"
                veinOpacity={0.2}
                veins={3}
                gloss
              />
            </g>
          )
        })}
      </Pot>
    </Svg>
  )
}
