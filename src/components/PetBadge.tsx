import type { Plant } from '../data/types'

export default function PetBadge({ plant, compact = false }: { plant: Plant; compact?: boolean }) {
  const { cat, dog } = plant.toxicity
  if (!cat && !dog) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand">
        🐾 반려동물 안전
      </span>
    )
  }
  const who = [cat && '고양이', dog && '개'].filter(Boolean).join('·')
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-3 py-1 text-sm font-semibold text-warn">
      🐾 {compact ? '반려동물 주의' : `${who}에게 독성`}
    </span>
  )
}
