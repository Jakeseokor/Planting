import { createContext, useContext } from 'react'
import type { DateStr } from './date'
import type { MyPlant } from './watering'

export interface MyPlantsApi {
  list: MyPlant[]
  loaded: boolean
  add: (plantId: string, nickname: string, lastWatered: DateStr) => void
  water: (id: string, date?: DateStr) => void
  setLastWatered: (id: string, date: DateStr) => void
  rename: (id: string, nickname: string) => void
  remove: (id: string) => void
  /** 되돌리기용: 이전 상태로 통째로 교체 */
  restore: (mp: MyPlant) => void
}

export const MyPlantsContext = createContext<MyPlantsApi | null>(null)

export function useMyPlants() {
  const ctx = useContext(MyPlantsContext)
  if (!ctx) throw new Error('MyPlantsProvider 가 필요합니다')
  return ctx
}
