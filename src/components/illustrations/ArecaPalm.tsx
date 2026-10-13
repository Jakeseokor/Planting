import { Frond, Pot, Svg, type IllustrationProps } from './kit'

type P = [number, number]
// 노란빛 줄기에서 길게 휘어지는 깃털 잎
const FRONDS: [P, P, P][] = [
  [
    [94, 132],
    [60, 60],
    [12, 64],
  ],
  [
    [106, 132],
    [140, 60],
    [188, 66],
  ],
  [
    [96, 132],
    [76, 40],
    [40, 22],
  ],
  [
    [104, 132],
    [124, 40],
    [162, 24],
  ],
  [
    [99, 132],
    [96, 50],
    [84, 8],
  ],
  [
    [101, 132],
    [108, 60],
    [124, 10],
  ],
]

export default function ArecaPalm({ className, title = '아레카야자' }: IllustrationProps) {
  return (
    <Svg title={title} className={className}>
      <Pot kind="gray" size="tall">
        {FRONDS.map(([a, c, b], i) => (
          <Frond
            key={i}
            from={a}
            ctrl={c}
            to={b}
            count={18}
            start={0.28}
            leaflet={{ len: 26, width: 3.4 }}
            fill={i % 2 ? '#7aa843' : '#8fbb4f'}
            stem="#c9b44f"
            stemWidth={2.2}
            spread={62}
          />
        ))}
      </Pot>
    </Svg>
  )
}
