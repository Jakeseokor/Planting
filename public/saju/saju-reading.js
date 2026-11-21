/* 사주 해석: 오행·십성·신강약·용신·신살·합충·대운·세운 → 풀이 문장 */
;(function (root, factory) {
  const api = factory(root.SajuCore || (typeof require === 'function' ? require('./saju-core.js') : null))
  if (typeof module === 'object' && module.exports) module.exports = api
  else root.SajuReading = api
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict'
  const { mod, STEM_EL, BRANCH_EL, MAIN_HIDDEN, HIDDEN, tenGod, stage, ELEMENTS } = C

  const EL_INFO = [
    { name: '목(木)', nature: '나무', color: '초록·청색', dir: '동쪽', num: '3, 8', season: '봄', organ: '간·담', taste: '신맛', act: '산책, 식물 키우기, 독서, 새 배움 시작하기', key: '성장·인자함' },
    { name: '화(火)', nature: '불', color: '빨강·주황·보라', dir: '남쪽', num: '2, 7', season: '여름', organ: '심장·소장', taste: '쓴맛', act: '햇볕 쬐기, 유산소 운동, 사람 만나기, 발표·표현 활동', key: '열정·예의' },
    { name: '토(土)', nature: '흙', color: '노랑·베이지·갈색', dir: '중앙', num: '5, 10', season: '환절기', organ: '위장·비장', taste: '단맛', act: '규칙적인 생활, 저축, 등산·흙 만지기, 약속 지키기', key: '신용·포용' },
    { name: '금(金)', nature: '쇠', color: '흰색·금색·은색', dir: '서쪽', num: '4, 9', season: '가을', organ: '폐·대장', taste: '매운맛', act: '정리정돈, 계획표 쓰기, 호흡 운동, 악기 연습', key: '결단·의리' },
    { name: '수(水)', nature: '물', color: '검정·남색', dir: '북쪽', num: '1, 6', season: '겨울', organ: '신장·방광', taste: '짠맛', act: '수영, 명상, 충분한 수면, 공부·연구', key: '지혜·유연함' },
  ]

  const DAY_MASTER = [
    { img: '큰 나무(甲木)', core: '곧게 위로 자라는 큰 나무처럼 우직하고 리더십이 있습니다.', good: '추진력, 정의감, 책임감, 맏이 기질', weak: '고집이 세고 굽힐 줄 몰라 부러지기 쉽습니다.', job: '기획·경영, 교육, 건축, 공공 분야' },
    { img: '꽃과 넝쿨(乙木)', core: '부드럽게 휘어지며 어디서든 살아남는 넝쿨처럼 유연하고 생활력이 강합니다.', good: '적응력, 친화력, 섬세함, 실속', weak: '남 눈치를 많이 보고 속으로 끙끙 앓기 쉽습니다.', job: '디자인, 상담, 서비스, 협상·영업' },
    { img: '태양(丙火)', core: '모두를 고르게 비추는 태양처럼 밝고 솔직하며 표현력이 뛰어납니다.', good: '열정, 낙천성, 화끈함, 대중성', weak: '쉽게 달아오르고 쉽게 식으며, 뒷마무리가 약할 수 있습니다.', job: '방송·홍보, 강연, 영업, 엔터테인먼트' },
    { img: '촛불·등불(丁火)', core: '어둠을 밝히는 촛불처럼 따뜻하고 섬세하며 집중력이 깊습니다.', good: '배려심, 집중력, 예술 감각, 헌신', weak: '예민하고 감정 기복이 있어 혼자 상처받기 쉽습니다.', job: '연구, 의료·복지, 예술, 교육' },
    { img: '큰 산(戊土)', core: '흔들리지 않는 큰 산처럼 듬직하고 믿음직하며 중재를 잘합니다.', good: '신용, 포용력, 인내, 안정감', weak: '변화에 느리고 속마음을 잘 드러내지 않아 답답해 보일 수 있습니다.', job: '부동산·건설, 금융, 행정, 중개' },
    { img: '논밭(己土)', core: '씨앗을 품어 기르는 논밭처럼 알뜰하고 다정하며 실속을 챙깁니다.', good: '현실 감각, 꼼꼼함, 보살핌, 저축', weak: '생각이 많고 걱정이 지나쳐 기회를 놓치기 쉽습니다.', job: '회계·재무, 교육, 요식업, 관리직' },
    { img: '바위·무쇠(庚金)', core: '단단한 바위와 무쇠처럼 결단력 있고 의리가 강합니다.', good: '결단력, 의리, 실행력, 개혁 정신', weak: '말이 직설적이라 의도치 않게 상처를 줄 수 있습니다.', job: '군·경찰, 법조, 엔지니어, 스포츠' },
    { img: '보석(辛金)', core: '갈고닦은 보석처럼 깔끔하고 자존심이 강하며 감각이 예리합니다.', good: '완벽주의, 미적 감각, 분석력, 품위', weak: '예민하고 남의 평가에 민감해 스트레스를 많이 받습니다.', job: '금융·IT, 패션·뷰티, 의료, 감정·평가' },
    { img: '바다·큰 강(壬水)', core: '넓은 바다처럼 포용력이 크고 지혜롭고 스케일이 큽니다.', good: '지혜, 기획력, 유연함, 큰 그림', weak: '변덕스럽고 생각이 너무 넓어 실행이 흐트러질 수 있습니다.', job: '무역·유통, 기획, 연구, 여행·물류' },
    { img: '비·이슬(癸水)', core: '조용히 스며드는 빗물처럼 총명하고 차분하며 상상력이 풍부합니다.', good: '총명함, 인내, 직관, 배려', weak: '걱정과 비관이 많고 속을 잘 털어놓지 않습니다.', job: '연구·학술, 상담·심리, 기획, 예술' },
  ]

  const GROUP_TEXT = {
    // [많을 때, 없을 때]
    0: ['자존심과 독립심이 강해 내 길을 가는 타입. 다만 경쟁·고집으로 돈과 사람을 잃지 않도록 주의.', '혼자 버티는 힘이 약해 주변에 휘둘리기 쉬움. 내 편이 되어 줄 동료·모임을 만들면 좋습니다.'],
    1: ['말·손재주·아이디어가 넘치는 표현가. 재능을 결과물로 남기되 말실수와 산만함을 조심.', '생각을 밖으로 꺼내는 것이 서툼. 글쓰기·기록 습관이 재능을 열어 줍니다.'],
    2: ['돈 감각과 현실 감각이 뛰어나고 활동적. 욕심을 줄이고 체력 관리를 하면 재물이 오래 머뭅니다.', '돈보다 명분·관계를 중시. 자동이체 저축 등 시스템으로 재물을 관리하세요.'],
    3: ['책임감·명예심이 강하고 조직에 잘 맞음. 스스로를 너무 몰아붙이지 않도록 휴식이 필요합니다.', '틀에 얽매이기 싫어하는 자유인. 자격증·마감 같은 외부 규칙을 일부러 두면 성과가 납니다.'],
    4: ['배움과 생각이 깊고 윗사람 덕이 있음. 생각만 하다 실행이 늦어지지 않게 마감을 정하세요.', '스스로 길을 개척하는 자수성가형. 멘토를 한 명 두면 시행착오가 크게 줄어듭니다.'],
  }

  const GOD_YEAR = {
    비견: '내 힘이 커지는 해. 독립·창업 의지가 생기지만 동업·보증은 신중히.',
    겁재: '경쟁과 지출이 늘어나는 해. 큰 투자·돈거래는 피하고 실력을 쌓으세요.',
    식신: '여유와 즐거움의 해. 재능을 발휘하고 건강·먹을 복이 따릅니다.',
    상관: '변화와 표현의 해. 새로운 도전은 좋지만 윗사람과의 언쟁·말실수 주의.',
    편재: '돈의 흐름이 크게 움직이는 해. 활동 범위가 넓어지나 무리한 투자는 금물.',
    정재: '안정적인 수입과 성실한 결실의 해. 저축·자산 정리에 좋습니다.',
    편관: '압박과 책임이 커지는 해. 건강과 과로를 챙기면 실력이 한 단계 올라갑니다.',
    정관: '명예·승진·안정의 해. 조직에서 인정받고 결혼·계약 운도 좋습니다.',
    편인: '공부·직관·전환의 해. 자격증·연구에 좋으나 생각이 많아질 수 있습니다.',
    정인: '도움과 문서의 해. 윗사람의 지원, 합격·계약·부동산 문서운이 있습니다.',
  }

  const STAGE_TEXT = {
    장생: '새로 태어나는 기운 – 시작이 순조로움', 목욕: '꾸미고 드러내는 기운 – 인기·변덕', 관대: '성장하는 청년 기운 – 자신감·추진력',
    건록: '자립한 장년 기운 – 실력·안정', 제왕: '정점의 기운 – 강한 주도권', 쇠: '원숙한 기운 – 노련함·신중함',
    병: '쉬어 가는 기운 – 섬세함·배려', 사: '멈추는 기운 – 깊은 사색', 묘: '저장하는 기운 – 알뜰함·집중',
    절: '끊고 새로 잇는 기운 – 변화·결단', 태: '잉태의 기운 – 가능성·호기심', 양: '길러지는 기운 – 보호·안정',
  }

  const SIX_HARMONY = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]]
  const SAMHAP = [[[8, 0, 4], 4, '신자진 수국'], [[2, 6, 10], 1, '인오술 화국'], [[5, 9, 1], 3, '사유축 금국'], [[11, 3, 7], 0, '해묘미 목국']]
  const groupOf = (b) => [[2, 6, 10], [8, 0, 4], [5, 9, 1], [11, 3, 7]].findIndex((g) => g.includes(b))
  const DOHWA = [3, 9, 6, 0], YEOKMA = [8, 2, 11, 5], HWAGAE = [10, 4, 1, 7]
  const CHEONEUL = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [2, 6], [5, 3], [5, 3]]
  const MUNCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3]
  const YANGIN = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 }
  const GOEGANG = ['경진', '경술', '임진', '임술', '무술']

  const POS = ['year', 'month', 'day', 'hour']
  const POS_KO = { year: '년주', month: '월주', day: '일주', hour: '시주' }
  const POS_MEAN = { year: '조상·어린 시절', month: '부모·사회·청년기', day: '나·배우자·중년기', hour: '자녀·말년' }

  function analyze(r, today) {
    const P = r.pillars
    const ds = P.day.stem
    const dayEl = STEM_EL[ds]
    const list = POS.filter((k) => P[k])

    // 오행 분포 (겉 글자) + 지장간 포함 가중치
    const count = [0, 0, 0, 0, 0]
    const weighted = [0, 0, 0, 0, 0]
    for (const k of list) {
      count[P[k].stemEl]++
      count[P[k].branchEl]++
      weighted[P[k].stemEl] += 1
      const h = HIDDEN[P[k].branch]
      const w = h.length === 2 ? [0.3, 0.7] : [0.2, 0.2, 0.6]
      h.forEach((s, i) => (weighted[STEM_EL[s]] += w[i] * (k === 'month' ? 1.5 : 1)))
    }

    // 십성·12운성
    const cells = {}
    for (const k of list) {
      const p = P[k]
      cells[k] = {
        stemGod: k === 'day' ? { name: '일간(나)', group: -1 } : tenGod(ds, p.stem),
        branchGod: tenGod(ds, MAIN_HIDDEN[p.branch]),
        hidden: HIDDEN[p.branch].map((s) => ({ stem: s, god: tenGod(ds, s).name })),
        stage: stage(ds, p.branch),
      }
    }
    const groupCount = [0, 0, 0, 0, 0]
    for (const k of list) {
      if (k !== 'day') groupCount[cells[k].stemGod.group]++
      groupCount[cells[k].branchGod.group]++
    }

    // 신강·신약 (득령·득지·득세 가중 점수)
    const weights = { year: [1, 1], month: [1, 3], day: [0, 1.5], hour: [1, 1] }
    let sup = 0, tot = 0
    for (const k of list) {
      const [ws, wb] = weights[k]
      if (ws) { tot += ws; const g = tenGod(ds, P[k].stem).group; if (g === 0 || g === 4) sup += ws }
      tot += wb
      const g2 = tenGod(ds, MAIN_HIDDEN[P[k].branch]).group
      if (g2 === 0 || g2 === 4) sup += wb
    }
    const ratio = sup / tot
    const strength = ratio >= 0.62 ? '매우 신강' : ratio >= 0.5 ? '신강' : ratio >= 0.4 ? '중화(약간 신약)' : ratio >= 0.28 ? '신약' : '매우 신약'
    const strong = ratio >= 0.5

    // 용신 (억부 + 조후 보정)
    const elOf = (g) => mod(dayEl + g, 5)
    let yong, reason
    if (strong) {
      const bi = groupCount[0], in_ = groupCount[4]
      if (in_ > bi) { yong = elOf(2); reason = '인성(나를 돕는 기운)이 넘쳐 생각이 많으니, 재성으로 현실 감각을 더해 균형을 잡습니다.' }
      else if (bi >= 3) { yong = elOf(3); reason = '비겁(나와 같은 기운)이 강해 고집이 세지기 쉬우니, 관성으로 절제와 방향을 잡아 줍니다.' }
      else { yong = elOf(1); reason = '기운이 넉넉하니 식상으로 재능을 밖으로 흘려보내면 막힘없이 풀립니다.' }
    } else {
      if (groupCount[3] >= groupCount[1] && groupCount[3] >= groupCount[2]) { yong = elOf(4); reason = '관성(압박)이 강해 지치기 쉬우니, 인성으로 압박을 배움과 도움으로 바꿉니다.' }
      else { yong = elOf(0); reason = '식상·재성으로 힘이 빠져나가니, 비겁(동료·자기 힘)으로 체력을 보충해야 합니다.' }
    }
    const mb = P.month.branch
    let johu = null
    if ([11, 0, 1].includes(mb) && count[1] === 0) johu = { el: 1, text: '추운 겨울에 태어났는데 화(火)가 없어 몸과 마음이 차기 쉽습니다. 따뜻한 기운(햇볕·운동·붉은색)을 꼭 보충하세요.' }
    if ([5, 6, 7].includes(mb) && count[4] === 0) johu = { el: 4, text: '뜨거운 여름에 태어났는데 수(水)가 없어 쉽게 과열됩니다. 충분한 수분·수면·휴식으로 식혀 주세요.' }
    const hee = mod(yong - 1, 5) // 용신을 생하는 희신
    const giEl = mod(yong - 2, 5) // 용신을 극하는 기신

    // 신살
    const sinsal = []
    const branches = list.map((k) => [k, P[k].branch])
    const addIf = (name, target, base, desc) => {
      for (const [k, b] of branches) if (target.includes(b)) sinsal.push({ name, pos: POS_KO[k], base, desc })
    }
    addIf('천을귀인', CHEONEUL[ds], '일간', '어려울 때 귀인이 나타나 돕는 최고의 길신')
    addIf('문창귀인', [MUNCHANG[ds]], '일간', '총명하고 글·시험에 강함')
    if (YANGIN[ds] !== undefined) addIf('양인', [YANGIN[ds]], '일간', '강한 추진력과 승부욕, 다만 다툼·부상 주의')
    for (const [baseKey, baseName] of [['year', '년지'], ['day', '일지']]) {
      const g = groupOf(P[baseKey].branch)
      for (const [k, b] of branches) {
        if (k === baseKey) continue
        if (b === DOHWA[g]) sinsal.push({ name: '도화살', pos: POS_KO[k], base: baseName, desc: '매력·인기가 많아 사람이 따름 (요즘은 연예·영업에 유리)' })
        if (b === YEOKMA[g]) sinsal.push({ name: '역마살', pos: POS_KO[k], base: baseName, desc: '이동·변화가 많음. 해외·출장·무역에 유리' })
        if (b === HWAGAE[g]) sinsal.push({ name: '화개살', pos: POS_KO[k], base: baseName, desc: '예술·종교·학문적 감수성, 혼자만의 시간이 필요' })
      }
    }
    if (GOEGANG.includes(P.day.ko)) sinsal.push({ name: '괴강살', pos: '일주', base: '일주', desc: '카리스마와 강한 리더십, 극단을 피하면 크게 성공' })
    const seen = new Set()
    const sinsalU = sinsal.filter((s) => { const key = s.name + s.pos; if (seen.has(key)) return false; seen.add(key); return true })

    // 합·충
    const relations = []
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = P[list[i]], b = P[list[j]], pa = POS_KO[list[i]], pb = POS_KO[list[j]]
      const sd = mod(a.stem - b.stem, 10)
      if (sd === 5) relations.push({ type: '합', text: `${pa}·${pb} 천간합 (${C.STEMS[a.stem]}${C.STEMS[b.stem]}합)`, desc: '서로 끌어당겨 협력' })
      if (Math.abs(a.stem - b.stem) === 6)
        relations.push({ type: '충', text: `${pa}·${pb} 천간충 (${C.STEMS[a.stem]}${C.STEMS[b.stem]}충)`, desc: '생각·방향의 충돌' })
      if (SIX_HARMONY.some(([x, y]) => (x === a.branch && y === b.branch) || (y === a.branch && x === b.branch)))
        relations.push({ type: '합', text: `${pa}·${pb} 육합 (${C.BRANCHES[a.branch]}${C.BRANCHES[b.branch]}합)`, desc: '인연·화합, 도와주는 관계' })
      if (mod(a.branch - b.branch, 12) === 6)
        relations.push({ type: '충', text: `${pa}·${pb} 충 (${C.BRANCHES[a.branch]}${C.BRANCHES[b.branch]}충)`, desc: `${POS_MEAN[list[i]]}과 ${POS_MEAN[list[j]]} 사이 변동·이동` })
    }
    const bset = new Set(list.map((k) => P[k].branch))
    for (const [g, el, name] of SAMHAP) if (g.every((b) => bset.has(b))) relations.push({ type: '합', text: `삼합 (${name})`, desc: `${ELEMENTS[el]} 기운이 크게 강해짐` })

    // 대운·세운
    const now = today || new Date()
    const curYear = now.getFullYear()
    const age = curYear - r.solar.year // 만 나이 근사(연 단위)
    const dw = r.daewoon.list
    let curDw = dw.findIndex((d, i) => age >= d.age && (i === dw.length - 1 || age < dw[i + 1].age))
    const beforeFirst = age < r.daewoon.start
    const yearInfo = (y) => {
      const yp = C.yearPillarOf(y)
      const sg = tenGod(ds, yp.stem).name
      const bg = tenGod(ds, MAIN_HIDDEN[yp.branch]).name
      const notes = []
      if (mod(yp.branch - P.day.branch, 12) === 6) notes.push('일지와 충 – 이사·이직·관계 변화가 생기기 쉬우니 건강과 가정을 챙기세요.')
      if (SIX_HARMONY.some(([x, z]) => (x === yp.branch && z === P.day.branch) || (z === yp.branch && x === P.day.branch))) notes.push('일지와 합 – 좋은 인연과 협력이 들어옵니다.')
      if (mod(yp.branch - P.year.branch, 12) === 6) notes.push('띠와 충 – 주변 환경의 변동이 큽니다.')
      const elScore = (STEM_EL[yp.stem] === yong ? 2 : STEM_EL[yp.stem] === hee ? 1 : STEM_EL[yp.stem] === giEl ? -1 : 0) + (BRANCH_EL[yp.branch] === yong ? 2 : BRANCH_EL[yp.branch] === hee ? 1 : BRANCH_EL[yp.branch] === giEl ? -1 : 0)
      const grade = elScore >= 3 ? '대길' : elScore >= 1 ? '길' : elScore === 0 ? '보통' : '주의'
      return { year: y, pillar: yp, stemGod: sg, branchGod: bg, text: GOD_YEAR[sg], branchText: GOD_YEAR[bg], notes, grade }
    }
    const dwInfo = (d) => {
      const sg = tenGod(ds, d.stem).name
      const s = (STEM_EL[d.stem] === yong || STEM_EL[d.stem] === hee ? 1 : STEM_EL[d.stem] === giEl ? -1 : 0) + (BRANCH_EL[d.branch] === yong || BRANCH_EL[d.branch] === hee ? 1 : BRANCH_EL[d.branch] === giEl ? -1 : 0)
      return { ...d, stemGod: sg, branchGod: tenGod(ds, MAIN_HIDDEN[d.branch]).name, good: s }
    }

    // 연애·배우자
    const spouseGroup = r.input.gender === 'M' ? 2 : 3
    const spouseCount = groupCount[spouseGroup]
    const spouseInDay = cells.day.branchGod.group === spouseGroup
    const spouseText =
      (r.input.gender === 'M' ? '남성에게 배우자는 재성(財星)입니다. ' : '여성에게 배우자는 관성(官星)입니다. ') +
      (spouseCount === 0
        ? '원국에 배우자 별이 드러나지 않아 인연이 늦게 오거나, 스스로 결혼에 큰 의미를 두지 않을 수 있습니다. 대운·세운에서 그 기운이 들어올 때가 인연의 시기입니다.'
        : spouseCount >= 3
          ? '배우자 별이 많아 이성 인기가 많지만, 마음이 분산되기 쉽습니다. 한 사람에게 집중하는 것이 복입니다.'
          : '배우자 별이 적당히 있어 인연이 자연스럽게 찾아옵니다.') +
      (spouseInDay ? ' 특히 배우자 자리(일지)에 그 별이 있어 배우자 덕을 볼 수 있습니다.' : '')

    // 결론 요약
    const maxEl = count.indexOf(Math.max(...count))
    const lack = count.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0)
    const topGroup = groupCount.indexOf(Math.max(...groupCount))
    const dm = DAY_MASTER[ds]
    const curDwInfo = !beforeFirst && curDw >= 0 ? dwInfo(dw[curDw]) : null
    const thisYear = yearInfo(curYear)
    const nextYear = yearInfo(curYear + 1)
    const yongFinal = johu ? johu.el : yong
    const summary = {
      headline: `${dm.img}의 기운을 타고난 ${strength} 사주`,
      keywords: [EL_INFO[dayEl].key, C.GOD_GROUPS[topGroup] + ' 발달', `${EL_INFO[yongFinal].name} 필요`],
      points: [
        `타고난 성향: ${dm.core}`,
        `오행 균형: ${EL_INFO[maxEl].name}이(가) ${count[maxEl]}개로 가장 강하고` + (lack.length ? `, ${lack.map((i) => EL_INFO[i].name).join('·')}이(가) 없습니다.` : ' 다섯 기운이 모두 있습니다.'),
        `올해(${curYear}년 ${thisYear.pillar.ko}년) 운세는 '${thisYear.grade}' – ${thisYear.text}`,
      ],
      actions: [
        `행운의 색: ${EL_INFO[yongFinal].color} / 방향: ${EL_INFO[yongFinal].dir} / 숫자: ${EL_INFO[yongFinal].num}`,
        `추천 습관: ${EL_INFO[yongFinal].act}`,
        `조심할 점: ${dm.weak}`,
      ],
    }

    return {
      count, weighted, cells, groupCount, ratio, strength, strong,
      yong, hee, giEl, reason, johu, yongFinal,
      sinsal: sinsalU, relations,
      age, beforeFirst, curDw, daewoon: dw.map(dwInfo), curDwInfo,
      thisYear, nextYear, spouseText,
      dayMaster: dm, summary,
      EL_INFO, GROUP_TEXT, STAGE_TEXT, POS, POS_KO, POS_MEAN,
    }
  }

  return { analyze, EL_INFO, DAY_MASTER, GROUP_TEXT, GOD_YEAR, STAGE_TEXT }
})
