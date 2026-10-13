import { useParams } from 'react-router-dom'
import PlantDetail from '../components/PlantDetail'
import PlantList from '../components/PlantList'
import SplitLayout from '../components/SplitLayout'
import { getPlant } from '../data/plants'

export default function PlantPage() {
  const plant = getPlant(useParams().id)
  return (
    <SplitLayout list={<PlantList />} backTo="/" backLabel="화초 도감">
      {plant ? <PlantDetail key={plant.id} plant={plant} /> : <p className="p-6 text-muted">화초를 찾을 수 없어요.</p>}
    </SplitLayout>
  )
}
