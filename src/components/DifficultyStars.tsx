import { DIFFICULTY_LABEL, type Difficulty } from '../data/types'

// 별이 많을수록 쉬움: 쉬움 ★★★, 보통 ★★☆, 어려움 ★☆☆
export default function DifficultyStars({ level, showLabel = true }: { level: Difficulty; showLabel?: boolean }) {
  const filled = 4 - level
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`난이도 ${DIFFICULTY_LABEL[level]}`}>
      <span className="text-amber-500 tracking-tight" aria-hidden>
        {'★'.repeat(filled)}
        <span className="text-line">{'★'.repeat(3 - filled)}</span>
      </span>
      {showLabel && <span className="text-muted">{DIFFICULTY_LABEL[level]}</span>}
    </span>
  )
}
