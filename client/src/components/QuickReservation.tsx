import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../api/axios'
import type { Restaurant } from '../lib/types'

type Option = Restaurant & { imageUrl?: string; images?: string[] }

// Today in YYYY-MM-DD, used as the earliest date that can be picked
const today = () => new Date().toISOString().slice(0, 10)

const photoOf = (r: Option) => r.imageUrl || r.images?.[0]

export default function QuickReservation() {
  const navigate = useNavigate()
  const trackRef = useRef<HTMLDivElement>(null)
  const [options, setOptions] = useState<Option[]>([])
  const [restaurantId, setRestaurantId] = useState('')
  const [date, setDate] = useState(today())
  const [guests, setGuests] = useState('2')
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .get<Option[]>('/restaurants/search', { params: { sort: 'rating' } })
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

  // Derived while rendering, not stored in state
  const selected = options.find((r) => r._id === restaurantId)
  const carousel = options.slice(0, 12)

  function choose(id: string) {
    setRestaurantId(id)
    setMissing(false)
  }

  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!restaurantId) {
      setMissing(true)
      return
    }
    // TODO: when the booking page exists, change this to its route, for example `/restaurants/${restaurantId}/book`
navigate(`/restaurants/${restaurantId}/book?date=${date || today()}&guests=${guests}`)  }

  const label = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-brown/70'
  const field =
    'w-full rounded-xl border bg-white px-4 py-3 text-sm text-brown outline-none transition-colors focus:border-olive'
  const arrow =
    'hidden h-9 w-9 items-center justify-center rounded-full border border-brown/30 bg-white text-brown transition-colors hover:border-olive hover:bg-olive hover:text-cream sm:flex'

  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-8">
      <div className="rounded-3xl border border-brown/15 bg-white/70 p-6 shadow-sm sm:p-8">
        <h2 className="font-script text-3xl text-brown sm:text-4xl">Reserve a table</h2>
        <p className="mt-1 text-sm text-brown/70">
          Tap a restaurant below, or choose one from the list, then pick a date and your group size.
        </p>

        {carousel.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => scrollBy(-1)} aria-label="Scroll left" className={arrow}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <div
                ref={trackRef}
                className="flex flex-1 snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {carousel.map((r) => {
                  const photo = photoOf(r)
                  const active = r._id === restaurantId
                  return (
                    <button
                      key={r._id}
                      type="button"
                      onClick={() => choose(active ? '' : r._id)}
                      aria-pressed={active}
                      aria-label={`Select ${r.name}`}
                      className={`group w-40 shrink-0 snap-start overflow-hidden rounded-2xl border-2 bg-white text-left transition-all sm:w-44 ${
                        active ? 'border-olive shadow-md' : 'border-transparent hover:border-brown/30'
                      }`}
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt=""
                          loading="lazy"
                          className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-28 items-center justify-center bg-brown/10 text-2xl text-brown/40" aria-hidden="true">
                          🍽
                        </div>
                      )}
                      <div className="px-3 py-2">
                        <p className="truncate text-xs font-semibold text-brown">{r.name}</p>
                        <p className="truncate text-[11px] text-brown/60">{r.town}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <button type="button" onClick={() => scrollBy(1)} aria-label="Scroll right" className={arrow}>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-[2fr_1.2fr_1fr_auto] lg:items-end">
          <div>
            <label htmlFor="qr-restaurant" className={label}>
              Restaurant
            </label>
            <select
              id="qr-restaurant"
              value={restaurantId}
              onChange={(e) => choose(e.target.value)}
              className={`${field} ${missing ? 'border-brick' : 'border-brown/30'}`}
            >
              <option value="">Choose a restaurant</option>
              {options.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="qr-date" className={label}>
              Date
            </label>
            <input
              id="qr-date"
              type="date"
              min={today()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${field} border-brown/30`}
            />
          </div>

          <div>
            <label htmlFor="qr-guests" className={label}>
              Party size
            </label>
            <select
              id="qr-guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className={`${field} border-brown/30`}
            >
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((n) => (
                <option key={n} value={n}>
                  {n} {n === '1' ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-brown px-8 py-3 text-xs font-semibold uppercase tracking-wide text-cream transition-colors hover:bg-olive lg:w-auto"
          >
            {selected ? `Reserve ${selected.name}` : 'Reserve'}
          </button>
        </form>

        {missing && (
          <p role="alert" className="mt-3 text-xs text-brick">
            Please choose a restaurant first.
          </p>
        )}
      </div>
    </section>
  )
}