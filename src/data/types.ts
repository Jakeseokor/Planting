/** 1 = 쉬움, 2 = 보통, 3 = 어려움 */
export type Difficulty = 1 | 2 | 3

/** 필터용 빛 조건. 화초 하나가 여러 조건을 견딜 수 있다. */
export type LightLevel = 'bright' | 'partial' | 'shade'

export type CautionKind = 'overwater' | 'sun' | 'pet' | 'cold' | 'other'

export interface Caution {
  kind: CautionKind
  title: string
  text: string
}

/** 상세 화면 6개 아이콘 카드. 모두 한 줄(30자 내외). */
export interface CareInfo {
  light: string
  water: string
  temperature: string
  humidity: string
  soil: string
  fertilizer: string
}

export interface Plant {
  id: string
  name: string
  scientificName: string
  difficulty: Difficulty
  summary: string
  lightLevels: LightLevel[]
  /** 고양이·개 독성 여부 */
  toxicity: { cat: boolean; dog: boolean; note: string }
  care: CareInfo
  /** 내 화초 물주기 알림 기준(일). warm = 봄·여름, cold = 가을·겨울 */
  waterIntervalDays: { warm: number; cold: number }
  /** 3~5단계, 각 한 문장 */
  steps: string[]
  /** 최대 3개 */
  cautions: Caution[]
  seasons: { warm: string[]; cold: string[] }
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: '쉬움', 2: '보통', 3: '어려움' }

export const LIGHT_LABEL: Record<LightLevel, string> = {
  bright: '밝은 곳',
  partial: '반그늘',
  shade: '그늘',
}

export const isPetSafe = (p: Plant) => !p.toxicity.cat && !p.toxicity.dog
