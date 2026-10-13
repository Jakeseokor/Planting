import { NavLink } from 'react-router-dom'
import { plants } from '../data/plants'
import DifficultyStars from './DifficultyStars'
import PlantIllustration from './PlantIllustration'

/** Split View 왼쪽 목록 */
export default function PlantList() {
  return (
    <ul className="flex flex-col gap-1 p-3">
      {plants.map((p) => (
        <li key={p.id}>
          <NavLink
            to={`/plant/${p.id}`}
            replace
            className={({ isActive }) =>
              `flex min-h-[64px] items-center gap-3 rounded-2xl px-3 py-2 ${
                isActive ? 'bg-brand-soft' : 'active:bg-surface-2'
              }`
            }
          >
            <PlantIllustration id={p.id} name={p.name} className="size-12 shrink-0" />
            <span className="flex flex-col">
              <span className="font-bold">{p.name}</span>
              <span className="text-sm">
                <DifficultyStars level={p.difficulty} />
              </span>
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
