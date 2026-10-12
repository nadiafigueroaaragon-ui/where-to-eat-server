import api from '../api/axios'
import { messageFrom } from './apiError'
import type { Review, ReviewStatus } from './review'
import type { ReviewFormValues } from './reviewSchema'

// Each call throws a readable Error so a page can show the message as it is.
async function run<T>(fn: () => Promise<{ data: T }>, fallback: string) {
  try {
    return (await fn()).data
  } catch (err) {
    throw new Error(messageFrom(err, fallback))
  }
}

export const createReview = (restaurant: string, values: ReviewFormValues) =>
  run(() => api.post<Review>('/reviews', { restaurant, ...values }), 'Could not submit your review.')

export const updateReview = (id: string, values: ReviewFormValues) =>
  run(() => api.put<Review>(`/reviews/${id}`, values), 'Could not update your review.')

export const deleteReview = (id: string) =>
  run(() => api.delete<{ message: string }>(`/reviews/${id}`), 'Could not delete the review.')

export const setReviewStatus = (id: string, status: Exclude<ReviewStatus, 'pending'>) =>
  run(() => api.patch<Review>(`/reviews/${id}/status`, { status }), 'Could not update the review.')
