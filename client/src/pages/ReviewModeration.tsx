import { useState } from 'react'
import { Check, X } from 'lucide-react'
import ReviewCard from '../components/ReviewCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import Notice, { type NoticeValue } from '../components/ui/Notice'
import Button, { ButtonLink } from '../components/ui/Button'
import { usePendingReviews } from '../hooks/usePendingReviews'
import { setReviewStatus } from '../lib/reviewApi'
import { hasToken } from '../lib/session'

// Admin: approve or reject pending reviews
export default function ReviewModeration() {
  const { data, loading, error, retry } = usePendingReviews()
  const [notice, setNotice] = useState<NoticeValue | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function decide(id: string, status: 'approved' | 'rejected') {
    setBusyId(id)
    try {
      await setReviewStatus(id, status)
      setNotice({ kind: 'success', text: `Review ${status}.` })
      retry()
    } catch (err) {
      setNotice({ kind: 'error', text: (err as Error).message })
    } finally {
      setBusyId(null)
    }
  }

  const reviews = data ?? []

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <h1 className="font-script text-4xl text-brown sm:text-5xl">Review moderation</h1>
      <p className="mt-1 text-sm text-brown/70">Only approved reviews show on restaurant pages and count toward their rating.</p>

      {notice && <div className="mt-6"><Notice notice={notice} onDismiss={() => setNotice(null)} /></div>}

      {!hasToken() && (
        <div className="mt-6">
          <ErrorState message="Please log in as an admin first.">
            <ButtonLink to="/login" variant="secondary">Log in</ButtonLink>
          </ErrorState>
        </div>
      )}

      {loading && <LoadingState className="mt-6" />}
      {error && <div className="mt-6"><ErrorState message={error} onRetry={retry} /></div>}

      {!loading && !error && hasToken() && reviews.length === 0 && (
        <div className="mt-6"><EmptyState message="No reviews are waiting for approval." /></div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <>
          <p className="mt-6 text-sm text-brown">{reviews.length} waiting</p>
          <div className="mt-2 flex flex-col gap-4">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} showRestaurant>
                <Button onClick={() => decide(r._id, 'approved')} disabled={busyId === r._id}>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                </Button>
                <Button variant="danger" onClick={() => decide(r._id, 'rejected')} disabled={busyId === r._id}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Reject
                </Button>
              </ReviewCard>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
