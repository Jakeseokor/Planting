import { Grad, Leaf, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// [x, 기울기, 길이, 폭, 휨]
const LEAVES: [number, number, number, number, number][] = [
  [84, -24, 70, 15, -6], [116, 22, 74, 15, 6], [92, -9, 100, 17, -3], [110, 8, 92, 16, 4], [100, -1, 112, 18, 2], [78, -36, 52, 13, -5], [122, 34, 56, 13, 5],
]

export default function Sansevieria({ className, title = '산세베리아' }: IllustrationProps) {
  const id = useIds()
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#4f7f4a', '#2f5a33', '#1e3d24']} x2={1} y2={0} />
      </defs>
      <Pot kind="gray">
        {LEAVES.map(([x, r, len, width, bend]) => (
          <Leaf
            key={`${x}${r}`}
            x={x}
            y={140}
            r={r}
            s={{ len, width, bend, a: 1.05, b: 0.55 }}
            fill="#d8c95c"
            inner={{ k: 0.8, fill: url(id('leaf')) }}
            bands={{ count: Math.round(len / 7), color: '#a9c99a', opacity: 0.45 }}
            midrib={false}
            shade={0.14}
          />
        ))}
      </Pot>
    </Svg>
  )
}
