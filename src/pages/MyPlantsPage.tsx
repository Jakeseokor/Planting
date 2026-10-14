import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AddPlantDialog from '../components/AddPlantDialog'
import PlantIllustration from '../components/PlantIllustration'
import { getPlant } from '../data/plants'
import type { Plant } from '../data/types'
import { diffDays, formatDate, relativeDay, todayStr } from '../lib/date'
import { useMyPlants } from '../lib/myPlantsContext'
import { daysUntilWater, isWarmSeason, waterInterval, type MyPlant } from '../lib/watering'

interface Row {
  mp: MyPlant
  plant: Plant
  left: number
}

export default function MyPlantsPage() {
  const { list, loaded, water, restore } = useMyPlants()
  const [adding, setAdding] = useState(false)
  const [undo, setUndo] = useState<{ prev: MyPlant; name: string } | null>(null)
  const today = todayStr()

  useEffect(() => {
    if (!undo) return
    const t = setTimeout(() => setUndo(null), 5000)
    return () => clearTimeout(t)
  }, [undo])

  const rows: Row[] = list
    .flatMap((mp) => {
      const plant = getPlant(mp.plantId)
      return plant ? [{ mp, plant, left: daysUntilWater(mp, plant, today) }] : []
    })
    .sort((a, b) => a.left - b.left)
  const due = rows.filter((r) => r.left <= 0)

  const doWater = (r: Row) => {
    setUndo({ prev: r.mp, name: r.mp.nickname || r.plant.name })
    water(r.mp.id)
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-4 flex items-center">
        <h1 className="text-3xl font-extrabold">🪴 내 화초</h1>
        {rows.length > 0 && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="ml-auto min-h-11 rounded-full bg-brand px-5 font-bold text-surface"
          >
            + 등록
          </button>
        )}
      </div>

      {loaded && rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface-2 p-8 text-center">
          <span className="text-6xl" aria-hidden>
            🪴
          </span>
          <p className="text-lg">
            키우는 화초를 등록하면
            <br />물 줄 날을 알려 드려요.
          </p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="min-h-13 rounded-2xl bg-brand px-8 text-lg font-bold text-surface"
          >
            + 첫 화초 등록하기
          </button>
        </div>
      )}

      {rows.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-xl font-bold">
            💧 오늘 물 줄 화초 {due.length > 0 && <span className="text-sky-600 dark:text-sky-300">{due.length}</span>}
          </h2>
          {due.length ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {due.map((r) => (
                <li
                  key={r.mp.id}
                  className="flex items-center gap-3 rounded-2xl border-2 border-sky-300 bg-sky-50 p-3 dark:border-sky-700 dark:bg-sky-950"
                >
                  <PlantIllustration id={r.plant.id} name={r.plant.name} className="size-16 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">{r.mp.nickname || r.plant.name}</div>
                    <div className="text-sm text-muted">{r.left < 0 ? `${-r.left}일 지났어요` : '오늘이에요'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => doWater(r)}
                    className="min-h-12 shrink-0 rounded-xl bg-sky-600 px-4 font-bold text-white"
                  >
                    💧 물 줬어요
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-brand-soft p-4 font-semibold text-brand">오늘은 물 줄 화초가 없어요 👍</p>
          )}
        </section>
      )}

      {rows.length > 0 && (
        <section>
          <h2 className="mb-2 text-xl font-bold">모든 내 화초 ({rows.length})</h2>
          <ul className="flex flex-col gap-3">
            {rows.map((r) => (
              <MyPlantRow key={r.mp.id} row={r} today={today} onWater={() => doWater(r)} />
            ))}
          </ul>
          <p className="mt-4 rounded-2xl bg-surface-2 p-4 text-muted">
            📅 지금은 <b>{isWarmSeason(today) ? '봄·여름' : '가을·겨울'}</b> 기준 간격으로 계산해요.
            <br />
            👆 물 주기 전 손가락으로 흙 2~3cm를 눌러 보세요. 젖어 있으면 하루 이틀 미뤄요.
          </p>
        </section>
      )}

      {undo && (
        <div className="fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-20 flex justify-center px-4">
          <div role="status" className="flex items-center gap-3 rounded-2xl bg-ink px-5 py-2 text-bg shadow-lg">
            💧 {undo.name}에 물을 줬어요
            <button
              type="button"
              onClick={() => {
                restore(undo.prev)
                setUndo(null)
              }}
              className="min-h-11 px-2 font-bold text-brand-soft underline"
            >
              되돌리기
            </button>
          </div>
        </div>
      )}

      {adding && <AddPlantDialog onClose={() => setAdding(false)} />}
    </div>
  )
}

