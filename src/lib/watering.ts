import type { Plant } from '../data/types'
import { addDays, diffDays, type DateStr } from './date'

export interface MyPlant {
  id: string
  plantId: string
  nickname: string
  addedAt: DateStr
  lastWatered: DateStr
  /** 최근 물 준 날(최신순, 최대 10개) */
  history: DateStr[]
}

/** 3~8월 = 봄·여름, 9~2월 = 가을·겨울 */
export const isWarmSeason = (today: DateStr) => {
  const m = Number(today.split('-')[1])
  return m >= 3 && m <= 8
}

export function waterInterval(plant: Plant, today: DateStr) {
  return isWarmSeason(today) ? plant.waterIntervalDays.warm : plant.waterIntervalDays.cold
}

/** 다음 물 줄 날까지 남은 일수. 0 이하면 오늘 물 줄 화초. */
export function daysUntilWater(mp: MyPlant, plant: Plant, today: DateStr) {
  return diffDays(today, addDays(mp.lastWatered, waterInterval(plant, today)))
}
