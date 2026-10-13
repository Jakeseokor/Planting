import type { Plant } from '../data/types'

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')

export function matchesQuery(p: Plant, q: string) {
  const n = norm(q)
  if (!n) return true
  return [p.name, p.scientificName, ...(p.aliases ?? [])].some((s) => norm(s).includes(n))
}
