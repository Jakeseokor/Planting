import { getPlant } from '../data/plants'
import { todayStr } from './date'
import { useMyPlants } from './myPlantsContext'
import { daysUntilWater } from './watering'

/** 오늘 물 줄 화초 수 */
export function useDueCount() {
  const { list } = useMyPlants()
  const today = todayStr()
  return list.filter((mp) => {
    const plant = getPlant(mp.plantId)
    return plant && daysUntilWater(mp, plant, today) <= 0
  }).length
}
