import { useEffect, useRef, useState } from 'react'
import { plants } from '../data/plants'
import type { Plant } from '../data/types'
import { getCapability, type SampleError, type SampleFn } from '../lib/claudeHost'
import { buildPrompt, normalizePlant } from '../lib/plantGenerator'
import { publishCustomPlants, publishErrorText } from '../lib/publishPlants'
import PlantDetail from './PlantDetail'

type Step =
  | { kind: 'input' }
  | { kind: 'thinking' }
  | { kind: 'preview'; plant: Plant }
  | { kind: 'saving'; plant: Plant }

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')

function findExisting(name: string) {
  const n = norm(name)
  return plants.find((p) => [p.name, ...(p.aliases ?? [])].some((s) => norm(s) === n))
}

function sampleErrorText(e: SampleError) {
  switch (e.code) {
    case 'not_granted':
    case 'sampling_disabled':
    case 'not_declared':
    case 'capability_disabled':
    case 'capability_removed':
      return 'AI 사용이 허용되지 않아 정보를 만들 수 없어요.'
    case 'rate_limited':
      return '요청이 많아요. 잠시 후 다시 시도해 주세요.'
    case 'session_expired':
      return '로그인이 만료됐어요. 다시 로그인해 주세요.'
    case 'refused':
      return '이 이름으로는 정보를 만들 수 없어요. 다른 이름으로 시도해 주세요.'
    case 'invalid_json':
    case 'empty_completion':
      return '답을 정리하지 못했어요. 다시 만들어 주세요.'
    default:
      return '정보를 만들지 못했어요. 잠시 후 다시 시도해 주세요.'
  }
}

/** 화초 이름 → AI가 정보 작성 → 미리보기 확인 → 도감에 추가(페이지 다시 게시) */
export default function NewPlantDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [step, setStep] = useState<Step>({ kind: 'input' })
  const [error, setError] = useState('')
  const ctl = useRef<AbortController | null>(null)

  useEffect(() => () => ctl.current?.abort(), [])

  const generate = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const existing = findExisting(trimmed)
    if (existing) {
      setError(`'${existing.name}'은(는) 이미 도감에 있어요.`)
      return
    }
    setError('')
    setStep({ kind: 'thinking' })
    const sample = await getCapability<SampleFn>('sample')
    if (!sample) {
      setError('AI 사용이 허용되지 않아 정보를 만들 수 없어요.')
      setStep({ kind: 'input' })
      return
    }
    ctl.current = new AbortController()
    try {
      // "다시 만들기"가 새 답을 받도록 캐시를 쓰지 않는다
      const raw = await sample.json(buildPrompt(trimmed), { cache: false, signal: ctl.current.signal })
      const plant = normalizePlant(raw, trimmed)
      const dup = findExisting(plant.name)
      if (dup) throw new Error(`'${dup.name}'은(는) 이미 도감에 있어요.`)
      setStep({ kind: 'preview', plant })
    } catch (e) {
      const err = e as SampleError | Error
      if ('code' in err && err.code === 'cancelled') {
        setStep({ kind: 'input' })
        return
      }
      setError('code' in err ? sampleErrorText(err) : err.message)
      setStep({ kind: 'input' })
    }
  }

  const save = async (plant: Plant) => {
    setStep({ kind: 'saving', plant })
    setError('')
    try {
      await publishCustomPlants([...plants.filter((p) => p.custom), plant])
      // 성공하면 페이지가 새 버전으로 다시 열린다
    } catch (e) {
      const code = (e as { code?: string }).code
      setError(publishErrorText(code))
      if (code !== 'conflict') setStep({ kind: 'preview', plant })
    }
  }

  const busy = step.kind === 'thinking' || step.kind === 'saving'

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="새 화초 추가"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-bg sm:rounded-3xl"
      >
        <header className="flex items-center border-b border-line px-5 py-3">
          <h2 className="text-xl font-bold">🌱 새 화초 추가</h2>
          <button
            type="button"
            onClick={() => {
              ctl.current?.abort()
              onClose()
            }}
            disabled={step.kind === 'saving'}
            className="ml-auto min-h-11 px-3 font-semibold text-muted disabled:opacity-40"
          >
            닫기
          </button>
        </header>

        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          {(step.kind === 'input' || step.kind === 'thinking') && (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                generate()
              }}
            >
              <label htmlFor="new-plant-name" className="font-bold">
                화초 이름
              </label>
              <input
                id="new-plant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 알로카시아, 디펜바키아"
                maxLength={30}
                disabled={busy}
                autoFocus
                className="min-h-12 w-full rounded-2xl border border-line bg-surface px-4 text-lg outline-none focus:border-brand"
              />
              <p className="text-muted">
                이름을 넣으면 AI가 다른 화초와 같은 형식으로 키우는 법을 정리해요. 추가하기 전에 내용을 확인할 수
                있어요.
              </p>
              {step.kind === 'thinking' ? (
                <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-4" role="status">
                  <span className="animate-pulse text-2xl" aria-hidden>
                    🌿
                  </span>
                  <span className="flex-1 font-semibold">'{name.trim()}' 정보를 정리하는 중… (최대 1분)</span>
                  <button
                    type="button"
                    onClick={() => ctl.current?.abort()}
                    className="min-h-11 px-3 font-semibold text-muted"
                  >
                    멈추기
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="min-h-13 rounded-2xl bg-brand text-lg font-bold text-surface disabled:opacity-40"
                >
                  AI로 정보 만들기
                </button>
              )}
            </form>
          )}

          {error && (
            <p role="alert" className="rounded-2xl border-2 border-warn bg-warn-soft p-3 font-semibold text-warn">
              {error}
            </p>
          )}

          {(step.kind === 'preview' || step.kind === 'saving') && (
            <div className="-mx-5 border-y border-line">
              <PlantDetail plant={step.plant} preview />
            </div>
          )}
        </div>

        {(step.kind === 'preview' || step.kind === 'saving') && (
          <footer className="flex flex-wrap gap-2 border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => save(step.plant)}
              disabled={busy}
              className="min-h-13 flex-1 rounded-2xl bg-brand px-6 text-lg font-bold text-surface disabled:opacity-60"
            >
              {step.kind === 'saving' ? '도감에 추가하는 중…' : '도감에 추가'}
            </button>
            <button
              type="button"
              onClick={generate}
              disabled={busy}
              className="min-h-13 rounded-2xl border border-line bg-surface px-5 font-semibold disabled:opacity-40"
            >
              다시 만들기
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
