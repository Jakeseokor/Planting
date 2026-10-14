import { getPlant } from '../data/plants'
import { illustrations } from './illustrations'

export default function PlantIllustration({
  id,
  name,
  className,
  look,
}: {
  id: string
  name: string
  className?: string
  /** 그림을 빌려 올 기본 화초 id (아직 저장 전인 새 화초 미리보기용) */
  look?: string
}) {
  // 사용자가 추가한 화초는 비슷한 모양의 기본 화초 그림을 쓴다
  const Illustration = illustrations[id] ?? illustrations[look ?? getPlant(id)?.illustration ?? '']
  if (!Illustration) {
    return (
      <div className={`grid place-items-center text-5xl ${className ?? ''}`} role="img" aria-label={name}>
        🪴
      </div>
    )
  }
  return <Illustration className={className} title={name} />
}
