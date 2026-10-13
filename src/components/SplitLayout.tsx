import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * 가로 iPad: 왼쪽 목록 + 오른쪽 상세(각자 스크롤)
 * 세로: 상세만 보이고 위쪽에 뒤로 가기
 */
export default function SplitLayout({
  list,
  backTo,
  backLabel,
  children,
}: {
  list: ReactNode
  backTo: string
  backLabel: string
  children: ReactNode
}) {
  return (
    <div className="split:flex split:h-[calc(100dvh-76px-env(safe-area-inset-bottom))]">
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-line bg-surface split:block">{list}</aside>
      <div className="min-w-0 flex-1 split:overflow-y-auto">
        <Link
          to={backTo}
          className="mx-2 mt-2 inline-flex min-h-11 items-center px-2 font-semibold text-brand split:hidden"
        >
          ‹ {backLabel}
        </Link>
        {children}
      </div>
    </div>
  )
}
