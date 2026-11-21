// 배경음악 합성: 가야금 느낌의 5음계 뜯는 소리 + 장면 전환 징 소리 + 낮은 패드 → 16bit 스테레오 WAV
import { writeFileSync } from 'node:fs'

export function makeMusic(path, { duration = 30, sceneStarts = [], seed = 3 } = {}) {
  const sr = 44100
  const T = duration + 0.5
  const n = Math.floor(sr * T)
  const out = new Float64Array(n)
  let s = seed
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const TAU = Math.PI * 2

  const pluck = (f, start, dur = 1.6, amp = 0.22) => {
    const i0 = Math.floor(start * sr)
    const m = Math.min(n - i0, Math.floor(dur * sr))
    let ph = 0
    for (let j = 0; j < m; j++) {
      const t = j / sr
      ph += (TAU * f * (1 + 0.012 * Math.exp(-t * 8))) / sr // 살짝 내려앉는 음
      const env = Math.exp(-t * 3.2) * (1 - Math.exp(-t * 400))
      out[i0 + j] += amp * env * (Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * Math.sin(3 * ph))
    }
  }
  const gong = (start, f = 73.4, amp = 0.35) => {
    const i0 = Math.floor(start * sr)
    const m = Math.min(n - i0, Math.floor(3.5 * sr))
    for (let j = 0; j < m; j++) {
      const t = j / sr
      const env = Math.exp(-t * 1.3) * (1 - Math.exp(-t * 200))
      out[i0 + j] +=
        amp * env * (Math.sin(TAU * f * t) + 0.5 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t * 2) + 0.3 * Math.sin(TAU * f * 5.4 * t) * Math.exp(-t * 4))
    }
  }

  const scale = [293.66, 329.63, 392.0, 440.0, 493.88, 587.33, 659.25]
  const beat = 60 / 96
  let k = 3
  for (let b = 0; b * beat < duration - 0.8; b++) {
    if ((b % 8 === 3 || b % 8 === 7) && rnd() < 0.5) continue
    k = Math.max(0, Math.min(scale.length - 1, k + Math.floor(rnd() * 5) - 2))
    pluck(scale[k], b * beat, 1.6, b % 2 ? 0.16 : 0.22)
    if (b % 4 === 0) pluck(scale[k] / 2, b * beat, 2.2, 0.12)
  }
  for (const st of sceneStarts) gong(st)

  let peak = 0
  for (let j = 0; j < n; j++) {
    const t = j / sr
    out[j] += (Math.sin(TAU * 146.83 * t) + 0.6 * Math.sin(TAU * 220 * t) + 0.4 * Math.sin(TAU * 293.66 * 1.002 * t)) * 0.05 * (0.7 + 0.3 * Math.sin((TAU * t) / 8))
    out[j] *= Math.max(0, Math.min(1, t / 0.6, (T - t) / 1.5))
    peak = Math.max(peak, Math.abs(out[j]))
  }

  const buf = Buffer.alloc(44 + n * 4)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8)
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22)
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34)
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40)
  const g = 32767 / (peak * 1.15 || 1)
  for (let j = 0; j < n; j++) {
    const v = Math.round(out[j] * g)
    buf.writeInt16LE(v, 44 + j * 4)
    buf.writeInt16LE(v, 46 + j * 4)
  }
  writeFileSync(path, buf)
}
