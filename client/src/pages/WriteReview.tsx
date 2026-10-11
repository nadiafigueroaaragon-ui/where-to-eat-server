import { useNavigate, useParams } from 'react-router-dom'
import ReviewForm from '../components/ReviewForm'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import Notice, { type NoticeValue } from '../components/ui/Notice'
import { ButtonLink } from '../components/ui/Button'
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { toDateInput } from '../lib/dates'
import { createReview, updateReview } from '../lib/reviewApi'
import type { Review } from '../lib/review'
import type { ReviewFormValues } from '../lib/reviewSchema'
import { hasToken } from '../lib/session'

// One page, two routes:  /restaurants/:id/review (write)  and  /reviews/:id/edit (edit)
export default function WriteReview({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<NoticeValue | null>(null)

  const editing = mode === 'edit'
  // Edit loads the review (it carries its restaurant). Write loads the restaurant to show its name.
  const review = useApi<Review>(editing && id && hasToken() ? `/reviews/${id}` : null)
  const restaurantCall = useApi<{ _id: string; name: string }>(!editing && id ? `/restaurants/${id}` : null)

  const loading = editing ? review.loading : restaurantCall.loading
  const error = editing ? review.error : restaurantCall.error
  const retry = editing ? review.retry : restaurantCall.retry
  const restaurant = editing ? review.data?.restaurant : restaurantCall.data

  async function handleSubmit(values: ReviewFormValues) {
    try {
      if (editing && id) {
        await updateReview(id, values)
        navigate('/reviews', { state: { notice: { kind: 'success', text: 'Your review was updated and is waiting for approval again.' } } })
      } else if (id) {
        await createReview(id, values)
        navigate('/reviews', { state: { notice: { kind: 'success', text: 'Thank you! Your review was submitted and is waiting for approval.' } } })
      }
    } catch (err) {
      setNotice({ kind: 'error', text: (err as Error).message })
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-8">
      <h1 className="font-script text-4xl text-brown sm:text-5xl">{editing ? 'Edit your review' : 'Write a review'}</h1>
      {restaurant && <p className="mt-1 text-sm text-brown/70">{restaurant.name}</p>}

      {!hasToken() && (
        <div className="mt-6">
          <ErrorState message="Please log in to write a review.">
            <ButtonLink to="/login" variant="secondary">Log in</ButtonLink>
          </ErrorState>
        </div>
      )}

      {hasToken() && (
        <>
          {notice && <div className="mt-6"><Notice notice={notice} onDismiss={() => setNotice(null)} /></div>}
          {loading && <LoadingState rows={2} className="mt-6" />}
          {error && <div className="mt-6"><ErrorState message={error} onRetry={retry} /></div>}

          {!loading && !error && (
            <div className="mt-6 rounded-2xl border border-brown/10 bg-cream p-5 sm:p-8">
              <ReviewForm
                initialValues={
                  editing && review.data
                    ? { rating: review.data.rating, comment: review.data.comment, visitDate: toDateInput(review.data.visitDate) }
                    : undefined
                }
                submitLabel={editing ? 'Save changes' : 'Submit review'}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
              />
              <p className="mt-4 text-xs text-brown/60">
                Reviews are checked by an admin before they appear on the restaurant page.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  )
}
