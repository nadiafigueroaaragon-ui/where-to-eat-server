import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

// Change these when Mhir's reviews route is confirmed.
// REVIEWS_PAGE is the front-end page for all reviews; leave it empty to hide the link.
const REVIEWS_URL = '/reviews'
const REVIEWS_PAGE = ''

type Review = {
  _id: string
  rating?: number
  comment?: string
  text?: string
  user?: { name?: string } | string
  restaurant?: { name?: string } | string
  createdAt?: string
}

const nameOf = (v: Review['user'] | Review['restaurant']) =>
  typeof v === 'object' && v?.name ? v.name : undefined

export default function ReviewsPreview() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api
      .get(REVIEWS_URL, { params: { limit: 3, sort: 'newest' } })
      .then((res) => {
        const list: Review[] = Array.isArray(res.data) ? res.data : (res.data?.reviews ?? [])
        if (!cancelled) setReviews(list.slice(0, 3))
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brown">What diners are saying</h2>
        {REVIEWS_PAGE && (
          <Link
            to={REVIEWS_PAGE}
            className="text-xs font-semibold uppercase tracking-wide text-brown transition-colors hover:text-olive"
          >
            All reviews
          </Link>
        )}
      </div>

      {loading && (
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {['a', 'b', 'c'].map((id) => (
            <div key={id} className="h-32 animate-pulse rounded-2xl bg-brown/5" />
          ))}
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="mt-4 rounded-2xl bg-brown/5 p-6 text-center text-xs text-brown">
          No reviews yet. Be the first to share your experience.
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {reviews.map((r) => (
            <article key={r._id} className="rounded-2xl bg-brown/5 p-5">
              <p className="text-sun" aria-label={`${r.rating ?? 0} out of 5 stars`}>
                {'★'.repeat(Math.round(r.rating ?? 0))}
                <span className="text-brown/20">{'★'.repeat(5 - Math.round(r.rating ?? 0))}</span>
              </p>
              <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-brown">{r.comment ?? r.text}</p>
              <p className="mt-3 text-xs text-brown/60">
                {nameOf(r.user) ?? 'A diner'}
                {nameOf(r.restaurant) && ` · ${nameOf(r.restaurant)}`}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}