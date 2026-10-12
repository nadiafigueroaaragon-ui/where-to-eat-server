import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import StarRating from '../components/ui/StarRating'

type Review = {
  _id: string
  rating: number
  comment?: string
  visitDate?: string
  createdAt?: string
  user?: { name?: string } | null
  restaurant?: { _id: string; name: string; town?: string } | null
}

const messageOf = (err: unknown) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  'Could not load reviews. Please try again.'

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

export default function OwnerReviews() {
  const [list, setList] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    api
      .get<Review[]>('/reviews/owner')
      .then((res) => {
        if (!cancelled) setList(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(messageOf(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  function retry() {
    setLoading(true)
    setError('')
    setAttempt((a) => a + 1)
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:px-8">
      <h1 className="font-script text-4xl text-brown sm:text-5xl">Reviews</h1>
      <p className="mt-1 text-sm text-brown/70">What diners wrote about your restaurants.</p>

      {loading && <LoadingState rows={3} className="mt-6" />}
      {!loading && error && (
        <div className="mt-6">
          <ErrorState message={error} onRetry={retry} />
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="mt-6">
          <EmptyState message="No reviews on your restaurants yet." />
        </div>
      )}

      {!loading && !error && list.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {list.map((r) => (
            <li key={r._id} className="rounded-2xl bg-brown/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  {r.restaurant ? (
                    <Link
                      to={`/restaurants/${r.restaurant._id}`}
                      className="text-sm font-semibold text-brown hover:text-olive"
                    >
                      {r.restaurant.name}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-brown">Restaurant removed</p>
                  )}
                  <p className="text-xs text-brown/60">
                    {r.user?.name ?? 'A diner'}
                    {formatDate(r.visitDate || r.createdAt) && ` · ${formatDate(r.visitDate || r.createdAt)}`}
                  </p>
                </div>
                <StarRating value={r.rating} className="h-4 w-4" />
              </div>
              {r.comment && <p className="mt-3 text-sm leading-relaxed text-brown">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}