import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import ReviewCard from '../components/ReviewCard'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import Notice, { type NoticeValue } from '../components/ui/Notice'
import Button, { ButtonLink } from '../components/ui/Button'
import { useMyReviews } from '../hooks/useMyReviews'
import { deleteReview } from '../lib/reviewApi'
import { hasToken } from '../lib/session'
import { buttonClass } from '../lib/styles'
import type { Review } from '../lib/review'

export default function MyReviews() {
  const { data, loading, error, retry } = useMyReviews()
  const location = useLocation()
  const navigate = useNavigate()
  // A success message can arrive from the write / edit page
  const [notice, setNotice] = useState<NoticeValue | null>((location.state as { notice?: NoticeValue } | null)?.notice ?? null)
  const [deleting, setDeleting] = useState<Review | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await deleteReview(deleting._id)
      setNotice({ kind: 'success', text: 'Your review was deleted.' })
      retry()
    } catch (err) {
      setNotice({ kind: 'error', text: (err as Error).message })
    } finally {
      setBusy(false)
      setDeleting(null)
    }
  }

  const reviews = data ?? []

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <h1 className="font-script text-4xl text-brown sm:text-5xl">My reviews</h1>

      {notice && (
        <div className="mt-6">
          <Notice
            notice={notice}
            onDismiss={() => {
              setNotice(null)
              navigate(location.pathname, { replace: true, state: null })
            }}
          />
        </div>
      )}

      {!hasToken() && (
        <div className="mt-6">
          <EmptyState message="Log in to see the reviews you have written.">
            <ButtonLink to="/login" variant="secondary">Log in</ButtonLink>
          </EmptyState>
        </div>
      )}

      {loading && <LoadingState className="mt-6" />}
      {error && <div className="mt-6"><ErrorState message={error} onRetry={retry} /></div>}

      {!loading && !error && hasToken() && reviews.length === 0 && (
        <div className="mt-6">
          <EmptyState message="You have not written any reviews yet.">
            <ButtonLink to="/" variant="secondary">Find a restaurant</ButtonLink>
          </EmptyState>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r._id} review={r} showRestaurant showAuthor={false} showStatus>
              <Link to={`/reviews/${r._id}/edit`} className={buttonClass('secondary')} aria-label={`Edit your review of ${r.restaurant?.name ?? 'this restaurant'}`}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
              </Link>
              <Button variant="danger" onClick={() => setDeleting(r)} aria-label={`Delete your review of ${r.restaurant?.name ?? 'this restaurant'}`}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
              </Button>
            </ReviewCard>
          ))}
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this review?"
          message="This can't be undone."
          confirmLabel="Yes, delete"
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </main>
  )
}
