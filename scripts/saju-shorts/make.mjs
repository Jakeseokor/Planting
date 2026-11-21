#!/usr/bin/env node
// 사주 풀이 결과를 30초 세로 쇼츠 영상(1080×1920, 30fps, MP4)으로 만든다.
//
//   npm run shorts -- --lunar 1985-03-15 --time 07:30 --gender M
//   npm run shorts -- --lunar 1990-05-10 --leap --time unknown --gender F --name 김하늘 --out haneul.mp4
//
// 필요: ffmpeg, Playwright(Chromium). 글꼴은 devDependencies 의 @fontsource 패키지를 쓴다.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import vm from 'node:vm'
import { makeMusic } from './music.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const sajuDir = join(root, 'public/saju')

/* ---------- 인자 ---------- */
const HELP = `사용법: npm run shorts -- --lunar YYYY-MM-DD --time HH:MM|unknown --gender M|F [옵션]
  --leap            윤달
  --name 이름        화면에 표시할 이름 (없으면 "이 사람")
  --place 경도       출생지 경도 (기본 126.98 서울, none = 보정 안 함)
  --zi next|same    밤 11시 출생 일주 기준 (기본 next)
  --out 파일.mp4     결과 파일 (기본 saju-shorts.mp4)
  --example         끝 화면에 "예시 풀이" 표시
  --keys            영상 대신 장면별 미리보기 PNG 묶음(keys.png)만 만들기`
const args = process.argv.slice(2)
const opt = {}
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (!a.startsWith('--')) continue
  const key = a.slice(2)
  const next = args[i + 1]
  if (next === undefined || next.startsWith('--')) opt[key] = true
  else { opt[key] = next; i++ }
}
if (opt.help || !opt.lunar || !opt.gender) { console.log(HELP); process.exit(opt.help ? 0 : 1) }
const [ly, lm, ld] = String(opt.lunar).split('-').map(Number)
const gender = String(opt.gender).toUpperCase().startsWith('F') ? 'F' : 'M'
const time = !opt.time || opt.time === 'unknown' ? null : { hour: +opt.time.split(':')[0], minute: +opt.time.split(':')[1] || 0 }
const place = opt.place ?? '126.98'
const name = opt.name ? String(opt.name).slice(0, 10) : ''
const outFile = resolve(process.cwd(), opt.out || 'saju-shorts.mp4')

/* ---------- 사주 계산 (앱과 같은 엔진) ---------- */
function loadUmd(file, extra = {}) {
  const module = { exports: {} }
  const ctx = { module, exports: module.exports, self: { ...extra }, console }
  vm.runInNewContext(readFileSync(file, 'utf8'), ctx, { filename: file })
  return module.exports
}
const Lunar = loadUmd(join(sajuDir, 'vendor/korean-lunar-calendar.min.js'))
const C = loadUmd(join(sajuDir, 'saju-core.js'))
const R = loadUmd(join(sajuDir, 'saju-reading.js'), { SajuCore: C })

const input = {
  lunar: { year: ly, month: lm, day: ld, leap: !!opt.leap }, time, gender,
  useLmt: place !== 'none', longitude: place === 'none' ? 127.5 : +place, ziMode: opt.zi || 'next',
}
let r, a
try { r = C.compute(input, Lunar); a = R.analyze(r, new Date()) } catch (e) { console.error('입력 오류:', e.message); process.exit(1) }
const P = r.pillars
const E = a.EL_INFO

