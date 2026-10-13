import { Grad, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// [밑동 x, 잎 끝 y, 기울기, 굵기] — 원통형 잎이 부채꼴로 솟는다
const STALKS: [number, number, number, number][] = [
  [72, 74, -15, 11],
  [86, 42, -7, 12],
  [100, 22, 0, 13],
  [114, 46, 7, 12],
  [128, 78, 16, 11],
]
const BASE = 139

export default function Stucky({ className, title = '스투키' }: IllustrationProps) {
  const id = useIds()
  return (
    <Svg title={title} className={className}>
      <defs>
        {/* 원통 음영: 양 끝 어둡고 왼쪽 1/3 이 밝다 */}
        <Grad id={id('cyl')} stops={['#1f4a2c', '#4f8f5e', '#6aa775', '#3a7349', '#183a22']} x2={1} y2={0} />
      </defs>
      <Pot kind="white">
        {STALKS.map(([x, top, tilt, w]) => {
          const h = BASE - top
          const r = w / 2
          return (
            <g key={x} transform={`rotate(${tilt} ${x} ${BASE})`}>
              <path
                d={`M${x - r} ${BASE} V${top + w} Q${x - r} ${top + 2} ${x} ${top - 3} Q${x + r} ${top + 2} ${x + r} ${top + w} V${BASE} Z`}
                fill={url(id('cyl'))}
              />
              {/* 은은한 가로 줄무늬 */}
              {Array.from({ length: Math.floor(h / 9) }, (_, i) => (
                <path
                  key={i}
                  d={`M${x - r + 0.6} ${top + 14 + i * 9} Q${x} ${top + 17 + i * 9} ${x + r - 0.6} ${top + 14 + i * 9}`}
                  stroke="#a7cfa0"
                  strokeOpacity={i % 2 ? 0.25 : 0.45}
                  strokeWidth="1.6"
                  fill="none"
                />
              ))}
              {/* 세로 홈 */}
              <path
                d={`M${x + r * 0.35} ${top + 8} V${BASE}`}
                stroke="#14321d"
                strokeOpacity="0.25"
                strokeWidth="0.8"
              />
              <path d={`M${x - r * 0.45} ${top + 10} V${BASE}`} stroke="#fff" strokeOpacity="0.18" strokeWidth="1.4" />
              {/* 마른 잎 끝 */}
              <path d={`M${x - 1.6} ${top} L${x} ${top - 3} L${x + 1.6} ${top}`} fill="#b59b6a" />
            </g>
          )
        })}
      </Pot>
    </Svg>
  )
}
