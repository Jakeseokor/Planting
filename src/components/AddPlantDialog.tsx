import { useEffect, useState } from 'react'
import { plants, getPlant } from '../data/plants'
import { addDays, todayStr } from '../lib/date'
import { useMyPlants } from '../lib/myPlantsContext'
import PlantIllustration from './PlantIllustration'

const QUICK_DAYS = [
  { label: '오늘', days: 0 },
  { label: '어제', days: -1 },
  { label: '3일 전', days: -3 },
  { label: '1주 전', days: -7 },
]

/** 내 화초 등록 창. presetId 가 있으면 화초 고르기를 건너뛴다. */
export default function AddPlantDialog({
  presetId,
  onClose,
}: {
  presetId?: string
  onClose: (added: boolean) => void
}) {
  const { add } = useMyPlants()
  const today = todayStr()
  const [plantId, setPlantId] = useState(presetId ?? '')
  const [nickname, setNickname] = useState('')
  const [lastWatered, setLastWatered] = useState(today)
  const plant = getPlant(plantId)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const save = () => {
    if (!plant) return
    add(plant.id, nickname, lastWatered)
    onClose(true)
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={() => onClose(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="내 화초 등록"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-bg sm:rounded-3xl"
      >
        <header className="flex items-center border-b border-line px-5 py-3">
          <h2 className="text-xl font-bold">🪴 내 화초 등록</h2>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="ml-auto min-h-11 px-3 font-semibold text-muted"
          >
            닫기
          </button>
        </header>

        <div className="flex flex-col gap-5 overflow-y-auto p-5">
          {!presetId && (
            <section>
              <h3 className="mb-2 font-bold">1. 어떤 화초인가요?</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {plants.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={plantId === p.id}
                    onClick={() => setPlantId(p.id)}
                    className={`flex flex-col items-center rounded-2xl border-2 p-1.5 text-sm font-semibold ${
                      plantId === p.id ? 'border-brand bg-brand-soft' : 'border-transparent bg-surface'
                    }`}
                  >
                    <PlantIllustration id={p.id} name={p.name} className="size-16" />
                    {p.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {plant && (
            <>
              {presetId && (
                <div className="flex items-center gap-3">
                  <PlantIllustration id={plant.id} name={plant.name} className="size-16" />
                  <span className="text-xl font-bold">{plant.name}</span>
                </div>
              )}
              <section>
                <h3 className="mb-2 font-bold">{presetId ? '1' : '2'}. 이름 붙이기 (선택)</h3>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={`예: 거실 ${plant.name}`}
                  maxLength={20}
                  className="min-h-12 w-full rounded-2xl border border-line bg-surface px-4 text-lg outline-none focus:border-brand"
                />
              </section>
              <section>
                <h3 className="mb-2 font-bold">{presetId ? '2' : '3'}. 마지막으로 물 준 날</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_DAYS.map((q) => {
                    const d = addDays(today, q.days)
                    return (
                      <button
                        key={q.label}
                        type="button"
                        aria-pressed={lastWatered === d}
                        onClick={() => setLastWatered(d)}
                        className={`min-h-11 rounded-full border px-4 font-semibold ${
                          lastWatered === d ? 'border-brand bg-brand text-surface' : 'border-line bg-surface'
                        }`}
                      >
                        {q.label}
                      </button>
                    )
                  })}
                  <input
                    type="date"
                    value={lastWatered}
                    max={today}
                    onChange={(e) => e.target.value && setLastWatered(e.target.value)}
                    aria-label="날짜 직접 고르기"
                    className="min-h-11 rounded-full border border-line bg-surface px-3"
                  />
                </div>
              </section>
            </>
          )}
        </div>

        <footer className="border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={!plant}
            onClick={save}
            className="min-h-13 w-full rounded-2xl bg-brand text-lg font-bold text-surface disabled:opacity-40"
          >
            등록하기
          </button>
        </footer>
      </div>
    </div>
  )
}
