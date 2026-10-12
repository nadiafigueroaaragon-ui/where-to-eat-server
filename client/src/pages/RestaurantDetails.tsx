import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, ExternalLink, MapPin, Utensils } from 'lucide-react'
import ReviewCard from '../components/ReviewCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import StarRating from '../components/ui/StarRating'
import { ButtonLink } from '../components/ui/Button'
import { useApi } from '../hooks/useApi'
import { useRestaurantReviews } from '../hooks/useRestaurantReviews'
import { isOpenNow } from '../lib/hours'
import { hasToken } from '../lib/session'
import type { RestaurantDetail } from '../lib/restaurantDetail'

// The gallery, town, area and map fields are typed here so this file does not depend on
// restaurantDetail.ts already declaring them
type Details = Omit<RestaurantDetail, 'images' | 'location' | 'town' | 'area'> & {
  images?: string[]
  town?: string
  area?: string
  location?: { coordinates?: number[] }
}

type DayHours = { open?: string; close?: string; closed?: boolean }

const STARS = [5, 4, 3, 2, 1]
const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// "13:30" -> "1:30 PM"
function to12h(hhmm?: string) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`
}

export default function RestaurantDetails() {
  const { id } = useParams()
  const restaurant = useApi<Details>(id ? `/restaurants/${id}` : null)
  const reviews = useRestaurantReviews(id)
  const [failed, setFailed] = useState<string[]>([])
  const [activeSrc, setActiveSrc] = useState('')

  if (restaurant.loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <LoadingState rows={3} />
      </main>
    )
  }
  if (restaurant.error || !restaurant.data) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <ErrorState message={restaurant.error || 'Restaurant not found'} onRetry={restaurant.retry}>
          <ButtonLink to="/" variant="secondary">Back to home</ButtonLink>
        </ErrorState>
      </main>
    )
  }

  const r = restaurant.data
  const list = reviews.data ?? []

  // Derived while rendering, not stored in state
  const photos = [...new Set([r.imageUrl, ...(r.images ?? [])].filter((src): src is string => Boolean(src)))].filter(
    (src) => !failed.includes(src),
  )
  const mainPhoto = photos.includes(activeSrc) ? activeSrc : photos[0]
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' }).toLowerCase()
  const hours = r.openingHours as unknown as Record<string, DayHours | undefined> | undefined
  const hasHours = Boolean(hours) && DAY_ORDER.some((d) => hours?.[d])
  const openNow = isOpenNow(r.openingHours)
  const coords = r.location?.coordinates
  const mapsUrl = coords ? `https://www.google.com/maps?q=${coords[1]},${coords[0]}` : null
  const counts = STARS.map((s) => list.filter((x) => x.rating === s).length)
  const reviewTo = hasToken() ? `/restaurants/${r._id}/review` : '/login'
  const reviewLabel = hasToken() ? 'Write a review' : 'Log in to write a review'

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-brown/70 hover:text-brown">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All restaurants
      </Link>

      <article className="mt-3">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={r.name}
            onError={() => setFailed((l) => [...l, mainPhoto])}
            className="h-72 w-full rounded-2xl object-cover shadow-sm sm:h-[26rem]"
          />
        ) : (
          <div className="flex h-72 items-center justify-center rounded-2xl bg-brown/5 sm:h-[26rem]" aria-hidden="true">
            <Utensils className="h-12 w-12 text-brown/30" />
          </div>
        )}

        {photos.length > 1 && (
          <ul className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {photos.map((src, i) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActiveSrc(src)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-pressed={src === mainPhoto}
                  className={`block w-full overflow-hidden rounded-xl border-2 transition ${
                    src === mainPhoto ? 'border-olive' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    onError={() => setFailed((l) => [...l, src])}
                    className="h-14 w-full object-cover sm:h-16"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-start justify-between gap-4">
          <h1 className="font-script text-4xl leading-tight text-brown sm:text-5xl">{r.name}</h1>
          <div className="shrink-0 pt-1 text-right">
            <div className="flex items-center justify-end gap-2">
              <StarRating value={r.rating} className="h-5 w-5" />
              <span className="text-lg font-semibold text-brown">
                {r.reviewCount > 0 ? r.rating.toFixed(1) : 'New'}
              </span>
            </div>
            <p className="text-xs text-brown/60">
              {r.reviewCount} review{r.reviewCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sun px-3 py-0.5 text-xs text-brown">{r.cuisine}</span>
          <span className="rounded-full bg-brown/10 px-3 py-0.5 text-xs capitalize text-brown">{r.diningType}</span>
          <span className="rounded-full bg-brown/10 px-3 py-0.5 text-xs capitalize text-brown">{r.priceLevel}</span>
          {openNow !== null && (
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                openNow ? 'bg-olive/15 text-olive' : 'bg-brick/10 text-brick'
              }`}
            >
              {openNow ? 'Open now' : 'Closed now'}
            </span>
          )}
          <Link
            to={`/restaurants/${r._id}/book`}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-brown px-5 py-2 text-sm text-cream transition-colors hover:bg-olive"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Book a reservation
          </Link>
        </div>

        {r.description && <p className="mt-3 text-sm leading-relaxed text-brown/80">{r.description}</p>}

        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-brown/5 p-3">
            <dt className="text-xs uppercase tracking-wide text-brown/60">Average meal</dt>
            <dd className="mt-1 text-lg font-semibold text-brown">₱{r.averageMealCost.toLocaleString()}</dd>
          </div>
          <div className="rounded-2xl bg-brown/5 p-3">
            <dt className="text-xs uppercase tracking-wide text-brown/60">Location</dt>
            <dd className="mt-1 text-sm text-brown">
              <span className="flex items-start gap-1">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {r.address}
                  {r.town && <span className="block text-brown/60">{r.area ? `${r.area}, ${r.town}` : r.town}</span>}
                </span>
              </span>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-olive underline"
                >
                  Open in Google Maps
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </dd>
          </div>
        </dl>

        {hasHours && (
          <section className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brown">Opening hours</h2>
            <ul className="mt-2 divide-y divide-brown/10 rounded-2xl border border-brown/10 bg-cream">
              {DAY_ORDER.map((day) => {
                const h = hours?.[day]
                return (
                  <li
                    key={day}
                    className={`flex justify-between gap-4 px-4 py-1.5 text-sm ${
                      day === today ? 'font-semibold text-brown' : 'text-brown/80'
                    }`}
                  >
                    <span className="capitalize">{day}</span>
                    <span>{!h || h.closed ? 'Closed' : `${to12h(h.open)} - ${to12h(h.close)}`}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brown">
              Reviews
              {!reviews.loading && !reviews.error && (
                <span className="ml-2 font-normal text-brown/60">({list.length})</span>
              )}
            </h2>
            <ButtonLink to={reviewTo} variant="accent">
              {reviewLabel}
            </ButtonLink>
          </div>

          {reviews.loading && <LoadingState rows={2} className="mt-4" />}
          {reviews.error && (
            <div className="mt-4">
              <ErrorState message={reviews.error} onRetry={reviews.retry} />
            </div>
          )}

          {!reviews.loading && !reviews.error && list.length === 0 && (
            <div className="mt-4">
              <EmptyState message="No reviews yet. Been here? Be the first to share your visit." />
            </div>
          )}

          {!reviews.loading && !reviews.error && list.length > 0 && (
            <div className="mt-4 grid gap-6 md:grid-cols-[14rem_1fr]">
              <div className="flex flex-col gap-1 self-start rounded-2xl bg-brown/5 p-4" aria-label="Rating breakdown">
                {STARS.map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-xs text-brown">
                    <span className="w-3">{s}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-brown/10">
                      <div className="h-full bg-sun" style={{ width: `${(counts[i] / list.length) * 100}%` }} />
                    </div>
                    <span className="w-4 text-right">{counts[i]}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {list.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            </div>
          )}
        </section>
      </article>
    </main>
  )
}