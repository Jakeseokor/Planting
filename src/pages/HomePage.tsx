import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Chip from '../components/Chip'
import PlantCard from '../components/PlantCard'
import { plants } from '../data/plants'
import { DIFFICULTY_LABEL, LIGHT_LABEL, isPetSafe, type Difficulty, type LightLevel } from '../data/types'
import { matchesQuery } from '../lib/search'
import { useDueCount } from '../lib/useDueCount'

const DIFFICULTIES: Difficulty[] = [1, 2, 3]
const LIGHTS: LightLevel[] = ['bright', 'partial', 'shade']

export default function HomePage() {
  // 검색어·필터를 주소에 담아 상세 화면에서 돌아와도 유지된다
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  // 입력창은 즉시 반영되는 로컬 상태로 둔다(주소 갱신은 비동기라 한글 조합 입력이 끊길 수 있음)
  const [text, setText] = useState(q)
  const difficulty = Number(params.get('d')) as Difficulty | 0
  const light = params.get('l') as LightLevel | null
  const petOnly = params.get('pet') === '1'
  const due = useDueCount()

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  // 같은 칩을 다시 누르면 해제
  const toggle = (key: string, value: string) => setParam(key, params.get(key) === value ? null : value)

  const result = plants.filter(
    (p) =>
      matchesQuery(p, q) &&
      (!difficulty || p.difficulty === difficulty) &&
      (!light || p.lightLevels.includes(light)) &&
      (!petOnly || isPetSafe(p)),
  )
  const filtered = q || difficulty || light || petOnly

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <h1 className="mb-3 text-3xl font-extrabold">🌿 화초 도감</h1>

      {due > 0 && (
        <Link
          to="/my"
          className="mb-4 flex min-h-14 items-center gap-3 rounded-2xl bg-sky-100 px-4 font-bold text-sky-900 dark:bg-sky-950 dark:text-sky-100"
        >
          <span className="text-2xl" aria-hidden>
            💧
          </span>
          오늘 물 줄 화초가 {due}개 있어요
          <span className="ml-auto">›</span>
        </Link>
      )}

      <label className="relative mb-3 block">
        <span className="sr-only">화초 이름 검색</span>
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl" aria-hidden>
          🔍
        </span>
        <input
          type="search"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setParam('q', e.target.value)
          }}
          placeholder="화초 이름으로 찾기 (예: 몬스테라)"
          className="min-h-13 w-full rounded-2xl border border-line bg-surface py-3 pr-4 pl-13 text-lg outline-none placeholder:text-muted focus:border-brand"
        />
      </label>

      <div className="mb-5 flex flex-col gap-2">
        <FilterRow label="난이도">
          {DIFFICULTIES.map((d) => (
            <Chip key={d} active={difficulty === d} onClick={() => toggle('d', String(d))}>
              {DIFFICULTY_LABEL[d]}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="빛">
          {LIGHTS.map((l) => (
            <Chip key={l} active={light === l} onClick={() => toggle('l', l)}>
              {LIGHT_LABEL[l]}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="반려동물">
          <Chip active={petOnly} onClick={() => toggle('pet', '1')}>
            🐾 고양이·개에게 안전
          </Chip>
        </FilterRow>
      </div>

      {filtered && (
        <div className="mb-3 flex items-center gap-3">
          <span className="text-muted">{result.length}개 찾았어요</span>
          <button
            type="button"
            onClick={() => {
              setText('')
              setParams({}, { replace: true })
            }}
            className="min-h-11 px-2 font-semibold text-brand"
          >
            모두 지우기
          </button>
        </div>
      )}

      {result.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {result.map((p) => (
            <PlantCard key={p.id} plant={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface-2 p-8 text-center text-lg text-muted">
          조건에 맞는 화초가 없어요. 필터를 줄여 보세요.
        </p>
      )}
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="w-18 shrink-0 font-bold text-muted">{label}</span>
      {children}
    </div>
  )
}
