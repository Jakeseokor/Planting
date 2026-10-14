import { Link } from 'react-router-dom'
import type { Plant } from '../data/types'
import DifficultyStars from './DifficultyStars'
import PlantIllustration from './PlantIllustration'

export default function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Link
      to={`/plant/${plant.id}`}
      className="flex flex-col rounded-3xl border border-line bg-surface p-4 shadow-sm transition active:scale-[0.98]"
    >
      <div className="rounded-2xl bg-surface-2">
        <PlantIllustration id={plant.id} name={plant.name} className="mx-auto aspect-square w-full max-w-48" />
      </div>
      <h2 className="mt-3 text-xl font-bold">{plant.name}</h2>
      {plant.custom && <span className="text-sm font-semibold text-brand">🌱 새로 추가</span>}
      <DifficultyStars level={plant.difficulty} />
    </Link>
  )
}
