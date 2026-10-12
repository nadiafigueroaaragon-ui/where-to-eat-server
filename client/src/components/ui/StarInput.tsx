import { Star } from 'lucide-react'

const STARS = [1, 2, 3, 4, 5]
const LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']

type Props = { id: string; value: number; onChange: (n: number) => void }

// Pick 1 to 5 stars. Buttons act as a radio group so it works with the keyboard too.
export default function StarInput({ id, value, onChange }: Props) {
  return (
    <div id={id} role="radiogroup" aria-label="Rating" className="flex items-center gap-1">
      {STARS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}: ${LABELS[n - 1]}`}
          onClick={() => onChange(n)}
          className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-olive"
        >
          <Star className={`h-8 w-8 transition-colors ${n <= value ? 'fill-sun text-sun' : 'text-brown/25 hover:text-sun'}`} />
        </button>
      ))}
      <span className="ml-2 text-xs text-brown/70">{value > 0 ? LABELS[value - 1] : 'Tap a star'}</span>
    </div>
  )
}
