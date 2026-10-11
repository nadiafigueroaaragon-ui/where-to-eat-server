import { useApi } from './useApi'
import { hasToken } from '../lib/session'
import type { Review } from '../lib/review'

// The logged-in traveler's own reviews, in every status
export const useMyReviews = () => useApi<Review[]>(hasToken() ? '/reviews/mine' : null)
