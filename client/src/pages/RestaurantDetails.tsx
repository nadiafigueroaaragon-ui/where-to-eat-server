import { Link, useParams } from 'react-router-dom'
import { MapPin, Utensils } from 'lucide-react'
import OpeningHours from '../components/OpeningHours'
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

const STARS = [5, 4, 3, 2, 1]

export default function RestaurantDetails() {
  const { id } = useParams()
  const restaurant = useApi<RestaurantDetail>(id ? `/restaurants/${id}` : null)
  const reviews = useRestaurantReviews(id)

  if (restaurant.loading) return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8"><LoadingState rows={3} /></main>
  if (restaurant.error || !restaurant.data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
        <ErrorState message={restaurant.error || 'Restaurant not found'} onRetry={restaurant.retry}>
          <ButtonLink to="/" variant="secondary">Back to home</ButtonLink>
        </ErrorState>
      </main>
    )
  }

  const r = restaurant.data
  const list = reviews.data ?? []
  // Derived while rendering, not stored in state
  const openNow = isOpenNow(r.openingHours)
  const counts = STARS.map((s) => list.filter((x) => x.rating === s).length)

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-8">
      <div className="mt-8 overflow-hidden rounded-2xl border border-brown/10 bg-cream">
        {r.imageUrl ? (
          <img src={r.imageUrl} alt={r.name} className="h-56 w-full object-cover sm:h-72" />
        ) : (
          <div className="flex h-56 items-center justify-center bg-brown/5 sm:h-72" aria-hidden="true">
            <Utensils className="h-10 w-10 text-brown/30" />
          </div>
        )}

        <div className="flex flex-col gap-4 p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-script text-4xl text-brown sm:text-5xl">{r.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-brown/70">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {r.address}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <StarRating value={r.rating} className="h-5 w-5" />
                <span className="text-lg font-semibold text-brown">{r.reviewCount > 0 ? r.rating.toFixed(1) : 'New'}</span>
              </div>
              <p className="text-xs text-brown/60">
                {r.reviewCount} review{r.reviewCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sun px-3 py-0.5 text-xs text-brown">{r.cuisine}</span>
            <span className="rounded-full bg-brown/10 px-3 py-0.5 text-xs capitalize text-brown">{r.diningType}</span>
            <span className="rounded-full bg-brown/10 px-3 py-0.5 text-xs capitalize text-brown">
              {r.priceLevel} · about ₱{r.averageMealCost.toLocaleString()}
            </span>
            {openNow !== null && (
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${openNow ? 'bg-olive/15 text-olive' : 'bg-brick/10 text-brick'}`}>
                {openNow ? 'Open now' : 'Closed now'}
              </span>
            )}
          </div>

          {r.description && <p className="text-sm text-brown">{r.description}</p>}

          <div className="flex flex-wrap gap-2">
            <ButtonLink to={`/restaurants/${r._id}/book`} variant="primary">Book a table</ButtonLink>
            <ButtonLink to={hasToken() ? `/restaurants/${r._id}/review` : '/login'} variant="accent">
              {hasToken() ? 'Write a review' : 'Log in to write a review'}
            </ButtonLink>
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-brown/10 bg-cream p-5 sm:p-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brown">Opening hours</h2>
        <OpeningHours hours={r.openingHours} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brown">
          Reviews
          {!reviews.loading && !reviews.error && <span className="ml-2 font-normal text-brown/60">({list.length})</span>}
        </h2>

        {reviews.loading && <LoadingState rows={2} className="mt-4" />}
        {reviews.error && <div className="mt-4"><ErrorState message={reviews.error} onRetry={reviews.retry} /></div>}

        {!reviews.loading && !reviews.error && list.length === 0 && (
          <div className="mt-4">
            <EmptyState message="No reviews yet. Been here? Be the first to share your visit.">
              <Link to={hasToken() ? `/restaurants/${r._id}/review` : '/login'} className="text-xs text-olive underline">
                {hasToken() ? 'Write a review' : 'Log in to write a review'}
              </Link>
            </EmptyState>
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
    </main>
  )
}
