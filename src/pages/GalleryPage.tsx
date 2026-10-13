import { illustrations } from '../components/illustrations'

/** 개발용: 모든 일러스트를 한 번에 확인 (npm run dev 에서 #/gallery) */
export default function GalleryPage() {
  return (
    <div className="grid grid-cols-5 gap-3 p-3">
      {Object.entries(illustrations).map(([id, C]) => (
        <figure key={id} className="rounded-2xl bg-surface-2 p-2 text-center">
          <C className="w-full" />
          <figcaption className="text-sm">{id}</figcaption>
        </figure>
      ))}
    </div>
  )
}