/* ---------- 문구 ---------- */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const EL_SHORT = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)']
const EL_WORD = ['나무', '불', '흙', '쇠', '물']
const SWATCH = [['#2f8a4a', '#1f5a8a'], ['#d23a2a', '#7b3fa0'], ['#d9a52b', '#b89a74'], ['#f2f2f2', '#d4af37'], ['#0d0f18', '#22336e']]
// 일간별 한 줄 소개 [강조 단어 앞, 강조 단어, 뒤], 부제, 짧은 조언
const DM = [
  ['곧게 뻗은', '큰 나무', ' 같은 사람', '우직하고 리더십이 강합니다', '고집은 내려놓고, 귀는 열어 두기'],
  ['어디서든 피어나는', '꽃과 넝쿨', ' 같은 사람', '유연하고 생활력이 강합니다', '눈치보다 내 마음 먼저 챙기기'],
  ['모두를 비추는', '태양', ' 같은 사람', '밝고 솔직하며 표현력이 뛰어납니다', '시작만큼 마무리도 뜨겁게'],
  ['어둠을 밝히는', '촛불', ' 같은 사람', '따뜻하고 섬세하며 집중력이 깊습니다', '혼자 앓지 말고 털어놓기'],
  ['흔들리지 않는', '큰 산', ' 같은 사람', '듬직하고 믿음직한 중재자입니다', '변화 앞에서 한 걸음 먼저'],
  ['씨앗을 품은', '논밭', ' 같은 사람', '알뜰하고 다정하며 실속을 챙깁니다', '걱정은 줄이고, 기회는 잡기'],
  ['단단한', '바위와 무쇠', ' 같은 사람', '결단력 있고 의리가 강합니다', '바른말도 부드럽게'],
  ['갈고닦은', '보석', ' 같은 사람', '깔끔하고 감각이 예리합니다', '남의 평가에 흔들리지 않기'],
  ['끝없이 넓은', '바다', ' 같은 사람', '포용력이 크고 지혜롭습니다', '큰 그림을 작은 실행으로'],
  ['조용히 스며드는', '빗물', ' 같은 사람', '총명하고 차분하며 상상력이 풍부합니다', '걱정은 줄이고, 마음은 털어놓기'],
]
const GROUP = [
  ['比劫', '자존심·독립심이 강함', '내 길을 스스로 개척하는 타입'],
  ['食傷', '표현·재능이 발달', '말과 글, 아이디어로 빛나는 타입'],
  ['財星', '돈 감각·현실력이 뛰어남', '기회를 알아보고 결과를 만드는 타입'],
  ['官星', '책임감·명예심이 강함', '조직에서 인정받는 믿음직한 타입'],
  ['印星', '배움·통찰이 깊음', '공부하고 생각할수록 강해지는 타입'],
]
const SINSAL = {
  천을귀인: ['貴人', '어려울 때 꼭 돕는 사람이 나타나요'],
  문창귀인: ['文昌', '공부·시험·글쓰기에 강한 머리'],
  양인: ['羊刃', '강한 추진력과 승부욕'],
  도화살: ['桃花', '사람을 끄는 매력과 인기'],
  역마살: ['驛馬', '이동·해외·변화에서 기회를 잡아요'],
  화개살: ['華蓋', '예술·학문적 감수성이 깊어요'],
  괴강살: ['魁罡', '카리스마 있는 강한 리더십'],
}
// 받침에 따라 조사 고르기: josa('나무', '은', '는') → '나무는', 괄호 한자는 건너뛴다
const josa = (word, withB, withoutB, rieulOk = false) => {
  const base = word.replace(/\(.*\)$/, '')
  const code = base.charCodeAt(base.length - 1) - 0xac00
  const jong = code >= 0 && code < 11172 ? code % 28 : 0
  return word + (jong === 0 || (rieulOk && jong === 8) ? withoutB : withB)
}
const season = ['', '봄', '봄', '봄', '여름', '여름', '여름', '가을', '가을', '가을', '겨울', '겨울', '겨울'][lm]
const dayPart = (h) => (h < 5 ? '새벽' : h < 12 ? '아침' : h < 17 ? '낮' : h < 21 ? '저녁' : '밤')
const who = name ? `${esc(name)}님` : '이 사람'
const g = (stem, branch) => `<span class="g e${C.STEM_EL[stem]}"><b>${C.STEMS_H[stem]}</b><i>${C.STEMS[stem]}·${C.ELEMENTS[C.STEM_EL[stem]]}</i></span><span class="g e${C.BRANCH_EL[branch]}"><b>${C.BRANCHES_H[branch]}</b><i>${C.BRANCHES[branch]}·${C.ELEMENTS[C.BRANCH_EL[branch]]}</i></span>`
const unknownCol = '<span class="g" style="background:rgba(255,255,255,.08);color:var(--muted)"><b>?</b><i>시간 모름</i></span>'.repeat(2)
const gz = (stem, branch) => `<span class="c${C.STEM_EL[stem]}">${C.STEMS_H[stem]}</span><span class="c${C.BRANCH_EL[branch]}">${C.BRANCHES_H[branch]}</span>`
const sentence = (t) => t.replace(/\.$/, '').replace(/\. /g, ' · ')
const badge = (grade) => (grade === '대길' || grade === '길' ? ['up', grade] : grade === '보통' ? ['mid-b', '보통'] : ['down', '주의'])

