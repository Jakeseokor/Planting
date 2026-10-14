import { CUSTOM_PLANTS_ELEMENT_ID } from '../data/customPlants'
import type { Plant } from '../data/types'
import { getCapability, type ArtifactApi } from './claudeHost'

// 아티팩트 호스트가 게시할 때 씌우는 골격(그대로 다시 보내야 호스트가 알아보고 교체한다)
const SKELETON_HEAD =
  '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>'

/**
 * 화초 목록을 담아 페이지 전체를 다시 만든다. 라이브 DOM 을 직렬화하지 않고,
 * 처음 게시된 앱 스타일·스크립트 원문과 데이터만으로 조립한다.
 */
export function buildDocument(customPlants: Plant[]) {
  const style = document.querySelector('style[data-app]')?.textContent
  const script = document.querySelector('script[data-app]')?.textContent
  if (!style || !script) throw new Error('앱 원본을 찾지 못했어요')
  const data = JSON.stringify(customPlants).replace(/</g, '\\u003c')
  return `${SKELETON_HEAD}
<title>초록 친구</title>
<style data-app>${style}</style>
<script type="application/json" id="${CUSTOM_PLANTS_ELEMENT_ID}">${data}</script>
<div id="root"></div>
<script type="module" data-app>${script}</script>
</body></html>`
}

/** 저장되면 페이지가 새 버전으로 다시 열린다(보고 있는 모든 사람에게 반영). */
export async function publishCustomPlants(customPlants: Plant[]) {
  const artifact = await getCapability<ArtifactApi>('artifact')
  if (!artifact) throw { code: 'not_granted', message: 'artifact unavailable' }
  await artifact.publish(buildDocument(customPlants))
}

export function publishErrorText(code: string | undefined) {
  switch (code) {
    case 'not_writer':
    case 'not_granted':
    case 'not_declared':
    case 'consent_required':
      return '이 화면에서는 도감을 고칠 수 없어요. 편집 권한이 있는 계정으로 열어 주세요.'
    case 'conflict':
      return '그사이 다른 곳에서 바뀌어 최신 내용으로 다시 열어요.'
    case 'rate_limited':
      return '잠시 후 다시 시도해 주세요.'
    case 'too_large':
      return '도감이 너무 커졌어요. 추가한 화초 몇 개를 빼 주세요.'
    default:
      return '저장하지 못했어요. 잠시 후 다시 시도해 주세요.'
  }
}
