/* 사주팔자 계산 엔진 (화면과 분리 – Node에서도 테스트 가능)
 * - 음력 → 양력: korean-lunar-calendar (한국천문연구원 기준, MIT)
 * - 절기: 태양 시황경(Meeus 저정밀식, 오차 약 ±15분)으로 직접 계산
 * - 년주는 입춘, 월주는 절입(12절), 일주는 율리우스일, 시주는 2시간 단위
 */
;(function (root, factory) {
  const api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  else root.SajuCore = api
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict'

  const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
  const STEMS_H = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
  const BRANCHES_H = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지']
  const ELEMENTS = ['목', '화', '토', '금', '수']
  const ELEMENTS_H = ['木', '火', '土', '金', '水']
  const STEM_EL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]
  const BRANCH_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]
  // 지장간 (여기·중기·본기 순, 마지막이 본기)
  const HIDDEN = [[8, 9], [9, 7, 5], [4, 2, 0], [0, 1], [1, 9, 4], [4, 6, 2], [2, 5, 3], [3, 1, 5], [4, 8, 6], [6, 7], [7, 3, 4], [4, 0, 8]]
  const MAIN_HIDDEN = HIDDEN.map((h) => h[h.length - 1])
  const TEN_GODS = [['비견', '겁재'], ['식신', '상관'], ['편재', '정재'], ['편관', '정관'], ['편인', '정인']]
  const GOD_GROUPS = ['비겁', '식상', '재성', '관성', '인성']
  const STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양']
  const STAGE_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3]

  const mod = (a, n) => ((a % n) + n) % n
  const rad = (d) => (d * Math.PI) / 180

  /* ---------- 날짜·천문 ---------- */
  function jdn(y, m, d) {
    const a = Math.floor((14 - m) / 12)
    const yy = y + 4800 - a
    const mm = m + 12 * a - 3
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045
  }
  // 율리우스일(UT, 소수) ← 연월일 + 시(UT 기준 시간, 소수)
  function jdFromUT(y, m, d, hours) {
    return jdn(y, m, d) - 0.5 + hours / 24
  }
  function utFromJd(jd) {
    const z = Math.floor(jd + 0.5)
    const f = jd + 0.5 - z
    const alpha = Math.floor((z - 1867216.25) / 36524.25)
    const a = z + 1 + alpha - Math.floor(alpha / 4)
    const b = a + 1524
    const c = Math.floor((b - 122.1) / 365.25)
    const dd = Math.floor(365.25 * c)
    const e = Math.floor((b - dd) / 30.6001)
    const day = b - dd - Math.floor(30.6001 * e)
    const month = e < 14 ? e - 1 : e - 13
    const year = month > 2 ? c - 4716 : c - 4715
    const mins = Math.round(f * 1440)
    return { year, month, day, hour: Math.floor(mins / 60), minute: mins % 60 }
  }
  function deltaT(year) {
    // 초 단위 근사 (Espenak–Meeus 다항식 간략판)
    const t = year - 2000
    if (year < 1900) return -2.5 + 0.0 * t
    if (year < 1950) return 21 + 0.5 * (year - 1920)
    if (year < 1986) return 29 + 0.9 * (year - 1950) - 0.003 * (year - 1950) ** 2
    if (year < 2005) return 63.86 + 0.3345 * t - 0.060374 * t * t
    return 62.92 + 0.32217 * (year - 2000) + 0.005589 * (year - 2000) ** 2
  }
  // 태양의 시황경 (도)
  function sunLongitude(jdUT) {
    const year = 2000 + (jdUT - 2451545) / 365.25
    const jde = jdUT + deltaT(year) / 86400
    const T = (jde - 2451545) / 36525
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
    const C =
      (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(rad(M)) +
      (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M)) +
      0.000289 * Math.sin(rad(3 * M))
    const omega = 125.04 - 1934.136 * T
    return mod(L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega)), 360)
  }
  // 태양 황경이 target 이 되는 순간(가까운 것)을 guess 근처에서 찾는다
  function findSunLongitude(target, guessJd) {
    let jd = guessJd
    for (let i = 0; i < 8; i++) {
      const diff = mod(target - sunLongitude(jd) + 180, 360) - 180
      jd += (diff / 360) * 365.2422
      if (Math.abs(diff) < 1e-6) break
    }
    return jd
  }

  /* ---------- 한국 표준시 이력 ---------- */
  // 시계 시각(벽시계) → UT 오프셋(시간). 서머타임 포함.
  function koreaOffset(y, m, d, h) {
    const v = y * 1e6 + m * 1e4 + d * 100 + h
    let off = 9
    if ((v >= 1908040100 && v < 1912010100) || (v >= 1954032100 && v < 1961081000)) off = 8.5
    const dst = [
      [1948060100, 1948091300], [1949040300, 1949091100], [1950040100, 1950091000], [1951050600, 1951090900],
      [1955050500, 1955090900], [1956052000, 1956093000], [1957050500, 1957092200], [1958050400, 1958092100],
      [1959050300, 1959092000], [1960050100, 1960091800], [1987051002, 1987101103], [1988050802, 1988100903],
    ]
    const inDst = dst.some(([a, b]) => v >= a && v < b)
    return { offset: off + (inDst ? 1 : 0), dst: inDst, standard: off }
  }

  /* ---------- 간지 ---------- */
  const pillar = (s, b) => ({
    stem: s, branch: b,
    ko: STEMS[s] + BRANCHES[b], hanja: STEMS_H[s] + BRANCHES_H[b],
    stemEl: STEM_EL[s], branchEl: BRANCH_EL[b],
  })
  const idx60 = (s, b) => {
    for (let i = 0; i < 60; i++) if (i % 10 === s && i % 12 === b) return i
    return -1
  }
  function tenGod(dayStem, stem) {
    const diff = mod(STEM_EL[stem] - STEM_EL[dayStem], 5)
    const same = dayStem % 2 === stem % 2
    return { name: TEN_GODS[diff][same ? 0 : 1], group: diff }
  }
  function stage(dayStem, branch) {
    const s = STAGE_START[dayStem]
    return STAGES[dayStem % 2 === 0 ? mod(branch - s, 12) : mod(s - branch, 12)]
  }
  function yearPillarOf(sajuYear) {
    return pillar(mod(sajuYear - 4, 10), mod(sajuYear - 4, 12))
  }

  /* ---------- 메인 계산 ---------- */
  /**
   * @param {object} o
   *  lunar: {year, month, day, leap} | solar: {year, month, day}
   *  time: {hour, minute} | null (모름)
   *  gender: 'M' | 'F'
   *  longitude: 출생지 경도(기본 126.98 서울), useLmt: 지방시 보정 여부
   *  ziMode: 'next'(23시부터 다음날, 기본) | 'same'(야자시: 0시부터 다음날)
   */
  function compute(o, Lunar) {
    let solar = o.solar
    let lunar = o.lunar
    if (lunar) {
      const cal = new Lunar()
      if (!cal.setLunarDate(lunar.year, lunar.month, lunar.day, !!lunar.leap)) {
        throw new Error(lunar.leap ? '그 해 그 달에는 윤달이 없거나, 없는 날짜입니다.' : '존재하지 않는 음력 날짜입니다. (1000~2050년, 작은달은 29일까지)')
      }
      solar = cal.getSolarCalendar()
    } else if (Lunar) {
      const cal = new Lunar()
      if (cal.setSolarDate(solar.year, solar.month, solar.day)) lunar = cal.getLunarCalendar()
    }
    const hasTime = !!o.time
    const hour = hasTime ? o.time.hour : 12
    const minute = hasTime ? o.time.minute : 0
    const tz = koreaOffset(solar.year, solar.month, solar.day, hour)
    const clockHours = hour + minute / 60
    const jdBirth = jdFromUT(solar.year, solar.month, solar.day, clockHours - tz.offset)

    // 절기: 월(0=인월, 입춘 315°부터 30°씩)
    const lon = sunLongitude(jdBirth)
    const monthIdx = Math.floor(mod(lon - 315, 360) / 30)
    const sajuYear = solar.month <= 2 && monthIdx >= 10 ? solar.year - 1 : solar.year
    const yearP = yearPillarOf(sajuYear)
    const firstMonthStem = mod((yearP.stem % 5) * 2 + 2, 10)
    const monthP = pillar(mod(firstMonthStem + monthIdx, 10), mod(2 + monthIdx, 12))

    // 일·시주: 지방 평균시(LMT) 보정 후 시각 기준
    const lng = o.longitude ?? 126.98
    const lmtShift = o.useLmt === false ? 0 : (lng - tz.standard * 15) * 4 // 분
    const dstShift = tz.dst ? -60 : 0
    let localMin = hour * 60 + minute + (hasTime ? lmtShift + dstShift : 0)
    let dayJdn = jdn(solar.year, solar.month, solar.day)
    while (localMin < 0) { localMin += 1440; dayJdn -= 1 }
    while (localMin >= 1440) { localMin -= 1440; dayJdn += 1 }
    const ziMode = o.ziMode || 'next'
    let pillarJdn = dayJdn
    if (hasTime && ziMode === 'next' && localMin >= 23 * 60) pillarJdn += 1
    const d60 = mod(pillarJdn + 49, 60)
    const dayP = pillar(d60 % 10, d60 % 12)

    let hourP = null
    if (hasTime) {
      const hb = Math.floor(mod(localMin + 60, 1440) / 120) % 12
      // 야자시(same) 모드에서 23시대 시주의 천간은 다음날 일간 기준으로 잡는다
      const stemBase = ziMode === 'same' && localMin >= 23 * 60 ? mod(dayP.stem + 1, 10) : dayP.stem
      hourP = pillar(mod((stemBase % 5) * 2 + hb, 10), hb)
    }

    // 대운: 양남음녀 순행, 음남양녀 역행
    const yangYear = yearP.stem % 2 === 0
    const forward = (o.gender === 'M') === yangYear
    const prevTarget = 315 + monthIdx * 30
    const guessPrev = jdBirth - (mod(lon - prevTarget, 360) / 360) * 365.2422
    const prevJie = findSunLongitude(mod(prevTarget, 360), guessPrev)
    const nextJie = findSunLongitude(mod(prevTarget + 30, 360), prevJie + 30.4)
    const days = forward ? nextJie - jdBirth : jdBirth - prevJie
    const daewoonStart = Math.max(1, Math.round(days / 3))
    const m60 = idx60(monthP.stem, monthP.branch)
    const daewoon = []
    for (let i = 1; i <= 10; i++) {
      const k = mod(m60 + (forward ? i : -i), 60)
      daewoon.push({ age: daewoonStart + (i - 1) * 10, ...pillar(k % 10, k % 12) })
    }
    const kst = (jd) => utFromJd(jd + 9 / 24)

    return {
      input: o,
      solar,
      lunar,
      hasTime,
      tz,
      lmtShift: hasTime ? Math.round(lmtShift + dstShift) : 0,
      localTime: hasTime ? { hour: Math.floor(localMin / 60), minute: Math.round(localMin % 60) } : null,
      sunLongitude: lon,
      sajuYear,
      pillars: { year: yearP, month: monthP, day: dayP, hour: hourP },
      daewoon: { forward, start: daewoonStart, days, list: daewoon },
      jie: { prev: kst(prevJie), next: kst(nextJie) },
      animal: ANIMALS[yearP.branch],
    }
  }

  return {
    STEMS, STEMS_H, BRANCHES, BRANCHES_H, ANIMALS, ELEMENTS, ELEMENTS_H, STEM_EL, BRANCH_EL,
    HIDDEN, MAIN_HIDDEN, TEN_GODS, GOD_GROUPS, STAGES,
    mod, jdn, sunLongitude, findSunLongitude, koreaOffset, pillar, tenGod, stage, yearPillarOf, compute,
  }
})
