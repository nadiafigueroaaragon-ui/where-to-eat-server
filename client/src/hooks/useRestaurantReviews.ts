import { useApi } from './useApi'
import type { Review } from '../lib/review'

// Approved reviews of one restaurant (public)
export const useRestaurantReviews = (restaurantId: string | undefined) =>
  useApi<Review[]>(restaurantId ? `/restaurants/${restaurantId}/reviews` : null)
