import { Grad, HeartLeaf, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// 이끼 지지대를 타고 오르는 하트 잎 [x, y, 회전, 크기]
const LEAVES: [number, number, number, number][] = [
  [94, 132, -70, 0.62], [106, 128, 66, 0.6], [92, 110, -54, 0.6], [108, 100, 50, 0.58],
  [93, 82, -46, 0.56], [107, 70, 44, 0.54], [95, 52, -34, 0.5], [104, 40, 24, 0.46],
]

export default function Philodendron({ className, title = '필로덴드론' }: IllustrationProps) {
  const id = useIds()
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#4f9a4c', '#246b2e', '#123f1a']} />
        <Grad id={id('pole')} stops={['#6b5a3c', '#8f7a52', '#5a4a30']} x2={1} y2={0} />
      </defs>
      <Pot kind="terracotta">
        {/* 이끼 지지대 */}
        <rect x="95" y="30" width="10" height="110" rx="3" fill={url(id('pole'))} />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M95 ${36 + i * 7.5} q5 3 10 -1`} stroke="#4a5a2c" strokeOpacity="0.6" strokeWidth="1.2" fill="none" />
        ))}
        <path d="M100 140 C96 120 104 100 98 80 C94 64 104 52 102 38" stroke="#4f8a3f" strokeWidth="2" fill="none" />
        {LEAVES.map(([x, y, r, s]) => (
          <HeartLeaf key={`${x}${y}`} x={x} y={y} r={r} scale={s} shape="pointed" fill={url(id('leaf'))} />
        ))}
      </Pot>
    </Svg>
  )
}
