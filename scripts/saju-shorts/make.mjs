#!/usr/bin/env node
// 사주 풀이 결과를 30초 세로 쇼츠 영상(1080×1920, 30fps, MP4)으로 만든다.
// 장면·그림·음악은 앱의 "쇼츠 영상 만들기" 버튼과 같은 public/saju/saju-shorts.js 를 쓴다.
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

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const sajuDir = join(root, 'public/saju')

/* ---------- 인자 ---------- */
const HELP = `사용법: npm run shorts -- --lunar YYYY-MM-DD --time HH:MM|unknown --gender M|F [옵션]
  --leap            윤달
  --name 이름        화면에 표시할 이름 (최대 10자)
  --place 경도       출생지 경도 (기본 126.98 서울, none = 보정 안 함)
  --zi next|same    밤 11시 출생 일주 기준 (기본 next)
  --out 파일.mp4     결과 파일 (기본 saju-shorts.mp4)
  --example         끝 화면에 "예시 풀이" 표시
  --keys            영상 대신 장면별 미리보기 PNG 묶음(…-keys.png)만 만들기`
const args = process.argv.slice(2)
const opt = {}
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (!a.startsWith('--')) continue
  const next = args[i + 1]
  if (next === undefined || next.startsWith('--')) opt[a.slice(2)] = true
  else { opt[a.slice(2)] = next; i++ }
}
if (opt.help || !opt.lunar || !opt.gender) { console.log(HELP); process.exit(opt.help ? 0 : 1) }
const [ly, lm, ld] = String(opt.lunar).split('-').map(Number)
const place = opt.place ?? '126.98'
const input = {
  lunar: { year: ly, month: lm, day: ld, leap: !!opt.leap },
  time: !opt.time || opt.time === 'unknown' ? null : { hour: +opt.time.split(':')[0], minute: +opt.time.split(':')[1] || 0 },
  gender: String(opt.gender).toUpperCase().startsWith('F') ? 'F' : 'M',
  useLmt: place !== 'none', longitude: place === 'none' ? 127.5 : +place, ziMode: opt.zi || 'next',
}
const storyOpts = { name: opt.name ? String(opt.name) : '', example: !!opt.example }
const outFile = resolve(process.cwd(), opt.out || 'saju-shorts.mp4')

/* ---------- 입력 검증과 음악 (Node 안에서 같은 엔진 실행) ---------- */
function loadUmd(file, extra = {}) {
  const module = { exports: {} }
  vm.runInNewContext(readFileSync(file, 'utf8'), { module, exports: module.exports, self: { ...extra }, console }, { filename: file })
  return module.exports
}
const files = ['vendor/korean-lunar-calendar.min.js', 'saju-core.js', 'saju-reading.js', 'saju-shorts.js'].map((f) => join(sajuDir, f))
const Lunar = loadUmd(files[0])
const C = loadUmd(files[1])
const S = loadUmd(files[3])
let r
try { r = C.compute(input, Lunar) } catch (e) { console.error('입력 오류:', e.message); process.exit(1) }

if (spawnSync('ffmpeg', ['-version']).status !== 0) { console.error('ffmpeg 이 필요합니다.'); process.exit(1) }
const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require('playwright')) } catch {
  console.error('Playwright 가 필요합니다: npm i -D playwright && npx playwright install chromium'); process.exit(1)
}

/* ---------- 캔버스 페이지 ---------- */
const fonts = pathToFileURL(join(root, 'node_modules/@fontsource')).href
const work = mkdtempSync(join(tmpdir(), 'saju-shorts-'))
const page = join(work, 'shorts.html')
writeFileSync(page, `<!doctype html><html><head><meta charset="utf-8">
${['noto-sans-kr/500', 'noto-sans-kr/700', 'noto-sans-kr/900', 'gowun-batang/700', 'noto-serif-kr/900'].map((f) => `<link rel="stylesheet" href="${fonts}/${f}.css">`).join('\n')}
<style>html,body{margin:0;background:#10142a}canvas{display:block}</style></head>
<body><canvas id="c" width="${S.W}" height="${S.H}"></canvas>
${files.map((f) => `<script src="${pathToFileURL(f).href}"></script>`).join('\n')}
<script>
  const r = SajuCore.compute(${JSON.stringify(input)}, KoreanLunarCalendar)
  const a = SajuReading.analyze(r, new Date())
  const story = SajuShorts.buildStory(r, a, SajuCore, SajuReading, ${JSON.stringify(storyOpts)})
  const ctx = document.getElementById('c').getContext('2d')
  window.renderAt = (t) => SajuShorts.drawFrame(ctx, story, t)
  window.ready = SajuShorts.loadFonts(story, document).then(() => window.renderAt(0))
</script></body></html>`)

const browser = await chromium.launch()
const pg = await browser.newPage({ viewport: { width: S.W, height: S.H } })
const errors = []
pg.on('pageerror', (e) => errors.push(e.message))
await pg.goto(pathToFileURL(page).href)
await pg.evaluate(() => window.ready)
if (errors.length) { console.error('그리기 오류:', errors.join('\n')); await browser.close(); process.exit(1) }

const done = async (code) => { await browser.close(); rmSync(work, { recursive: true, force: true }); process.exit(code) }

if (opt.keys) {
  const ts = [2.6, 6.8, 11.5, 16.2, 20.5, 24.8, 27.6, 29.6]
  for (let i = 0; i < ts.length; i++) { await pg.evaluate((t) => window.renderAt(t), ts[i]); await pg.screenshot({ path: join(work, `k${i}.png`) }) }
  const keysOut = outFile.replace(/\.mp4$/i, '') + '-keys.png'
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(work, 'k%d.png'), '-vf', 'scale=360:-1,tile=4x2', '-frames:v', '1', keysOut], { stdio: 'inherit' })
  console.log('미리보기:', keysOut)
  await done(0)
}

// 음악 WAV (16bit 스테레오)
const sr = 44100
const samples = S.musicSamples(sr)
const wav = Buffer.alloc(44 + samples.length * 4)
wav.write('RIFF', 0); wav.writeUInt32LE(36 + samples.length * 4, 4); wav.write('WAVE', 8)
wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22)
wav.writeUInt32LE(sr, 24); wav.writeUInt32LE(sr * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34)
wav.write('data', 36); wav.writeUInt32LE(samples.length * 4, 40)
for (let j = 0; j < samples.length; j++) {
  const v = Math.max(-32768, Math.min(32767, Math.round(samples[j] * 32767)))
  wav.writeInt16LE(v, 44 + j * 4); wav.writeInt16LE(v, 46 + j * 4)
}
const wavPath = join(work, 'music.wav')
writeFileSync(wavPath, wav)

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(S.FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wavPath,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '19', '-r', String(S.FPS),
  '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] })
const N = S.FPS * S.DURATION
for (let f = 0; f < N; f++) {
  await pg.evaluate((t) => window.renderAt(t), f / S.FPS)
  const buf = await pg.screenshot({ type: 'jpeg', quality: 92 })
  if (!ff.stdin.write(buf)) await new Promise((res) => ff.stdin.once('drain', res))
  if (f % 150 === 0) process.stdout.write(`\r프레임 ${f}/${N}`)
}
ff.stdin.end()
const code = await new Promise((res) => ff.on('close', res))
if (code !== 0) { console.error('\nffmpeg 인코딩 실패'); await done(1) }
const P = r.pillars
console.log(`\r완료: ${outFile}  (${P.year.hanja} ${P.month.hanja} ${P.day.hanja} ${P.hour ? P.hour.hanja : '시간 모름'})`)
await done(0)
