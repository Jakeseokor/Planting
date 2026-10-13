import { Link, Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MyPlantsPage from './pages/MyPlantsPage'
import PlantPage from './pages/PlantPage'
import TroublePage from './pages/TroublePage'
import GalleryPage from './pages/GalleryPage'
import { MyPlantsProvider } from './lib/MyPlantsProvider'
import { useDueCount } from './lib/useDueCount'

const TABS = [
  // 상세 화면(/plant/...)에서도 '화초 도감' 탭을 활성으로 표시
  { to: '/', label: '화초 도감', icon: '🌿', match: (p: string) => p === '/' || p.startsWith('/plant/') },
  { to: '/my', label: '내 화초', icon: '🪴', match: (p: string) => p === '/my' },
  { to: '/trouble', label: '문제 해결', icon: '🩺', match: (p: string) => p.startsWith('/trouble') },
]

export default function App() {
  return (
    <MyPlantsProvider>
      <Shell />
    </MyPlantsProvider>
  )
}

function Shell() {
  const { pathname } = useLocation()
  const due = useDueCount()
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-[calc(76px+env(safe-area-inset-bottom))]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plant/:id" element={<PlantPage />} />
          <Route path="/my" element={<MyPlantsPage />} />
          <Route path="/trouble" element={<TroublePage />} />
          <Route path="/trouble/:id" element={<TroublePage />} />
          {import.meta.env.DEV && <Route path="/gallery" element={<GalleryPage />} />}
        </Routes>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="mx-auto flex max-w-xl">
          {TABS.map((t) => (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to}
                aria-current={t.match(pathname) ? 'page' : undefined}
                className={`flex min-h-[64px] flex-col items-center justify-center gap-0.5 text-sm font-semibold ${
                  t.match(pathname) ? 'text-brand' : 'text-muted'
                }`}
              >
                <span className="relative text-2xl leading-none" aria-hidden>
                  {t.icon}
                  {t.to === '/my' && due > 0 && (
                    <span className="absolute -top-1.5 -right-3 grid h-5 min-w-5 place-items-center rounded-full bg-sky-600 px-1 text-xs font-bold text-white">
                      {due}
                    </span>
                  )}
                </span>
                {t.label}
                {t.to === '/my' && due > 0 && <span className="sr-only">, 오늘 물 줄 화초 {due}개</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
