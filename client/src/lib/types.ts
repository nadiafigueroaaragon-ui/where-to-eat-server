export type Restaurant = {
  _id: string
  name: string
  town: string
  area?: string
  address: string
  cuisine: string
  diningType: string
  priceLevel: string
  averageMealCost: number
  rating: number
  reviewCount: number
  description?: string
  imageUrl?: string
  walkMinutes?: number
  distanceMeters?: number
}