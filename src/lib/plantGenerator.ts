import { builtInPlants } from '../data/plants'
import type { CautionKind, Difficulty, LightLevel, Plant } from '../data/types'
import { todayStr } from './date'

/** 그림을 빌려 쓸 수 있는 기본 화초와 모양 설명 */
const LOOKS: Record<string, string> = {
  monstera: '크고 갈라진 하트 잎',
  stucky: '원통 막대 잎',
  sansevieria: '칼처럼 곧게 선 잎',
  pothos: '늘어지는 하트 잎 덩굴',
  'rubber-tree': '나무 줄기에 크고 윤기 나는 타원 잎',
  'zz-plant': '줄기 양옆에 작은 타원 잎이 줄지어',
  spathiphyllum: '긴 잎 사이로 흰 꽃',
  'table-palm': '작은 깃털 모양 야자',
  'areca-palm': '크게 퍼지는 깃털 모양 야자',
  dracaena: '굵은 줄기 위로 긴 띠 잎',
  peperomia: '둥글고 도톰한 작은 잎',
  ivy: '갈라진 작은 잎 덩굴',
  philodendron: '지지대를 타는 뾰족한 하트 잎',
  calathea: '무늬 있는 넓은 타원 잎',
  succulent: '장미처럼 모인 통통한 잎',
}

const example = (({ id: _id, custom: _c, illustration: _i, addedAt: _a, aliases: _al, ...rest }) => rest)(
  builtInPlants[0],
)

function buildPrompt(name: string) {
  return `당신은 실내 화초 재배 전문가입니다. 초보자용 화초 가이드 앱에 "${name}" 정보를 추가합니다.

규칙:
- 모든 문장은 한국어, 전문 용어 없이, 한 문장 30자 안팎.
- 숫자는 구체적으로(예: "겉흙 2~3cm 마르면 듬뿍"). 불확실한 수치는 범위로.
- 일반적으로 통용되는 원예 기준만 쓰고, 모르는 것은 지어내지 마세요.
- toxicity: 고양이(cat)·개(dog) 독성 여부. 확실하지 않으면 true(주의)로 두고 note 에 "확인이 필요해요"라고 쓰세요.
- difficulty: 1=쉬움, 2=보통, 3=어려움.
- lightLevels: "bright"(밝은 곳), "partial"(반그늘), "shade"(그늘) 중 견딜 수 있는 것 모두.
- waterIntervalDays: 물주기 간격(일). warm=봄·여름, cold=가을·겨울.
- steps 3~5개, cautions 최대 3개(kind 는 overwater/sun/pet/cold/other), seasons.warm·cold 각 3개.
- illustration: 아래 중 잎 모양이 가장 비슷한 것의 키 하나.
${Object.entries(LOOKS)
  .map(([k, v]) => `  ${k}: ${v}`)
  .join('\n')}
- "${name}"이(가) 실내 화초가 아니거나 무엇인지 알 수 없으면 {"error": "이유 한 문장"} 만 답하세요.

아래 몬스테라 예시와 똑같은 JSON 구조로, JSON 하나만 답하세요(illustration 필드 추가).
${JSON.stringify({ ...example, illustration: 'monstera' })}`
}

const DIFFS: Difficulty[] = [1, 2, 3]
const LIGHTS: LightLevel[] = ['bright', 'partial', 'shade']
const KINDS: CautionKind[] = ['overwater', 'sun', 'pet', 'cold', 'other']

const str = (v: unknown, max = 60) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const strs = (v: unknown, min: number, max: number, what: string) => {
  const list = Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : []
  if (list.length < min) throw new Error(`${what} 정보가 부족해요`)
  return list.slice(0, max)
}
const days = (v: unknown, fallback: number) => {
  const n = Math.round(Number(v))
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 90) : fallback
}

/** AI 답을 앱 형식에 맞게 검사·정리한다. 필수 정보가 빠지면 이유와 함께 실패한다. */
export function normalizePlant(raw: unknown, requestedName: string): Plant {
  if (!raw || typeof raw !== 'object') throw new Error('답을 읽지 못했어요')
  const r = raw as Record<string, any>
  if (r.error) throw new Error(str(r.error, 120) || '실내 화초 정보를 찾지 못했어요')

  const care = r.care ?? {}
  const careInfo = {
    light: str(care.light),
    water: str(care.water),
    temperature: str(care.temperature),
    humidity: str(care.humidity),
    soil: str(care.soil),
    fertilizer: str(care.fertilizer),
  }
  if (Object.values(careInfo).some((v) => !v)) throw new Error('핵심 정보 6가지 중 빠진 것이 있어요')

  const name = str(r.name, 20) || requestedName.trim()
  const cautions = (Array.isArray(r.cautions) ? r.cautions : [])
    .map((c: any) => ({
      kind: KINDS.includes(c?.kind) ? c.kind : 'other',
      title: str(c?.title, 16),
      text: str(c?.text),
    }))
    .filter((c: { title: string; text: string }) => c.title && c.text)
    .slice(0, 3)
  const lightLevels = (Array.isArray(r.lightLevels) ? r.lightLevels : []).filter((l: LightLevel) =>
    LIGHTS.includes(l),
  ) as LightLevel[]
  const tox = r.toxicity ?? {}

  return {
    id: `custom-${Date.now().toString(36)}`,
    name,
    scientificName: str(r.scientificName, 60) || '학명 확인 필요',
    difficulty: DIFFS.includes(r.difficulty) ? r.difficulty : 2,
    summary: str(r.summary) || `${name} 키우기`,
    lightLevels: lightLevels.length ? [...new Set(lightLevels)] : ['partial'],
    // 독성 정보가 없으면 안전하다고 단정하지 않는다
    toxicity: {
      cat: tox.cat !== false,
      dog: tox.dog !== false,
      note: str(tox.note) || '확인이 필요해요',
    },
    care: careInfo,
    waterIntervalDays: { warm: days(r.waterIntervalDays?.warm, 7), cold: days(r.waterIntervalDays?.cold, 14) },
    steps: strs(r.steps, 3, 5, '재배 방법'),
    cautions,
    seasons: { warm: strs(r.seasons?.warm, 1, 3, '봄·여름 관리'), cold: strs(r.seasons?.cold, 1, 3, '가을·겨울 관리') },
    custom: true,
    illustration: r.illustration in LOOKS ? r.illustration : 'peperomia',
    addedAt: todayStr(),
  }
}

export const lookName = (id?: string) => builtInPlants.find((p) => p.id === id)?.name

export { buildPrompt }
