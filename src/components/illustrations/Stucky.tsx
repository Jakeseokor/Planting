import { Pot, type IllustrationProps } from './Pot'

const C = { dark: '#3d7a52', light: '#a9d8a8', pot: '#e9e2d0', soil: '#5a3b2a' }

// [x, 잎 끝 y, 기울기] — 원통형 잎이 부채꼴로 솟는다
const STALKS: [number, number, number][] = [
  [70, 72, -14], [85, 40, -6], [100, 22, 0], [115, 46, 7], [130, 76, 15],
]

export default function Stucky({ className, title = '스투키' }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
      {STALKS.map(([x, top, tilt]) => {
        const h = 140 - top
        return (
          <g key={`${x}-${top}`} transform={`rotate(${tilt} ${x} 140)`}>
            <rect x={x - 6} y={top} width="12" height={h} rx="6" fill={C.dark} />
            {/* 가로 줄무늬 */}
            {Array.from({ length: Math.floor(h / 16) }, (_, i) => (
              <path
                key={i}
                d={`M${x - 5} ${top + 14 + i * 16} q5 3 10 0`}
                stroke={C.light}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            ))}
            {/* 뾰족한 잎 끝 */}
            <circle cx={x} cy={top + 3} r="2" fill={C.light} />
          </g>
        )
      })}
      <Pot color={C.pot} rim="#f6f1e4" soil={C.soil} />
    </svg>
  )
}
