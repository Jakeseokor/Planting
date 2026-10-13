/** 날짜는 모두 기기 현지 기준 'YYYY-MM-DD' 문자열로 다룬다(시간대·서머타임 영향 없음). */
export type DateStr = string

const pad = (n: number) => String(n).padStart(2, '0')

export const toDateStr = (d: Date): DateStr => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayStr = () => toDateStr(new Date())

const toUTC = (s: DateStr) => {
  const [y, m, d] = s.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export const addDays = (s: DateStr, days: number): DateStr => {
  const d = new Date(toUTC(s) + days * 86400000)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/** b - a (일) */
export const diffDays = (a: DateStr, b: DateStr) => Math.round((toUTC(b) - toUTC(a)) / 86400000)

/** 0 → 오늘, -1 → 어제, 3 → 3일 뒤 */
export function relativeDay(days: number) {
  if (days === 0) return '오늘'
  if (days === -1) return '어제'
  if (days === 1) return '내일'
  return days < 0 ? `${-days}일 전` : `${days}일 뒤`
}

export function formatDate(s: DateStr) {
  const [, m, d] = s.split('-').map(Number)
  return `${m}월 ${d}일`
}
