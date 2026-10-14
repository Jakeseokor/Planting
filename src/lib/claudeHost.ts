import { useEffect, useState } from 'react'

/**
 * claude.ai 아티팩트 안에서만 있는 기능(AI 질문, 페이지 다시 게시, 보는 사람 권한)에 닿는 다리.
 * 다른 곳(PWA·개발 서버)에서는 window.claude 가 없어 모두 null 이 된다.
 */
type Use = (name: string) => Promise<unknown>

declare global {
  interface Window {
    claude?: { use: Use }
  }
}

export interface SampleError {
  code: string
  message: string
  text?: string
}

export interface SampleFn {
  json: <T = unknown>(
    input: string,
    options?: { modelTier?: string; cache?: boolean; signal?: AbortSignal },
  ) => Promise<T>
}

export interface ArtifactApi {
  publish: (html: string) => Promise<{ version: string }>
}

interface UserApi {
  canEdit: () => Promise<boolean>
}

export async function getCapability<T>(name: string): Promise<T | null> {
  try {
    return ((await window.claude?.use(name)) as T) ?? null
  } catch {
    return null
  }
}

/** 새 화초를 추가할 수 있는 화면인지: AI 질문 + 다시 게시 + 편집 권한이 모두 있어야 한다. */
export function useCanAddPlants() {
  const [can, setCan] = useState(false)
  useEffect(() => {
    if (!window.claude) return
    let alive = true
    Promise.all([
      getCapability<SampleFn>('sample'),
      getCapability<ArtifactApi>('artifact'),
      getCapability<UserApi>('user'),
    ]).then(async ([sample, artifact, user]) => {
      const editor = (await user?.canEdit().catch(() => false)) ?? false
      if (alive) setCan(Boolean(sample && artifact && editor))
    })
    return () => {
      alive = false
    }
  }, [])
  return can
}
