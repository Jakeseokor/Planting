import type { CareInfo, Plant } from '../data/types'
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
export default function PlantDetail({ plant }: { plant: Plant }) {
  return (
    <article className="@container mx-auto flex max-w-4xl flex-col gap-4 p-4 @md:p-6">
      {/* 상단: 일러스트 + 이름 + 난이도 + 한 줄 소개 */}
      <header className="flex items-center gap-5">
        <div className="shrink-0 rounded-3xl bg-surface-2 p-2">
          <PlantIllustration id={plant.id} name={plant.name} className="size-28 @lg:size-36" />
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
        </div>
      </header>

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
              <li key={c.kind} className="leading-snug">
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
  )
}
