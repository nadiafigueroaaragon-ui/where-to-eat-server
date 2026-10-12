import type { Restaurant } from './types'
import type { OpeningHours } from './hours'

// What GET /restaurants/:id returns (the list card type plus the extra detail fields)
export type RestaurantDetail = Restaurant & {
  openingHours?: OpeningHours
  seatsPerSlot?: number
  status?: 'pending' | 'approved' | 'rejected'
}
