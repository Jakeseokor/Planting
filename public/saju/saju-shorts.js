/* 사주 쇼츠 영상: 풀이 결과 → 8장면 이야기(story) → 캔버스 프레임(1080×1920) + 배경음악 샘플
 * 브라우저(앱의 "쇼츠 영상 만들기" 버튼)와 Node(npm run shorts)가 같은 코드를 쓴다.
 */
;(function (root, factory) {
  const api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  else root.SajuShorts = api
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict'

  const W = 1080, H = 1920, DURATION = 30, FPS = 30
  const STARTS = [0, 3.5, 8, 12.5, 17, 21.5, 25.5, 28.3, 30.2]
  const COL = {
    bg1: '#10142a', bg2: '#25325f', paper: '#f4efe4', muted: '#aeb3cc', seal: '#e0533b', gold: '#f2cf7a', ink: '#141a2e',
    e0: '#5fbf7a', e1: '#f0705a', e2: '#e2b04f', e3: '#c9ced8', e4: '#6f9cf0',
  }
  const FONT = {
    d: (s) => `700 ${s}px "Gowun Batang", "Noto Serif KR", serif`,
    h: (s) => `900 ${s}px "Noto Serif KR", "Gowun Batang", serif`,
    b: (s, w = 500) => `${w} ${s}px "Noto Sans KR", system-ui, sans-serif`,
  }

  /* ---------- 문구 재료 ---------- */
  const EL_WORD = ['나무', '불', '흙', '쇠', '물']
  const SWATCH = [['#2f8a4a', '#1f5a8a'], ['#d23a2a', '#7b3fa0'], ['#d9a52b', '#b89a74'], ['#f2f2f2', '#d4af37'], ['#0d0f18', '#22336e']]
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
    천을귀인: ['貴人', '어려울 때 꼭 돕는 사람이 나타나요'], 문창귀인: ['文昌', '공부·시험·글쓰기에 강한 머리'],
    양인: ['羊刃', '강한 추진력과 승부욕'], 도화살: ['桃花', '사람을 끄는 매력과 인기'],
    역마살: ['驛馬', '이동·해외·변화에서 기회를 잡아요'], 화개살: ['華蓋', '예술·학문적 감수성이 깊어요'],
    괴강살: ['魁罡', '카리스마 있는 강한 리더십'],
  }
  // 받침에 따라 조사 고르기: josa('나무', '은', '는') → '나무는'. 끝의 괄호(한자)는 건너뛴다.
  const josa = (word, withB, withoutB, rieulOk = false) => {
    const base = word.replace(/\(.*\)$/, '')
    const code = base.charCodeAt(base.length - 1) - 0xac00
    const jong = code >= 0 && code < 11172 ? code % 28 : 0
    return jong === 0 || (rieulOk && jong === 8) ? withoutB : withB
  }
  const clean = (s) => String(s || '').replace(/[{}|<>]/g, '').trim().slice(0, 10)
  const sentence = (t) => t.replace(/\.$/, '').replace(/\. /g, ' · ')

  /* ---------- 이야기 만들기 ---------- */
  // 서식 문자열: '|' 줄바꿈, '{gold:글자}' 색 지정(gold, muted, e0~e4, paper)
  function buildStory(r, a, C, R, opts = {}) {
    const P = r.pillars, E = a.EL_INFO
    const name = clean(opts.name)
    const lunar = r.lunar || { year: r.solar.year, month: r.solar.month, day: r.solar.day }
    const time = r.input.time
    const ds = P.day.stem, dEl = C.STEM_EL[ds]
    const season = ['', '봄', '봄', '봄', '여름', '여름', '여름', '가을', '가을', '가을', '겨울', '겨울', '겨울'][lunar.month]
    const dayPart = (h) => (h < 5 ? '새벽' : h < 12 ? '아침' : h < 17 ? '낮' : h < 21 ? '저녁' : '밤')
    const gl = (stem, branch) => [
      { ch: C.STEMS_H[stem], sub: `${C.STEMS[stem]}·${C.ELEMENTS[C.STEM_EL[stem]]}`, el: C.STEM_EL[stem] },
      { ch: C.BRANCHES_H[branch], sub: `${C.BRANCHES[branch]}·${C.ELEMENTS[C.BRANCH_EL[branch]]}`, el: C.BRANCH_EL[branch] },
    ]
    const gz = (stem, branch) => `{e${C.STEM_EL[stem]}:${C.STEMS_H[stem]}}{e${C.BRANCH_EL[branch]}:${C.BRANCHES_H[branch]}}`
    const badge = (g) => (g === '대길' || g === '길' ? { text: g, color: 'e0' } : g === '보통' ? { text: '보통', color: 'e3' } : { text: '주의', color: 'e1' })

    const hookTime = time ? `|${dayPart(time.hour)} {gold:${time.hour}시${time.minute ? ` ${time.minute}분` : ''}}에` : '에'
    const maxC = Math.max(...a.count)
    const maxEl = a.count.indexOf(maxC)
    const lack = a.count.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0)
    const lackWord = lack.map((i) => `${EL_WORD[i]}(${C.ELEMENTS_H[i]})`).join('·')
    const yf = a.yongFinal
    const yw = `${EL_WORD[yf]}(${C.ELEMENTS_H[yf]})`

    const topG = a.groupCount.indexOf(Math.max(...a.groupCount))
    const cards = [{ k: `{e${C.mod(dEl + topG, 5)}:${GROUP[topG][0]}}`, title: GROUP[topG][1], body: GROUP[topG][2] }]
    const sinCount = {}
    for (const s of a.sinsal) sinCount[s.name] = (sinCount[s.name] || 0) + 1
    const sinList = Object.entries(sinCount).sort((x, y) => (x[0] === '천을귀인' ? -1 : y[0] === '천을귀인' ? 1 : y[1] - x[1]))
    for (const [nm, cnt] of sinList) {
      if (cards.length >= 3 || !SINSAL[nm]) continue
      cards.push({ k: `{gold:${SINSAL[nm][0]}}`, title: `${nm}${cnt > 1 ? ` × ${cnt}` : ''}`, body: SINSAL[nm][1] })
    }
    if (cards.length < 3) {
      const st = a.cells.day.stage
      cards.push({ k: `{e${P.day.branchEl}:${C.BRANCHES_H[P.day.branch]}}`, title: `일지 ${st}`, body: a.STAGE_TEXT[st].replace(' – ', ' · ') })
    }
    if (cards.length < 3) cards.push({ k: `{e${dEl}:${C.STEMS_H[ds]}}`, title: '타고난 강점', body: R.DAY_MASTER[ds].good })

    const dwI = a.curDwInfo || a.daewoon[0]
    const dwLabel = a.curDwInfo ? `지금 ${Math.floor(a.age / 10) * 10 || 10}대 대운` : `${dwI.age}세부터 첫 대운`
    const dwBadge = dwI.good > 0 ? { text: '순풍', color: 'e0' } : dwI.good < 0 ? { text: '역풍', color: 'e1' } : { text: '평온', color: 'e3' }
    const dwText = dwI.good > 0 ? `나를 돕는 ${EL_WORD[yf]}의 기운이 들어온 시기` : dwI.good < 0 ? '내실을 다지며 버티면 기회가 오는 시기' : '큰 굴곡 없이 무난하게 흐르는 시기'
    const yearCard = (y) => ({ k: gz(y.pillar.stem, y.pillar.branch), title: `${y.year}년`, badge: badge(y.grade), body: sentence(y.text) })
    const acts = E[yf].act.split(',').map((s) => s.trim().replace(/ 키우기| 쬐기| 하기/g, ''))

    const eyebrow = (text) => ({ type: 'text', text, font: 'b', weight: 700, size: 38, color: 'gold', spacing: 0.18 })
    const scenes = [
      [
        { type: 'seal', size: 230, fx: 'stamp', t: 0 },
        { type: 'text', text: `${lunar.year}년 ${season}${hookTime}|태어난 ${name || '사람'}`, font: 'd', size: 92, lh: 1.25, t: 0.6 },
        { type: 'text', text: `${name ? name + '님의' : '그의'} 운명은?`, font: 'd', size: 66, color: 'muted', t: 1.2 },
      ],
      [
        { ...eyebrow('여덟 글자 세우기'), t: 0 },
        { type: 'pill', text: `음력 ${lunar.year}. ${lunar.leap ? '윤' : ''}${lunar.month}. ${lunar.day} · ${r.input.gender === 'M' ? '남' : '여'}`, t: 0.15 },
        { type: 'text', text: `▼ 양력 ${r.solar.year}. ${r.solar.month}. ${r.solar.day} · ${r.animal}띠`, font: 'b', size: 40, color: 'muted', t: 0.35 },
        {
          type: 'pillars', t: 0.7, step: 0.25,
          cols: [
            { label: '시', glyphs: P.hour ? gl(P.hour.stem, P.hour.branch) : [{ ch: '?', sub: '시간 모름', el: -1 }, { ch: '?', sub: '시간 모름', el: -1 }] },
            { label: '일', glyphs: gl(P.day.stem, P.day.branch), me: true },
            { label: '월', glyphs: gl(P.month.stem, P.month.branch) },
            { label: '년', glyphs: gl(P.year.stem, P.year.branch) },
          ],
        },
        { type: 'text', text: '네 기둥, 여덟 글자가|타고난 기운의 지도입니다', font: 'b', size: 44, t: 2.3 },
      ],
      [
        { ...eyebrow('나를 나타내는 글자'), t: 0 },
        { type: 'hero', ch: C.STEMS_H[ds], sub: `${C.STEMS[ds]}${C.ELEMENTS[dEl]} · ${DM[ds][1]}`, el: dEl, fx: 'zoom', t: 0.2 },
        { type: 'text', text: `${DM[ds][0]}|{e${dEl}:${DM[ds][1]}}${DM[ds][2]}`, font: 'd', size: 66, lh: 1.3, t: 0.9 },
        { type: 'text', text: DM[ds][3], font: 'b', size: 44, t: 1.6 },
      ],
      [
        { ...eyebrow('오행 밸런스'), t: 0 },
        { type: 'bars', t: 0.2, rows: a.count.map((c, i) => ({ label: `${C.ELEMENTS_H[i]} ${C.ELEMENTS[i]}`, el: i, n: c, w: maxC ? c / maxC : 0 })) },
        lack.length
          ? { type: 'alert', text: `${EL_WORD[maxEl]}${josa(EL_WORD[maxEl], '은', '는')} 넘치고, ${lackWord}${josa(lackWord, '은', '는')} 0개!`, color: 'e1', fx: 'pop', t: 1.8 }
          : { type: 'alert', text: '다섯 기운이 모두 있는 균형형!', color: 'e0', fx: 'pop', t: 1.8 },
        {
          type: 'text', font: 'b', size: 44, t: 2.5,
          text: a.strong
            ? `기운이 넘치는 {gold:${a.strength}} 사주 —|{e${yf}:${yw}}${josa(EL_WORD[yf], '으로', '로', true)} 흘려보내면 좋아요`
            : `기운을 쏟아내는 {gold:${a.strength.replace('(약간 신약)', '')}} 사주 —|나를 채워 줄 {e${yf}:${yw}}${josa(EL_WORD[yf], '이', '가')} 필요해요`,
        },
      ],
      [
        { ...eyebrow('타고난 무기'), t: 0 },
        { type: 'cards', t: 0.25, step: 0.5, cards },
        { type: 'text', text: `잘 맞는 길: ${R.DAY_MASTER[ds].job.replace(/, /g, ' · ')}`, font: 'b', size: 40, color: 'muted', t: 2.2 },
      ],
      [
        { ...eyebrow('운의 흐름'), t: 0 },
        { type: 'cards', t: 0.3, step: 0.5, cards: [{ k: gz(dwI.stem, dwI.branch), title: dwLabel, badge: dwBadge, body: dwText }, yearCard(a.thisYear), yearCard(a.nextYear)] },
      ],
      [
        { ...eyebrow('행운 처방'), t: 0 },
        {
          type: 'lucky', t: 0.15, step: 0.2,
          cells: [
            { label: '행운의 색', value: E[yf].color.split('·').slice(0, 2).join('·'), swatches: SWATCH[yf] },
            { label: '좋은 방향', value: E[yf].dir },
            { label: '행운의 숫자', value: E[yf].num.replace(', ', ' · ') },
            { label: '추천 습관', value: acts.slice(0, 2).join(' · ') },
          ],
        },
        { type: 'text', text: DM[ds][4], font: 'b', size: 44, t: 1.3 },
      ],
      [
        { type: 'seal', size: 190, fx: 'stamp', t: 0 },
        { type: 'text', text: '내 사주도 지금 확인!', font: 'd', size: 66, t: 0.2 },
        { type: 'cta', text: '사주 명식', fx: 'pop', t: 0.4 },
        { type: 'text', text: `${opts.example ? '예시 풀이' : name ? name + '님의 사주' : '나의 사주'} · 전통 명리 기반 참고용`, font: 'b', size: 32, color: 'muted', t: 0.6 },
      ],
    ]
    const story = { scenes: scenes.map((items, i) => ({ s: STARTS[i], e: STARTS[i + 1], items })) }
    // 글꼴 미리 읽기에 쓰는 전체 글자
    story.text = JSON.stringify(scenes).replace(/[{}"[\]:,]/g, '') + '四柱八字사주명식0123456789?▼·×—'
    story.fileName = `saju-shorts-${name || lunar.year + '-' + lunar.month + '-' + lunar.day}`
    return story
  }

  /* ---------- 그리기 도구 ---------- */
  const clamp = (x) => Math.max(0, Math.min(1, x))
  const easeOut = (x) => 1 - Math.pow(1 - x, 3)
  const easeBack = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2) }
  const col = (k) => COL[k] || k
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
  }
  // 서식 문자열 → 줄 배열 [[{t, c}]]
  function parseRich(text, base) {
    return String(text).split('|').map((line) => {
      const segs = []
      const re = /\{(\w+):([^}]*)\}/g
      let last = 0, m
      while ((m = re.exec(line))) {
        if (m.index > last) segs.push({ t: line.slice(last, m.index), c: base })
        segs.push({ t: m[2], c: m[1] })
        last = re.lastIndex
      }
      if (last < line.length) segs.push({ t: line.slice(last), c: base })
      return segs
    })
  }
  // 줄이 maxW 보다 길면 띄어쓰기 단위로 나눈다(단어가 너무 길면 글자 단위)
  function wrapRich(ctx, lines, maxW, spacing, size) {
    const out = []
    const width = (t) => ctx.measureText(t).width + spacing * size * t.length
    for (const segs of lines) {
      const tokens = []
      for (const s of segs) for (const part of s.t.split(/(\s+)/)) if (part) tokens.push({ t: part, c: s.c })
      let cur = [], w = 0
      const push = () => { while (cur.length && /^\s+$/.test(cur[cur.length - 1].t)) cur.pop(); if (cur.length) out.push(cur); cur = []; w = 0 }
      for (const tk of tokens) {
        const tw = width(tk.t)
        if (w + tw > maxW && cur.length && !/^\s+$/.test(tk.t)) push()
        if (!cur.length && /^\s+$/.test(tk.t)) continue
        if (tw > maxW) {
          for (const ch of tk.t) { const cw = width(ch); if (w + cw > maxW) push(); cur.push({ t: ch, c: tk.c }); w += cw }
        } else { cur.push(tk); w += tw }
      }
      push()
    }
    return out
  }
  function drawRichLine(ctx, segs, cx, y, spacing, size, align = 'center') {
    const width = (t) => ctx.measureText(t).width + spacing * size * t.length
    const total = segs.reduce((s, g) => s + width(g.t), 0)
    let x = align === 'center' ? cx - total / 2 : cx
    ctx.textAlign = 'left'
    for (const g of segs) {
      ctx.fillStyle = col(g.c)
      if (spacing) { for (const ch of g.t) { ctx.fillText(ch, x, y); x += width(ch) } }
      else { ctx.fillText(g.t, x, y); x += width(g.t) }
    }
    return total
  }

  /* ---------- 항목별 크기 계산과 그리기 ---------- */
  const CW = 900 // 본문 폭
  function fontOf(it) { return it.font === 'd' ? FONT.d(it.size) : it.font === 'h' ? FONT.h(it.size) : FONT.b(it.size, it.weight || 500) }

  function measure(ctx, it) {
    switch (it.type) {
      case 'seal': return it.size + 10
      case 'text': {
        ctx.font = fontOf(it)
        it._lines = wrapRich(ctx, parseRich(it.text, it.color || 'paper'), CW, it.spacing || 0, it.size)
        return it._lines.length * it.size * (it.lh || 1.5)
      }
      case 'pill': return 92
      case 'pillars': return 34 + 16 + 190 * 2 + 16 * 2
      case 'hero': return 380
      case 'bars': return it.rows.length * 46 + (it.rows.length - 1) * 30 + 20
      case 'alert': {
        ctx.font = FONT.b(52, 900)
        it._lines = wrapRich(ctx, parseRich(it.text, it.color), CW - 80, 0, 52)
        return it._lines.length * 70 + 48
      }
      case 'cards': {
        it._h = it.cards.map((c) => {
          ctx.font = FONT.b(40)
          c._body = wrapRich(ctx, parseRich(c.body, 'paper'), CW - 72 - 178, 0, 40)
          return Math.max(150, 60 + 62 + c._body.length * 58)
        })
        return it._h.reduce((s, h) => s + h, 0) + 26 * (it.cards.length - 1)
      }
      case 'lucky': return 2 * 170 + 24
      case 'cta': return 116
    }
    return 0
  }

  function drawGlyph(ctx, x, y, size, g, me) {
    ctx.save()
    if (me) { ctx.shadowColor = 'rgba(242,207,122,.65)'; ctx.shadowBlur = size * 0.3 }
    rrect(ctx, x, y, size, size, size * 0.115)
    ctx.fillStyle = g.el >= 0 ? COL['e' + g.el] : 'rgba(255,255,255,.08)'
    ctx.fill()
    ctx.restore()
    if (me) { ctx.save(); rrect(ctx, x - 6, y - 6, size + 12, size + 12, size * 0.14); ctx.lineWidth = 8; ctx.strokeStyle = COL.paper; ctx.stroke(); ctx.restore() }
    const fg = g.el >= 0 ? COL.ink : COL.muted
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.font = FONT.h(Math.round(size * 0.63)); ctx.fillText(g.ch, x + size / 2, y + size * 0.43)
    ctx.font = FONT.b(Math.round(size * 0.16), 700); ctx.fillText(g.sub, x + size / 2, y + size * 0.84)
  }

  function anim(fx, lt, t0) {
    const p = clamp((lt - t0) / 0.5), q = easeOut(p)
    const o = { a: p > 0 ? Math.min(1, p * 2) : 0, dx: 0, dy: 0, s: 1, rot: 0 }
    if (fx === 'stamp') { o.s = 1 + (1 - easeOut(clamp((lt - t0) / 0.35))) * 1.6; o.rot = -5 }
    else if (fx === 'drop') o.dy = (1 - easeBack(p)) * -160
    else if (fx === 'zoom') o.s = 0.4 + 0.6 * easeBack(p)
    else if (fx === 'pop') o.s = 0.6 + 0.4 * easeBack(p)
    else if (fx === 'slide') o.dx = (1 - q) * 120
    else o.dy = (1 - q) * 46
    return o
  }
  function withAnim(ctx, o, cx, cy, fn) {
    if (o.a <= 0) return
    ctx.save()
    ctx.globalAlpha *= o.a
    ctx.translate(cx + o.dx, cy + o.dy)
    if (o.rot) ctx.rotate((o.rot * Math.PI) / 180)
    if (o.s !== 1) ctx.scale(o.s, o.s)
    ctx.translate(-cx, -cy)
    fn()
    ctx.restore()
  }

  function drawItem(ctx, it, y, h, lt) {
    const cx = W / 2
    const base = (fn) => withAnim(ctx, anim(it.fx, lt, it.t), cx, y + h / 2, fn)
    ctx.textBaseline = 'middle'
    switch (it.type) {
      case 'seal': return base(() => {
        const s = it.size, x = cx - s / 2
        rrect(ctx, x, y, s, s, s * 0.11); ctx.lineWidth = s * 0.035; ctx.strokeStyle = COL.seal; ctx.stroke()
        ctx.fillStyle = COL.seal; ctx.textAlign = 'center'; ctx.font = FONT.h(Math.round(s * 0.365))
        ctx.fillText('四柱', cx, y + s * 0.3); ctx.fillText('八字', cx, y + s * 0.69)
      })
      case 'text': return base(() => {
        ctx.font = fontOf(it)
        const lh = it.size * (it.lh || 1.5)
        it._lines.forEach((segs, i) => drawRichLine(ctx, segs, cx, y + lh * i + lh / 2, it.spacing || 0, it.size))
      })
      case 'pill': return base(() => {
        ctx.font = FONT.b(46, 700)
        const w = ctx.measureText(it.text).width + 68
        rrect(ctx, cx - w / 2, y, w, 92, 46); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(244,239,228,.35)'; ctx.stroke()
        ctx.fillStyle = COL.paper; ctx.textAlign = 'center'; ctx.fillText(it.text, cx, y + 47)
      })
      case 'pillars': {
        const gw = 190, gap = 22, total = gw * 4 + gap * 3
        it.cols.forEach((c, i) => {
          const x = cx - total / 2 + i * (gw + gap)
          withAnim(ctx, anim('drop', lt, it.t + i * it.step), x + gw / 2, y + h / 2, () => {
            ctx.font = FONT.b(34, 700); ctx.fillStyle = COL.muted; ctx.textAlign = 'center'; ctx.fillText(c.label, x + gw / 2, y + 17)
            c.glyphs.forEach((g, j) => drawGlyph(ctx, x, y + 50 + j * (gw + 16), gw, g, c.me && j === 0))
          })
        })
        return
      }
      case 'hero': return base(() => drawGlyph(ctx, cx - 180, y + 10, 360, it, true))
      case 'bars': {
        it.rows.forEach((r, i) => {
          const ry = y + 10 + i * 76
          withAnim(ctx, anim('', lt, it.t + i * 0.1), cx, ry + 23, () => {
            const p = easeOut(clamp((lt - it.t - 0.2 - i * 0.1) / 1.0))
            ctx.font = FONT.b(48, 900); ctx.textAlign = 'left'; ctx.fillStyle = COL['e' + r.el]; ctx.fillText(r.label, 90, ry + 23)
            const tx = 90 + 174, tw = CW - 174 - 134
            rrect(ctx, tx, ry, tw, 46, 23); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill()
            if (r.w > 0 && p > 0) { ctx.save(); ctx.globalAlpha *= Math.min(1, p * 4); rrect(ctx, tx, ry, Math.max(46, tw * r.w * p), 46, 23); ctx.fillStyle = COL['e' + r.el]; ctx.fill(); ctx.restore() }
            ctx.textAlign = 'right'; ctx.fillStyle = r.n === 0 ? COL.e1 : COL.paper; ctx.fillText(String(Math.round(r.n * p)), 90 + CW, ry + 23)
          })
        })
        return
      }
      case 'alert': return base(() => {
        ctx.font = FONT.b(52, 900)
        const w = Math.max(...it._lines.map((l) => l.reduce((s, g) => s + ctx.measureText(g.t).width, 0))) + 80
        rrect(ctx, cx - w / 2, y, w, h, 20); ctx.fillStyle = it.color === 'e0' ? 'rgba(95,191,122,.16)' : 'rgba(240,112,90,.16)'; ctx.fill()
        it._lines.forEach((segs, i) => drawRichLine(ctx, segs, cx, y + 24 + 35 + i * 70, 0, 52))
      })
      case 'cards': {
        let cy = y
        it.cards.forEach((c, i) => {
          const ch = it._h[i], top = cy
          withAnim(ctx, anim('slide', lt, it.t + i * it.step), cx, top + ch / 2, () => {
            rrect(ctx, 90, top, CW, ch, 26); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill()
            ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke()
            // 왼쪽 한자(2글자면 세로로)
            const k = parseRich(c.k, 'paper')[0]
            const chars = []; k.forEach((g) => { for (const x of g.t) chars.push({ t: x, c: g.c }) })
            ctx.font = FONT.h(76); ctx.textAlign = 'center'
            chars.forEach((g, j) => { ctx.fillStyle = col(g.c); ctx.fillText(g.t, 90 + 36 + 75, top + ch / 2 + (j - (chars.length - 1) / 2) * 84) })
            const vx = 90 + 36 + 150 + 28
            const textH = 62 + c._body.length * 58
            let ty = top + (ch - textH) / 2
            ctx.font = FONT.b(46, 900); ctx.textAlign = 'left'; ctx.fillStyle = COL.paper; ctx.fillText(c.title, vx, ty + 31)
            if (c.badge) {
              const bx = vx + ctx.measureText(c.title).width + 16
              ctx.font = FONT.b(34, 900)
              const bw = ctx.measureText(c.badge.text).width + 36
              rrect(ctx, bx, ty + 8, bw, 48, 10); ctx.fillStyle = COL[c.badge.color]; ctx.fill()
              ctx.fillStyle = COL.ink; ctx.fillText(c.badge.text, bx + 18, ty + 33)
            }
            ty += 62
            ctx.font = FONT.b(40)
            c._body.forEach((segs, j) => drawRichLine(ctx, segs, vx, ty + 29 + j * 58, 0, 40, 'left'))
          })
          cy += ch + 26
        })
        return
      }
      case 'lucky': {
        const cw = (CW - 24) / 2
        it.cells.forEach((c, i) => {
          const x = 90 + (i % 2) * (cw + 24), cy = y + Math.floor(i / 2) * (170 + 24)
          withAnim(ctx, anim('pop', lt, it.t + i * it.step), x + cw / 2, cy + 85, () => {
            rrect(ctx, x, cy, cw, 170, 26); ctx.fillStyle = 'rgba(111,156,240,.14)'; ctx.fill()
            ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(111,156,240,.4)'; ctx.stroke()
            ctx.textAlign = 'center'; ctx.font = FONT.b(34, 700); ctx.fillStyle = COL.muted; ctx.fillText(c.label, x + cw / 2, cy + 52)
            ctx.font = FONT.b(c.value.length > 7 ? 44 : 54, 900)
            const tw = ctx.measureText(c.value).width
            const sw = c.swatches ? c.swatches.length * 52 : 0
            let sx = x + cw / 2 - (tw + sw) / 2
            if (c.swatches) c.swatches.forEach((s) => {
              ctx.beginPath(); ctx.arc(sx + 23, cy + 115, 23, 0, Math.PI * 2); ctx.fillStyle = s; ctx.fill()
              ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.stroke(); sx += 52
            })
            ctx.fillStyle = COL.paper; ctx.textAlign = 'left'; ctx.fillText(c.value, sx, cy + 117)
          })
        })
        return
      }
      case 'cta': return base(() => {
        ctx.font = FONT.b(46, 900)
        const w = ctx.measureText(it.text).width + 108
        rrect(ctx, cx - w / 2, y, w, 116, 58); ctx.fillStyle = COL.paper; ctx.fill()
        ctx.fillStyle = COL.ink; ctx.textAlign = 'center'; ctx.fillText(it.text, cx, y + 60)
      })
    }
  }

  /* ---------- 프레임 ---------- */
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const STARS = Array.from({ length: 70 }, () => [rnd() * W, rnd() * H, 1 + rnd() * 2, rnd() * 6.28, 0.5 + rnd()])

  function layout(ctx, scene) {
    if (scene._layout) return scene._layout
    const GAP = 34
    const hs = scene.items.map((it) => measure(ctx, it))
    const total = hs.reduce((s, h) => s + h, 0) + GAP * (hs.length - 1)
    // 위쪽 220px, 아래쪽 440px(쇼츠 버튼 영역)을 피해 가운데 정렬
    let y = 220 + (H - 220 - 440 - total) / 2
    scene._layout = hs.map((h) => { const r = [y, h]; y += h + GAP; return r })
    return scene._layout
  }

  function drawFrame(ctx, story, t) {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    const g = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, 1100)
    g.addColorStop(0, COL.bg2); g.addColorStop(0.7, COL.bg1); g.addColorStop(1, COL.bg1)
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    const m = ctx.createRadialGradient(W - 172, 88, 0, W - 120, 140, 260) // 달: 왼쪽 위가 밝게
    m.addColorStop(0, 'rgba(244,239,228,.22)'); m.addColorStop(0.6, 'rgba(244,239,228,.04)'); m.addColorStop(1, 'rgba(244,239,228,0)')
    ctx.fillStyle = m; ctx.beginPath(); ctx.arc(W - 120, 140, 260, 0, Math.PI * 2); ctx.fill()
    ctx.save()
    ctx.translate(W / 2, H * 0.52 - t * 6); ctx.rotate((t * 0.3 * Math.PI) / 180)
    ctx.font = FONT.h(760); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(255,255,255,.035)'
    ctx.fillText('命', 0, 0)
    ctx.restore()
    for (const [x, y, r, ph, sp] of STARS) {
      ctx.globalAlpha = 0.15 + 0.5 * (0.5 + 0.5 * Math.sin(t * sp * 2 + ph))
      ctx.fillStyle = COL.paper; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = COL.gold; ctx.fillRect(0, 0, (W * Math.min(t, DURATION)) / DURATION, 10)
    ctx.font = FONT.b(30, 700); ctx.fillStyle = COL.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    drawRichLine(ctx, [{ t: '四柱八字 · 사주 명식', c: 'muted' }], 90, 135, 0.1, 30, 'left')

    for (const sc of story.scenes) {
      if (t < sc.s - 0.01 || t >= sc.e) continue
      const out = clamp((sc.e - t) / 0.35)
      const lay = layout(ctx, sc)
      ctx.save()
      ctx.globalAlpha = out
      ctx.translate(0, (1 - out) * -40)
      sc.items.forEach((it, i) => drawItem(ctx, it, lay[i][0], lay[i][1], t - sc.s))
      ctx.restore()
    }
    ctx.restore()
  }

  /* ---------- 배경음악 (가야금 느낌 5음계 + 장면 전환 징 + 패드) ---------- */
  function musicSamples(sr = 44100, duration = DURATION, sceneStarts = STARTS.slice(0, -1), seedIn = 3) {
    const T = duration + 0.5, n = Math.floor(sr * T), out = new Float32Array(n), TAU = Math.PI * 2
    let s = seedIn
    const rand = () => (s = (s * 16807) % 2147483647) / 2147483647
    const pluck = (f, start, dur, amp) => {
      const i0 = Math.floor(start * sr), mlen = Math.min(n - i0, Math.floor(dur * sr))
      let ph = 0
      for (let j = 0; j < mlen; j++) {
        const tt = j / sr
        ph += (TAU * f * (1 + 0.012 * Math.exp(-tt * 8))) / sr
        out[i0 + j] += amp * Math.exp(-tt * 3.2) * (1 - Math.exp(-tt * 400)) * (Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * Math.sin(3 * ph))
      }
    }
    const gong = (start, f = 73.4, amp = 0.35) => {
      const i0 = Math.floor(start * sr), mlen = Math.min(n - i0, Math.floor(3.5 * sr))
      for (let j = 0; j < mlen; j++) {
        const tt = j / sr
        out[i0 + j] += amp * Math.exp(-tt * 1.3) * (1 - Math.exp(-tt * 200)) *
          (Math.sin(TAU * f * tt) + 0.5 * Math.sin(TAU * f * 2.76 * tt) * Math.exp(-tt * 2) + 0.3 * Math.sin(TAU * f * 5.4 * tt) * Math.exp(-tt * 4))
      }
    }
    const scale = [293.66, 329.63, 392.0, 440.0, 493.88, 587.33, 659.25]
    const beat = 60 / 96
    let k = 3
    for (let b = 0; b * beat < duration - 0.8; b++) {
      if ((b % 8 === 3 || b % 8 === 7) && rand() < 0.5) continue
      k = Math.max(0, Math.min(scale.length - 1, k + Math.floor(rand() * 5) - 2))
      pluck(scale[k], b * beat, 1.6, b % 2 ? 0.16 : 0.22)
      if (b % 4 === 0) pluck(scale[k] / 2, b * beat, 2.2, 0.12)
    }
    for (const st of sceneStarts) gong(st)
    let peak = 0
    for (let j = 0; j < n; j++) {
      const tt = j / sr
      out[j] += (Math.sin(TAU * 146.83 * tt) + 0.6 * Math.sin(TAU * 220 * tt) + 0.4 * Math.sin(TAU * 293.66 * 1.002 * tt)) * 0.05 * (0.7 + 0.3 * Math.sin((TAU * tt) / 8))
      out[j] *= Math.max(0, Math.min(1, tt / 0.6, (T - tt) / 1.5))
      peak = Math.max(peak, Math.abs(out[j]))
    }
    const gain = 1 / (peak * 1.15 || 1)
    for (let j = 0; j < n; j++) out[j] *= gain
    return out
  }

  // 글꼴을 미리 읽어 첫 프레임부터 한글이 제대로 나오게 한다 (구글 폰트는 글자 범위별로 나뉘어 있다)
  async function loadFonts(story, doc) {
    if (!doc || !doc.fonts) return
    const specs = [FONT.d(40), FONT.h(40), FONT.b(40, 500), FONT.b(40, 700), FONT.b(40, 900)]
    await Promise.all(specs.map((f) => doc.fonts.load(f, story.text).catch(() => null)))
    await doc.fonts.ready
  }

  return { W, H, FPS, DURATION, STARTS, buildStory, drawFrame, musicSamples, loadFonts, josa }
})
