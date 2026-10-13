import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { todayStr, type DateStr } from './date'
import { MyPlantsContext, type MyPlantsApi } from './myPlantsContext'
import { loadMyPlants, newId, requestPersistentStorage, saveMyPlants } from './storage'
import type { MyPlant } from './watering'

export function MyPlantsProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<MyPlant[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadMyPlants().then((l) => {
      setList(l)
      setLoaded(true)
    })
    requestPersistentStorage()
  }, [])

  const update = useCallback((fn: (l: MyPlant[]) => MyPlant[]) => {
    setList((prev) => {
      const next = fn(prev)
      saveMyPlants(next)
      return next
    })
  }, [])

  const api = useMemo<MyPlantsApi>(() => {
    const patch = (id: string, fn: (p: MyPlant) => MyPlant) => update((l) => l.map((p) => (p.id === id ? fn(p) : p)))
    const withDate = (p: MyPlant, date: DateStr): MyPlant => ({
      ...p,
      lastWatered: date,
      history: [date, ...p.history.filter((d) => d !== date)].sort().reverse().slice(0, 10),
    })
    return {
      list,
      loaded,
      add: (plantId, nickname, lastWatered) =>
        update((l) => [
          ...l,
          { id: newId(), plantId, nickname: nickname.trim(), addedAt: todayStr(), lastWatered, history: [lastWatered] },
        ]),
      water: (id, date = todayStr()) => patch(id, (p) => withDate(p, date)),
      setLastWatered: (id, date) =>
        patch(id, (p) => ({
          ...withDate(p, date),
          history: [date, ...p.history.filter((d) => d < date)].slice(0, 10),
        })),
      rename: (id, nickname) => patch(id, (p) => ({ ...p, nickname: nickname.trim() })),
      remove: (id) => update((l) => l.filter((p) => p.id !== id)),
      restore: (mp) => patch(mp.id, () => mp),
    }
  }, [list, loaded, update])

  return <MyPlantsContext.Provider value={api}>{children}</MyPlantsContext.Provider>
}
