import type { ReactNode } from 'react'

export default function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full border px-4 font-semibold transition ${
        active ? 'border-brand bg-brand text-surface' : 'border-line bg-surface text-ink active:bg-surface-2'
      }`}
    >
      {children}
    </button>
  )
}