// 장면 1: 첫 장면
const hook = `${ly}년 ${season}${time ? `<br>${dayPart(time.hour)} <span class="hl">${time.hour}시${time.minute ? ` ${time.minute}분` : ''}</span>에` : '에'}<br>태어난 ${name ? esc(name) : '사람'}`

// 장면 2: 기둥
const cols = [
  ['시', P.hour ? g(P.hour.stem, P.hour.branch) : unknownCol],
  ['일', g(P.day.stem, P.day.branch)],
  ['월', g(P.month.stem, P.month.branch)],
  ['년', g(P.year.stem, P.year.branch)],
]
const lunarStr = `음력 ${ly}. ${r.lunar.leap ? '윤' : ''}${lm}. ${ld} · ${gender === 'M' ? '남' : '여'}`

// 장면 4: 오행
const maxC = Math.max(...a.count)
const maxEl = a.count.indexOf(maxC)
const lack = a.count.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0)
const alert = lack.length
  ? `${josa(EL_WORD[maxEl], '은', '는')} 넘치고, ${josa(lack.map((i) => `${EL_WORD[i]}(${C.ELEMENTS_H[i]})`).join('·'), '은', '는')} 0개!`
  : '다섯 기운이 모두 있는 균형형!'
const yf = a.yongFinal
const strengthLine = a.strong
  ? `기운이 넘치는 <span class="hl">${a.strength}</span> 사주 —<br><span class="c${yf}">${EL_WORD[yf]}(${C.ELEMENTS_H[yf]})</span>${josa(EL_WORD[yf], '으로', '로', true).slice(EL_WORD[yf].length)} 흘려보내면 좋아요`
  : `기운을 쏟아내는 <span class="hl">${a.strength.replace('(약간 신약)', '')}</span> 사주 —<br>나를 채워 줄 <span class="c${yf}">${EL_WORD[yf]}(${C.ELEMENTS_H[yf]})</span>${josa(EL_WORD[yf], '이', '가').slice(EL_WORD[yf].length)} 필요해요`

// 장면 5: 타고난 무기 (가장 강한 십성 + 신살 최대 2개, 모자라면 12운성)
const topG = a.groupCount.indexOf(Math.max(...a.groupCount))
const cards = [[`<span class="k c${C.mod(C.STEM_EL[P.day.stem] + topG, 5)}">${GROUP[topG][0]}</span>`, GROUP[topG][1], GROUP[topG][2]]]
const sinCount = {}
for (const s of a.sinsal) sinCount[s.name] = (sinCount[s.name] || 0) + 1
for (const [nm, cnt] of Object.entries(sinCount).sort((x, y) => (x[0] === '천을귀인' ? -1 : y[0] === '천을귀인' ? 1 : y[1] - x[1]))) {
  if (cards.length >= 3 || !SINSAL[nm]) continue
  cards.push([`<span class="k hl">${SINSAL[nm][0]}</span>`, `${nm}${cnt > 1 ? ` × ${cnt}` : ''}`, SINSAL[nm][1]])
}
if (cards.length < 3) {
  const st = a.cells.day.stage
  cards.push([`<span class="k c${P.day.branchEl}">${C.BRANCHES_H[P.day.branch]}</span>`, `일지 ${st}`, a.STAGE_TEXT[st].replace(' – ', ' · ')])
}
if (cards.length < 3) cards.push([`<span class="k c${C.STEM_EL[P.day.stem]}">${C.STEMS_H[P.day.stem]}</span>`, '타고난 강점', R.DAY_MASTER[P.day.stem].good])

// 장면 6: 운의 흐름
const dwI = a.curDwInfo || a.daewoon[0]
const dwLabel = a.curDwInfo ? `지금 ${Math.floor(a.age / 10) * 10 || 10}대 대운` : `${dwI.age}세부터 첫 대운`
const dwBadge = dwI.good > 0 ? ['up', '순풍'] : dwI.good < 0 ? ['down', '역풍'] : ['mid-b', '평온']
const dwText = dwI.good > 0 ? `나를 돕는 ${EL_WORD[yf]}의 기운이 들어온 시기` : dwI.good < 0 ? '내실을 다지며 버티면 기회가 오는 시기' : '큰 굴곡 없이 무난하게 흐르는 시기'
const yc = (y) => { const [cls, lb] = badge(y.grade); return `<div class="card a" data-fx="slide"><span class="k">${gz(y.pillar.stem, y.pillar.branch)}</span><span class="v"><b>${y.year}년 <span class="badge ${cls}">${lb}</span></b>${esc(sentence(y.text))}</span></div>` }

