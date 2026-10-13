import { Grad, Leaf, Pot, Svg, url, useIds, type IllustrationProps } from './kit'

// 옆에서 본 에케베리아: 바깥 잎은 눕고, 안쪽 잎일수록 곧게 선다. [각도들, 길이 비율]
const LAYERS: [number[], number][] = [
  [[-84, -58, -30, 30, 58, 84], 1],
  [[-64, -38, -12, 12, 38, 64], 0.86],
  [[-40, -16, 16, 40], 0.7],
  [[-20, 0, 20], 0.52],
  [[-8, 8], 0.36],
]

function Rosette({ x, y, size, fill }: { x: number; y: number; size: number; fill: string }) {
  return (
    <g>
      {LAYERS.map(([angles, k], li) =>
        angles.map((r) => (
          <Leaf
            key={`${li}${r}`}
            x={x}
            y={y}
            r={r}
            s={{
              len: size * k,
              width: size * k * 0.5,
              a: 1.5,
              b: 0.6,
              droop: Math.abs(r) * 0.05,
            }}
            fill={fill}
            shade={0.12}
            midrib={false}
            edge="#5f8f7c"
          />
        )),
      )}
    </g>
  )
}

export default function Succulent({ className, title = '다육식물' }: IllustrationProps) {
  const id = useIds()
  const fill = url(id('leaf'))
  return (
    <Svg title={title} className={className}>
      <defs>
        {/* 밑동 청록 → 잎 끝 분홍 */}
        <Grad
          id={id('leaf')}
          stops={['#7fa998', '#8fb8a6', '#a3c7b6', '#a3c7b6', '#c99aa5']}
          x1={0}
          y1={1}
          x2={0}
          y2={0}
        />
      </defs>
      {/* 낮은 화분이라 다른 화초와 비슷한 크기로 보이게 확대 */}
      <g transform="translate(100 196) scale(1.35) translate(-100 -196)">
        <Pot kind="gray" size="low">
          <Rosette x={66} y={156} size={30} fill={fill} />
          <Rosette x={136} y={156} size={26} fill={fill} />
          <Rosette x={100} y={154} size={44} fill={fill} />
        </Pot>
      </g>
    </Svg>
  )
}
