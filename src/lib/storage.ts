import { get, set } from 'idb-keyval'
import type { MyPlant } from './watering'

const KEY = 'myPlants'

function readLocal(): MyPlant[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

/** IndexedDB 우선, 막혀 있으면(사파리 개인 정보 보호 모드 등) localStorage 사용 */
export async function loadMyPlants(): Promise<MyPlant[]> {
  try {
    return (await get<MyPlant[]>(KEY)) ?? readLocal()
  } catch {
    return readLocal()
  }
}

export async function saveMyPlants(list: MyPlant[]) {
  try {
    await set(KEY, list)
  } catch {
    try {
      localStorage.setItem(KEY, JSON.stringify(list))
    } catch {
      /* 저장 불가 환경: 이번 실행 동안만 유지 */
    }
  }
}

/** 브라우저가 저장 공간을 임의로 비우지 않도록 요청 */
export function requestPersistentStorage() {
  try {
    navigator.storage?.persist?.().catch(() => {})
  } catch {
    /* 지원하지 않는 환경 */
  }
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
