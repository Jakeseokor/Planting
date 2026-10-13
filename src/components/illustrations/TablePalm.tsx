import { Frond, Pot, Svg, type IllustrationProps } from './kit'

type P = [number, number]
// 가는 줄기 끝에 깃털 모양 잎이 퍼지는 작은 야자
const FRONDS: [P, P, P, number][] = [
  [[96, 140], [74, 96], [30, 86], 12],
  [[104, 140], [126, 96], [170, 88], 12],
  [[98, 140], [84, 70], [56, 36], 13],
  [[102, 140], [116, 70], [146, 38], 13],
  [[100, 140], [100, 70], [102, 20], 14],
]

export default function TablePalm({ className, title = '테이블야자' }: IllustrationProps) {
  return (
    <Svg title={title} className={className}>
      <Pot kind="terracotta">
        {FRONDS.map(([a, c, b, n], i) => (
          <Frond key={i} from={a} ctrl={c} to={b} count={n} start={0.3} leaflet={{ len: 24, width: 4.6 }} fill={i % 2 ? '#2f7a3c' : '#3b8a46'} stem="#4f7f3a" spread={58} />
        ))}
      </Pot>
    </Svg>
  )
}
