// claude.ai 아티팩트용 단일 HTML 만들기: dist-artifact 의 JS·CSS 를 한 파일에 넣는다.
// 아티팩트는 게시할 때 <!doctype>/<head>/<body> 를 씌우므로 본문 조각만 쓴다.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'dist-artifact'
const html = readFileSync(join(dir, 'index.html'), 'utf8')
const js = html.match(/<script[^>]+src="\.\/(assets\/[^"]+\.js)"/)?.[1]
const css = html.match(/<link[^>]+href="\.\/(assets\/[^"]+\.css)"/)?.[1]
if (!js || !css) throw new Error('빌드 결과에서 JS/CSS 파일을 찾지 못했습니다')

const code = readFileSync(join(dir, js), 'utf8').replaceAll('</script', '<\\/script')
const style = readFileSync(join(dir, css), 'utf8')

// data-app: 페이지가 새 화초를 담아 자기 자신을 다시 게시할 때 원문을 찾는 표시
const out = `<title>초록 친구</title>
<style data-app>${style}</style>
<script type="application/json" id="custom-plants">[]</script>
<div id="root"></div>
<script type="module" data-app>${code}</script>
`
writeFileSync(join(dir, 'planting.html'), out)
console.log(`${join(dir, 'planting.html')} (${(out.length / 1024).toFixed(0)} KB)`)