// 장면 7: 처방
const acts = E[yf].act.split(',').map((s) => s.trim())

const S = [0, 3.5, 8, 12.5, 17, 21.5, 25.5, 28.3, 30.2]
const scene = (i, body) => `<section class="scene" data-s="${S[i]}" data-e="${S[i + 1]}">\n${body}\n</section>`
// data-t 를 차례로 붙인다 (a 클래스 요소 순서대로 step 간격)
const stagger = (html, start, step) => { let k = 0; return html.replace(/class="([^"]*\ba\b[^"]*)"/g, (m) => `${m} data-t="${(start + step * k++).toFixed(2)}"`) }

const scenes = [
  scene(0, stagger(`<div class="seal a" data-fx="stamp">四柱<br>八字</div>
  <div class="big a">${hook}</div>
  <div class="mid a muted">${name ? who + '의' : '그'} 운명은?</div>`, 0, 0.6)),
  scene(1, `<div class="eyebrow a" data-t="0">여덟 글자 세우기</div>
  <div class="date a" data-t=".15">${lunarStr}</div>
  <div class="arrow a" data-t=".35">▼ 양력 ${r.solar.year}. ${r.solar.month}. ${r.solar.day} · ${r.animal}띠</div>
  <div class="pillars">${cols.map(([lb, html], i) => `<div class="col a" data-t="${(0.7 + i * 0.25).toFixed(2)}" data-fx="drop"><span class="lab">${lb}</span>${html.replace(`class="g e${C.STEM_EL[P.day.stem]}"`, lb === '일' ? `class="g e${C.STEM_EL[P.day.stem]} me"` : `class="g e${C.STEM_EL[P.day.stem]}"`)}</div>`).join('')}</div>
  <div class="txt a" data-t="2.3">네 기둥, 여덟 글자가<br>타고난 기운의 지도입니다</div>`),
  scene(2, `<div class="eyebrow a" data-t="0">나를 나타내는 글자</div>
  <div class="g e${C.STEM_EL[P.day.stem]} hero-g me a" data-t=".2" data-fx="zoom"><b>${C.STEMS_H[P.day.stem]}</b><i>${C.STEMS[P.day.stem]}${C.ELEMENTS[C.STEM_EL[P.day.stem]]} · ${DM[P.day.stem][1]}</i></div>
  <div class="mid a" data-t=".9">${DM[P.day.stem][0]}<br><span class="c${C.STEM_EL[P.day.stem]}">${DM[P.day.stem][1]}</span>${DM[P.day.stem][2]}</div>
  <div class="txt a" data-t="1.6">${DM[P.day.stem][3]}</div>`),
  scene(3, `<div class="eyebrow a" data-t="0">오행 밸런스</div>
  <div class="bars">${a.count.map((c, i) => `<div class="bar a" data-t="${(0.2 + i * 0.1).toFixed(1)}"><span class="c${i}">${C.ELEMENTS_H[i]} ${C.ELEMENTS[i]}</span><span class="track"><span class="e${i}" data-w="${Math.round((c / maxC) * 100)}" data-bt="${(0.4 + i * 0.1).toFixed(1)}"></span></span><span class="n${c === 0 ? ' c1' : ''}" data-n="${c}" data-bt="${(0.4 + i * 0.1).toFixed(1)}">0</span></div>`).join('')}</div>
  <div class="alert a" data-t="1.8" data-fx="pop"${lack.length ? '' : ' style="color:var(--wood);background:rgba(95,191,122,.16)"'}>${alert}</div>
  <div class="txt a" data-t="2.5">${strengthLine}</div>`),
  scene(4, `<div class="eyebrow a" data-t="0">타고난 무기</div>
  <div class="cards">${cards.map(([k, b, v], i) => `<div class="card a" data-t="${(0.25 + i * 0.5).toFixed(2)}" data-fx="slide">${k}<span class="v"><b>${esc(b)}</b>${esc(v)}</span></div>`).join('')}</div>
  <div class="txt a muted" data-t="2.2">잘 맞는 길: ${esc(R.DAY_MASTER[P.day.stem].job.replace(/, /g, ' · '))}</div>`),
  scene(5, stagger(`<div class="eyebrow a">운의 흐름</div>
  <div class="cards">
    <div class="card a" data-fx="slide"><span class="k">${gz(dwI.stem, dwI.branch)}</span><span class="v"><b>${dwLabel} <span class="badge ${dwBadge[0]}">${dwBadge[1]}</span></b>${dwText}</span></div>
    ${yc(a.thisYear)}
    ${yc(a.nextYear)}
  </div>`, 0, 0.5)),
  scene(6, `<div class="eyebrow a" data-t="0">행운 처방</div>
  <div class="lucky">
    <div class="a" data-t=".15" data-fx="pop"><span>행운의 색</span><b>${SWATCH[yf].map((c) => `<i class="swatch" style="background:${c}"></i>`).join('')}${E[yf].color.split('·').slice(0, 2).join('·')}</b></div>
    <div class="a" data-t=".35" data-fx="pop"><span>좋은 방향</span><b>${E[yf].dir}</b></div>
    <div class="a" data-t=".55" data-fx="pop"><span>행운의 숫자</span><b>${E[yf].num.replace(', ', ' · ')}</b></div>
    <div class="a" data-t=".75" data-fx="pop"><span>추천 습관</span><b>${esc(acts.slice(0, 2).join(' · ').replace(/ 키우기| 쬐기| 하기/g, ''))}</b></div>
  </div>
  <div class="txt a" data-t="1.3">${DM[P.day.stem][4]}</div>`),
  scene(7, `<div class="seal a" data-t="0" data-fx="stamp" style="width:190px;height:190px;font-size:70px">四柱<br>八字</div>
  <div class="mid a" data-t=".2">내 사주도 지금 확인!</div>
  <div class="cta a" data-t=".4" data-fx="pop">사주 명식</div>
  <div class="txt a muted" data-t=".6" style="font-size:32px">${opt.example ? '예시 풀이' : `${who}의 사주`} · 전통 명리 기반 참고용</div>`),
]

