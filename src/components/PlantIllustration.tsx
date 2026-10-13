import { illustrations } from './illustrations'

export default function PlantIllustration({ id, name, className }: { id: string; name: string; className?: string }) {
  const Illustration = illustrations[id]
  if (!Illustration) {
    return (
      <div className={`grid place-items-center text-5xl ${className ?? ''}`} role="img" aria-label={name}>
        🪴
      </div>
    )
  }
  return <Illustration className={className} title={name} />
}
