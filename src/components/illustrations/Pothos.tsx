import { Pot, type IllustrationProps } from './Pot'

const C = { dark: '#2f7a46', yellow: '#e6d36a', pot: '#6f8fa8', soil: '#5a3b2a' }

// 꼭지가 (0,0), 아래(+y)로 향하는 하트 잎
const HEART = 'M0 0 C-4 -6 -16 -6 -16 6 C-16 16 -6 22 0 28 C6 22 16 16 16 6 C16 -6 4 -6 0 0 Z'

function Heart({ x, y, r, s = 1 }: { x: number; y: number; r: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d={HEART} fill={C.dark} />
      {/* 노란 무늬 */}
      <path d="M2 4 C8 8 6 16 2 20" stroke={C.yellow} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  )
}

const LEFT_VINE = 'M70 138 C52 140 46 156 50 176'
const RIGHT_VINE = 'M130 138 C150 142 156 160 152 180'

export default function Pothos({ className, title = '스킨답서스' }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
      {/* 화분 위 잎 무더기 */}
      <Heart x={100} y={92} r={180} s={1.3} />
      <Heart x={78} y={104} r={140} s={1.2} />
      <Heart x={122} y={104} r={-140} s={1.2} />
      <Heart x={88} y={124} r={110} s={1.05} />
      <Heart x={114} y={124} r={-110} s={1.05} />
      <Pot color={C.pot} rim="#86a6bf" soil={C.soil} />
      {/* 화분 밖으로 늘어지는 덩굴 (화분 앞) */}
      <g stroke={C.dark} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d={LEFT_VINE} />
        <path d={RIGHT_VINE} />
      </g>
      <Heart x={54} y={146} r={60} s={0.75} />
      <Heart x={48} y={162} r={70} s={0.7} />
      <Heart x={50} y={175} r={15} s={0.6} />
      <Heart x={148} y={150} r={-60} s={0.75} />
      <Heart x={154} y={166} r={-70} s={0.7} />
      <Heart x={152} y={179} r={-15} s={0.55} />
    </svg>
  )
}
