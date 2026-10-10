import type { Restaurant } from './types'

export type Town = {
  _id: string
  name: string
  description?: string
}

export type TownWithRestaurants = {
  town: Town
  count: number
  restaurants: Restaurant[]
}