function MyPlantRow({ row: { mp, plant, left }, today, onWater }: { row: Row; today: string; onWater: () => void }) {
  const { setLastWatered, rename, remove } = useMyPlants()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const interval = waterInterval(plant, today)
  const since = diffDays(mp.lastWatered, today)
  const pct = Math.min(100, Math.max(0, (since / interval) * 100))
  const name = mp.nickname || plant.name

  return (
    <li className="rounded-2xl border border-line bg-surface p-3">
      <div className="flex items-center gap-3">
        <Link to={`/plant/${plant.id}`} className="shrink-0" aria-label={`${plant.name} 키우는 법 보기`}>
          <PlantIllustration id={plant.id} name={plant.name} className="size-16" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">
            {name}
            {mp.nickname && <span className="ml-1.5 text-sm font-normal text-muted">{plant.name}</span>}
          </div>
          <div className="text-sm text-muted">
            마지막 물 {relativeDay(-since)} ({formatDate(mp.lastWatered)}) · {interval}일마다
          </div>
          {/* 물 준 뒤 지난 날 / 간격 */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full ${left <= 0 ? 'bg-sky-500' : 'bg-brand'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className={`shrink-0 text-sm font-bold ${left <= 0 ? 'text-sky-600 dark:text-sky-300' : 'text-brand'}`}
            >
              {left <= 0 ? '물 줄 날' : `${relativeDay(left)} 물`}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="더보기"
          className="grid size-11 shrink-0 place-items-center rounded-full text-2xl text-muted active:bg-surface-2"
        >
          ⋯
        </button>
      </div>

      {open && (
        <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
          <button type="button" onClick={onWater} className="min-h-11 rounded-xl bg-sky-600 font-bold text-white">
            💧 오늘 물 줬어요
          </button>
          <label className="flex items-center gap-3">
            <span className="w-28 shrink-0 font-semibold">마지막 물 준 날</span>
            <input
              type="date"
              value={mp.lastWatered}
              max={today}
              onChange={(e) => e.target.value && setLastWatered(mp.id, e.target.value)}
              className="min-h-11 flex-1 rounded-xl border border-line bg-bg px-3"
            />
          </label>
          <label className="flex items-center gap-3">
            <span className="w-28 shrink-0 font-semibold">이름</span>
            <input
              defaultValue={mp.nickname}
              placeholder={plant.name}
              maxLength={20}
              onBlur={(e) => rename(mp.id, e.target.value)}
              className="min-h-11 flex-1 rounded-xl border border-line bg-bg px-3"
            />
          </label>
          {mp.history.length > 1 && (
            <p className="text-sm text-muted">최근 물 준 날: {mp.history.slice(0, 5).map(formatDate).join(', ')}</p>
          )}
          {/* 브라우저 확인 창 대신 화면 안에서 한 번 더 묻는다 */}
          {confirming ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-warn-soft p-3">
              <span className="font-semibold text-warn">'{name}'을(를) 지울까요?</span>
              <button
                type="button"
                onClick={() => remove(mp.id)}
                className="min-h-11 rounded-xl bg-warn px-4 font-bold text-surface"
              >
                지우기
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="min-h-11 px-3 font-semibold text-muted"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="min-h-11 self-start px-2 font-semibold text-warn"
            >
              🗑 내 화초에서 지우기
            </button>
          )}
        </div>
      )}
    </li>
  )
}