/* ---------- 렌더링 ---------- */
const fonts = pathToFileURL(join(root, 'node_modules/@fontsource')).href
const html = readFileSync(join(here, 'template.html'), 'utf8').replaceAll('{{FONTS}}', fonts).replace('<!--SCENES-->', scenes.join('\n'))
const work = mkdtempSync(join(tmpdir(), 'saju-shorts-'))
const page = join(work, 'shorts.html')
writeFileSync(page, html)

if (spawnSync('ffmpeg', ['-version']).status !== 0) { console.error('ffmpeg 이 필요합니다.'); process.exit(1) }
const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require('playwright')) } catch {
  console.error('Playwright 가 필요합니다: npm i -D playwright && npx playwright install chromium'); process.exit(1)
}

const FPS = 30, DURATION = 30
const browser = await chromium.launch()
const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
await pg.goto(pathToFileURL(page).href)
await pg.evaluate(() => document.fonts.ready)
await pg.waitForTimeout(500)

if (opt.keys) {
  const ts = [2.6, 6.8, 11.5, 16.2, 20.5, 24.8, 27.6, 29.6]
  for (let i = 0; i < ts.length; i++) { await pg.evaluate((t) => window.render(t), ts[i]); await pg.screenshot({ path: join(work, `k${i}.png`) }) }
  await browser.close()
  const keysOut = outFile.replace(/\.mp4$/i, '') + '-keys.png'
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(work, 'k%d.png'), '-vf', 'scale=360:-1,tile=4x2', '-frames:v', '1', keysOut], { stdio: 'inherit' })
  rmSync(work, { recursive: true, force: true })
  console.log('미리보기:', keysOut)
  process.exit(0)
}

const wav = join(work, 'music.wav')
makeMusic(wav, { duration: DURATION, sceneStarts: S.slice(0, -1) })
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '19', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] })
const N = FPS * DURATION
for (let f = 0; f < N; f++) {
  await pg.evaluate((t) => window.render(t), f / FPS)
  const buf = await pg.screenshot({ type: 'jpeg', quality: 92 })
  if (!ff.stdin.write(buf)) await new Promise((res) => ff.stdin.once('drain', res))
  if (f % 150 === 0) process.stdout.write(`\r프레임 ${f}/${N}`)
}
ff.stdin.end()
const code = await new Promise((res) => ff.on('close', res))
await browser.close()
rmSync(work, { recursive: true, force: true })
if (code !== 0) { console.error('\nffmpeg 인코딩 실패'); process.exit(1) }
console.log(`\r완료: ${outFile}  (${P.year.hanja} ${P.month.hanja} ${P.day.hanja} ${P.hour ? P.hour.hanja : '시간 모름'})`)
