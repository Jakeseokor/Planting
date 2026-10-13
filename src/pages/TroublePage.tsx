import { Link, NavLink, useParams } from 'react-router-dom'
import SplitLayout from '../components/SplitLayout'
import { getTrouble, troubles, type Trouble } from '../data/troubles'

function TroubleList() {
  return (
    <ul className="flex flex-col gap-1 p-3">
      {troubles.map((t) => (
        <li key={t.id}>
          <NavLink
            to={`/trouble/${t.id}`}
            replace
            className={({ isActive }) =>
              `flex min-h-14 items-center gap-3 rounded-2xl px-3 font-semibold ${isActive ? 'bg-brand-soft' : 'active:bg-surface-2'}`
            }
          >
            <span className="text-2xl" aria-hidden>
              {t.icon}
            </span>
            {t.title}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

function TroubleDetail({ trouble }: { trouble: Trouble }) {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-4 p-4 md:p-6">
      <h1 className="flex items-center gap-3 text-3xl font-extrabold">
        <span aria-hidden>{trouble.icon}</span>
        {trouble.title}
      </h1>
      <p className="text-muted">
        {trouble.causes.length > 1 ? '아래에서 우리 화초와 맞는 경우를 찾아보세요.' : '이런 경우예요.'}
      </p>
      <ol className="flex flex-col gap-3">
        {trouble.causes.map((c, i) => (
          <li key={c.title} className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-bold">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-base text-surface">
                {i + 1}
              </span>
              {c.title}
            </h2>
            <p className="mb-3 rounded-xl bg-surface-2 px-3 py-2">
              <b>🔍 확인</b> · {c.check}
            </p>
            <div className="font-bold text-brand">✅ 이렇게 해요</div>
            <ul className="mt-1 flex flex-col gap-1">
              {c.fixes.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden>•</span>
                  {f}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {trouble.tip && <p className="rounded-2xl bg-brand-soft p-4 font-semibold text-brand">💡 {trouble.tip}</p>}
    </article>
  )
}

export default function TroublePage() {
  const trouble = getTrouble(useParams().id)

  if (trouble) {
    return (
      <SplitLayout list={<TroubleList />} backTo="/trouble" backLabel="문제 해결">
        <TroubleDetail key={trouble.id} trouble={trouble} />
      </SplitLayout>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <h1 className="mb-1 text-3xl font-extrabold">🩺 문제 해결</h1>
      <p className="mb-4 text-lg text-muted">화초에 보이는 증상을 눌러 보세요.</p>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {troubles.map((t) => (
          <li key={t.id}>
            <Link
              to={`/trouble/${t.id}`}
              className="flex h-full min-h-28 flex-col items-center justify-center gap-2 rounded-3xl border border-line bg-surface p-4 text-center text-lg font-bold active:scale-[0.98]"
            >
              <span className="text-4xl" aria-hidden>
                {t.icon}
              </span>
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-5 rounded-2xl bg-surface-2 p-4">
        <b>💧 물이 부족한지, 많은지 헷갈리면?</b>
        <br />
        손가락으로 흙을 2~3cm 눌러 보세요. 젖어 있으면 물을 주지 마세요.
      </p>
    </div>
  )
}
