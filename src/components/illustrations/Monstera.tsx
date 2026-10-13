import { useId } from 'react'
import { Pot, type IllustrationProps } from './Pot'

const C = { dark: '#2f7a46', light: '#7cc68a', pot: '#d9825b', soil: '#5a3b2a' }

// 잎 밑동이 (0,0), 위쪽(-y)으로 자라는 하트 모양 잎
const LEAF = 'M0 0 C-14 -2 -40 -10 -42 -36 C-44 -62 -18 -76 0 -74 C18 -76 44 -62 42 -36 C40 -10 14 -2 0 0 Z'
// 가장자리에서 잎맥 쪽으로 파고드는 몬스테라 특유의 갈라짐
const SLITS = [
  'M-48 -20 L-12 -22', 'M-48 -40 L-12 -40', 'M-38 -60 L-10 -56',
  'M48 -20 L12 -22', 'M48 -40 L12 -40', 'M38 -60 L10 -56',
]

function Leaf({ maskId, fill, transform }: { maskId: string; fill: string; transform: string }) {
  return (
    <g transform={transform}>
      <path d={LEAF} fill={fill} mask={`url(#${maskId})`} />
      <path d="M0 -2 V-70" stroke={C.light} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

export default function Monstera({ className, title = '몬스테라' }: IllustrationProps) {
  const maskId = useId()
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-60" y="-90" width="120" height="100">
          <rect x="-60" y="-90" width="120" height="100" fill="#fff" />
          {SLITS.map((d) => (
            <path key={d} d={d} stroke="#000" strokeWidth="5" strokeLinecap="round" />
          ))}
          <ellipse cx="-24" cy="-30" rx="3" ry="5" fill="#000" />
          <ellipse cx="24" cy="-30" rx="3" ry="5" fill="#000" />
        </mask>
      </defs>
      {/* 줄기 */}
      <g stroke={C.dark} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M92 136 C88 112 76 100 64 92" />
        <path d="M100 136 C100 110 102 80 104 62" />
        <path d="M108 136 C112 114 124 104 136 96" />
      </g>
      <Leaf maskId={maskId} fill={C.dark} transform="translate(64 94) rotate(-50) scale(0.66)" />
      <Leaf maskId={maskId} fill={C.dark} transform="translate(136 98) rotate(50) scale(0.66)" />
      <Leaf maskId={maskId} fill={C.dark} transform="translate(104 66) rotate(4) scale(0.8)" />
      <Pot color={C.pot} rim="#e89a73" soil={C.soil} />
    </svg>
  )
}
