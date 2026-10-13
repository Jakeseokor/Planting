import PlantCard from '../components/PlantCard'
import { plants } from '../data/plants'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <h1 className="mb-4 text-3xl font-extrabold">🌿 화초 도감</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {plants.map((p) => (
          <PlantCard key={p.id} plant={p} />
        ))}
      </div>
    </div>
  )
}
