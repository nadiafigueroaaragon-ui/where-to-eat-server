import { Star } from 'lucide-react'

const STARS = [1, 2, 3, 4, 5]

// Read-only stars. Works with whole and decimal ratings (4.4 shows four full stars).
export default function StarRating({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {STARS.map((n) => (
        <Star key={n} className={`${className} ${n <= Math.round(value) ? 'fill-sun text-sun' : 'text-brown/25'}`} aria-hidden="true" />
      ))}
    </span>
  )
}
