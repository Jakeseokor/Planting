import type { Plant } from './types'

/** 페이지에 들어 있는 사용자 추가 화초 데이터 블록 */
export const CUSTOM_PLANTS_ELEMENT_ID = 'custom-plants'

export function loadCustomPlants(): Plant[] {
  try {
    const text = document.getElementById(CUSTOM_PLANTS_ELEMENT_ID)?.textContent
    const list = text ? JSON.parse(text) : []
    return Array.isArray(list) ? list.map((p: Plant) => ({ ...p, custom: true })) : []
  } catch {
    return []
  }
}
