import { Link, useParams } from 'react-router-dom'
import PlantDetail from '../components/PlantDetail'
import PlantList from '../components/PlantList'
import { getPlant } from '../data/plants'

export default function PlantPage() {
  const plant = getPlant(useParams().id)
  return (
    <div className="split:flex split:h-[calc(100dvh-76px-env(safe-area-inset-bottom))]">
      {/* 가로 모드: 왼쪽 목록 */}
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-line bg-surface split:block">
        <PlantList />
      </aside>
      <div className="min-w-0 flex-1 split:overflow-y-auto">
        {/* 세로 모드: 뒤로 가기 */}
        <Link
          to="/"
          className="mx-2 mt-2 inline-flex min-h-11 items-center px-2 font-semibold text-brand split:hidden"
        >
          ‹ 화초 도감
        </Link>
        {plant ? (
          <PlantDetail key={plant.id} plant={plant} />
        ) : (
          <p className="p-6 text-muted">화초를 찾을 수 없어요.</p>
        )}
      </div>
    </div>
  )
}
