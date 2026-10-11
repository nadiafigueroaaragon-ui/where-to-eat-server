import { useApi } from './useApi'
import { hasToken } from '../lib/session'
import type { Review } from '../lib/review'

// Admin only: reviews waiting for approval
export const usePendingReviews = () => useApi<Review[]>(hasToken() ? '/reviews/pending' : null)
