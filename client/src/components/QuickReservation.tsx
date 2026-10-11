import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import type { Restaurant } from '../lib/types'

// Today in YYYY-MM-DD, used as the earliest date that can be picked
const today = () => new Date().toISOString().slice(0, 10)

export default function QuickReservation() {
  const navigate = useNavigate()
  const [options, setOptions] = useState<Restaurant[]>([])
  const [restaurantId, setRestaurantId] = useState('')
  const [date, setDate] = useState(today())
  const [guests, setGuests] = useState('2')

  useEffect(() => {
    let cancelled = false
    api
      .get<Restaurant[]>('/restaurants/search', { params: { sort: 'rating' } })
      .then((res) => {
        if (!cancelled) setOptions(res.data)
      })
      .catch(() => {
        if (!cancelled) setOptions([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const ready = Boolean(restaurantId && date)

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!ready) return
    // TODO: when the booking page exists, change this to its route, for example `/restaurants/${restaurantId}/book`
    navigate(`/restaurants/${restaurantId}?date=${date}&guests=${guests}`)
  }

  const field =
    'w-full rounded-full border border-brown/40 bg-cream px-4 py-2 text-xs text-brown outline-none focus:border-olive'

  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-8">
      <div className="rounded-3xl bg-brown/5 px-6 py-8 sm:px-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brown">Quick reservation</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <label className="block">
            <span className="sr-only">Restaurant</span>
            <select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} className={field}>
              <option value="">Choose a restaurant</option>
              {options.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Date</span>
            <input type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} className={field} />
          </label>

          <label className="block">
            <span className="sr-only">Party size</span>
            <select value={guests} onChange={(e) => setGuests(e.target.value)} className={field}>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((n) => (
                <option key={n} value={n}>
                  {n} {n === '1' ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={!ready}
            className="rounded-full bg-brown px-6 py-2 text-xs font-semibold uppercase tracking-wide text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reserve
          </button>
        </form>
      </div>
    </section>
  )
}