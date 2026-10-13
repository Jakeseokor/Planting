import { Grad, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// 밑동이 (0,0)인 하트 모양 큰 잎
const LEAF = 'M0 0 C-14 -2 -40 -10 -42 -36 C-44 -62 -18 -76 0 -74 C18 -76 44 -62 42 -36 C40 -10 14 -2 0 0 Z'
const RIGHT_HALF = 'M0 0 C14 -2 40 -10 42 -36 C44 -62 18 -76 0 -74 Z'
// 가장자리에서 잎맥 쪽으로 파고드는 갈라짐
const SLITS = [
  'M-48 -18 L-13 -24',
  'M-48 -38 L-12 -42',
  'M-40 -60 L-10 -58',
  'M48 -18 L13 -24',
  'M48 -38 L12 -42',
  'M40 -60 L10 -58',
]
// 갈라진 조각마다 지나가는 잎맥
const VEINS = [
  'M0 -8 Q-20 -10 -38 -8',
  'M0 -30 Q-22 -32 -42 -28',
  'M0 -50 Q-20 -52 -38 -48',
  'M0 -8 Q20 -10 38 -8',
  'M0 -30 Q22 -32 42 -28',
  'M0 -50 Q20 -52 38 -48',
]

function Leaf({ t, fill, mask, young = false }: { t: string; fill: string; mask?: string; young?: boolean }) {
  return (
    <g transform={t}>
      <g mask={mask}>
        <path d={LEAF} fill={fill} />
        <path d={RIGHT_HALF} fill="#000" opacity="0.17" />
        {!young &&
          VEINS.map((d) => <path key={d} d={d} stroke="#bfe3b4" strokeOpacity="0.4" strokeWidth="1.3" fill="none" />)}
      </g>
      <path
        d="M0 -2 Q-2 -40 0 -70"
        stroke="#c4e6b8"
        strokeOpacity="0.8"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-32 -46 Q-24 -64 -8 -68"
        stroke="#fff"
        strokeOpacity="0.22"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

export default function Monstera({ className, title = '몬스테라' }: IllustrationProps) {
  const id = useIds()
  return (
    <Svg title={title} className={className}>
      <defs>
        <Grad id={id('leaf')} stops={['#5aa964', '#2f7d41', '#1a5229']} />
        <Grad id={id('back')} stops={['#3f8a4c', '#1d5a2c', '#123d1d']} />
        <mask id={id('m')} maskUnits="userSpaceOnUse" x="-60" y="-90" width="120" height="100">
          <rect x="-60" y="-90" width="120" height="100" fill="#fff" />
          {SLITS.map((d) => (
            <path key={d} d={d} stroke="#000" strokeWidth="3" strokeLinecap="round" />
          ))}
          <ellipse cx="-25" cy="-34" rx="2.6" ry="4.5" fill="#000" />
          <ellipse cx="25" cy="-34" rx="2.6" ry="4.5" fill="#000" />
          <ellipse cx="-20" cy="-52" rx="2" ry="3.5" fill="#000" />
          <ellipse cx="20" cy="-52" rx="2" ry="3.5" fill="#000" />
        </mask>
      </defs>
      <Pot kind="terracotta">
        <g stroke="#3f7d43" strokeWidth="3.4" strokeLinecap="round" fill="none">
          <path d="M104 138 C110 112 118 86 128 72" stroke="#2c5f30" />
          <path d="M92 138 C88 116 78 104 66 96" />
          <path d="M108 138 C112 118 124 106 138 100" />
          <path d="M100 138 C100 112 100 88 101 64" />
          <path d="M96 138 C94 128 90 120 84 114" />
        </g>
        <Leaf t="translate(128 74) rotate(30) scale(.56)" fill={url(id('back'))} mask={url(id('m'))} />
        <Leaf t="translate(66 98) rotate(-55) scale(.68)" fill={url(id('leaf'))} mask={url(id('m'))} />
        <Leaf t="translate(138 102) rotate(54) scale(.64)" fill={url(id('leaf'))} mask={url(id('m'))} />
        <Leaf t="translate(101 66) rotate(-5) scale(.84)" fill={url(id('leaf'))} mask={url(id('m'))} />
        {/* 아직 갈라지지 않은 어린잎 */}
        <Leaf t="translate(84 116) rotate(-24) scale(.34)" fill="#6dbb6c" young />
      </Pot>
    </Svg>
  )
}
