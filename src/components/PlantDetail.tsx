import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CareInfo, Plant } from '../data/types'
import { useCanAddPlants } from '../lib/claudeHost'
import { useMyPlants } from '../lib/myPlantsContext'
import { lookName } from '../lib/plantGenerator'
import { plants } from '../data/plants'
import { publishCustomPlants, publishErrorText } from '../lib/publishPlants'
import AddPlantDialog from './AddPlantDialog'
import { LIGHT_LABEL } from '../data/types'
import DifficultyStars from './DifficultyStars'
import PetBadge from './PetBadge'
import PlantIllustration from './PlantIllustration'

const CARE_CARDS: { key: keyof CareInfo; icon: string; label: string }[] = [
  { key: 'light', icon: '☀️', label: '빛' },
  { key: 'water', icon: '💧', label: '물주기' },
  { key: 'temperature', icon: '🌡️', label: '적정 온도' },
  { key: 'humidity', icon: '💨', label: '습도' },
  { key: 'soil', icon: '🪴', label: '흙·분갈이' },
  { key: 'fertilizer', icon: '🌱', label: '비료' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 text-lg font-bold">{children}</h2>
}

/** 모든 화초가 같은 형식으로 보이는 상세 화면 */
/** preview: 아직 도감에 추가하기 전 미리보기(내 화초 등록 버튼 숨김) */
export default function PlantDetail({ plant, preview = false }: { plant: Plant; preview?: boolean }) {
  return (
    <>
      <article className="@container mx-auto flex max-w-4xl flex-col gap-4 p-4 @md:p-6">
        {/* 상단: 일러스트 + 이름 + 난이도 + 한 줄 소개 */}
        <header className="flex items-center gap-5">
          <div className="shrink-0 rounded-3xl bg-surface-2 p-2">
            <PlantIllustration
              id={plant.id}
              name={plant.name}
              look={plant.illustration}
              className="size-28 @lg:size-36"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-3xl font-extrabold leading-tight">{plant.name}</h1>
            <p className="text-muted italic">{plant.scientificName}</p>
            <DifficultyStars level={plant.difficulty} />
            <p className="text-lg">{plant.summary}</p>
            <div className="flex flex-wrap gap-2">
              <PetBadge plant={plant} />
              {plant.lightLevels.map((l) => (
                <span key={l} className="rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold text-muted">
                  {LIGHT_LABEL[l]}
                </span>
              ))}
            </div>
            {!preview && <MyPlantButton plant={plant} />}
          </div>
        </header>

        {plant.custom && <CustomPlantNote plant={plant} preview={preview} />}

        {/* 핵심 정보 6칸 */}
        <section aria-label="핵심 정보" className="grid grid-cols-2 gap-3 @xl:grid-cols-3">
          {CARE_CARDS.map((c) => (
            <div key={c.key} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3">
              <span className="text-3xl leading-none" aria-hidden>
                {c.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-brand">{c.label}</div>
                <div className="leading-snug">{plant.care[c.key]}</div>
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-4 @xl:grid-cols-2">
          {/* 재배 방법 */}
          <section>
            <SectionTitle>🌿 이렇게 키워요</SectionTitle>
            <ol className="flex flex-col gap-2">
              {plant.steps.map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-base font-bold text-surface">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 leading-snug">{s}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 주의사항 */}
          <section className="self-start rounded-2xl border-2 border-warn bg-warn-soft p-4">
            <SectionTitle>
              <span className="text-warn">⚠️ 주의하세요</span>
            </SectionTitle>
            <ul className="flex flex-col gap-2">
              {plant.cautions.slice(0, 3).map((c) => (
                <li key={c.title} className="leading-snug">
                  <b className="text-warn">{c.title}</b> · {c.text}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 계절별 관리 */}
        <section>
          <SectionTitle>📅 계절별 관리</SectionTitle>
          <table className="w-full table-fixed overflow-hidden rounded-2xl border border-line text-left">
            <thead className="bg-surface-2">
              <tr>
                <th className="p-3">🌸 봄·여름</th>
                <th className="border-l border-line p-3">🍂 가을·겨울</th>
              </tr>
            </thead>
            <tbody className="bg-surface align-top">
              <tr>
                {[plant.seasons.warm, plant.seasons.cold].map((tips, i) => (
                  <td key={i} className={`p-3 ${i ? 'border-l border-line' : ''}`}>
                    <ul className="flex flex-col gap-1">
                      {tips.map((t) => (
                        <li key={t}>• {t}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
      </article>
    </>
  )
}

function MyPlantButton({ plant }: { plant: Plant }) {
  const { list } = useMyPlants()
  const [adding, setAdding] = useState(false)
  const count = list.filter((m) => m.plantId === plant.id).length
  return (
    <div className="mt-1 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="min-h-11 rounded-full bg-brand px-5 font-bold text-surface"
      >
        🪴 내 화초에 등록
      </button>
      {count > 0 && (
        <Link to="/my" className="min-h-11 content-center font-semibold text-brand">
          ✓ {count}개 키우는 중 ›
        </Link>
      )}
      {adding && <AddPlantDialog presetId={plant.id} onClose={() => setAdding(false)} />}
    </div>
  )
}

/** 사용자가 추가한 화초: 정보 출처와 그림 대체를 밝히고, 편집 권한이 있으면 도감에서 뺄 수 있다. */
function CustomPlantNote({ plant, preview }: { plant: Plant; preview: boolean }) {
  const canEdit = useCanAddPlants()
  const [confirming, setConfirming] = useState(false)
  const [state, setState] = useState<'idle' | 'saving' | string>('idle')
  const look = lookName(plant.illustration)

  const removePlant = async () => {
    setState('saving')
    try {
      await publishCustomPlants(plants.filter((p) => p.custom && p.id !== plant.id))
    } catch (e) {
      setState(publishErrorText((e as { code?: string }).code))
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface-2 p-4">
      <p>
        🤖 <b>AI가 정리한 정보예요.</b> 키우면서 화초 상태를 보고 조절해 주세요.
        {look && ` 그림은 모양이 비슷한 ${look} 그림으로 대신했어요.`}
      </p>
      {!preview && canEdit && (
        <div className="flex flex-wrap items-center gap-2">
          {confirming ? (
            <>
              <span className="font-semibold text-warn">'{plant.name}'을(를) 도감에서 뺄까요?</span>
              <button
                type="button"
                onClick={removePlant}
                disabled={state === 'saving'}
                className="min-h-11 rounded-xl bg-warn px-4 font-bold text-surface disabled:opacity-60"
              >
                {state === 'saving' ? '빼는 중…' : '빼기'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="min-h-11 px-3 font-semibold text-muted"
              >
                취소
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="min-h-11 px-1 font-semibold text-warn">
              도감에서 빼기
            </button>
          )}
          {state !== 'idle' && state !== 'saving' && <span className="text-warn">{state}</span>}
        </div>
      )}
    </div>
  )
}
