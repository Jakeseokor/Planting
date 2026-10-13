/** 모든 일러스트가 공유하는 화분. viewBox 0 0 200 200 기준, 식물 뒤가 아닌 앞에 그린다. */
export function Pot({ color, rim, soil }: { color: string; rim: string; soil: string }) {
  return (
    <g>
      <ellipse cx="100" cy="134" rx="40" ry="5" fill={soil} />
      <path d="M62 146 H138 L130 192 H70 Z" fill={color} />
      <rect x="56" y="134" width="88" height="14" rx="4" fill={rim} />
    </g>
  )
}

export interface IllustrationProps {
  className?: string
  title?: string
}
