import api from './axios'

export type RestaurantStatus = 'pending' | 'approved' | 'rejected'

export type DayHours = { open?: string; close?: string; closed?: boolean }

/* TODO: once you're ready, replace this with the shared Restaurant type in lib/types.ts */
export type RestaurantRecord = {
  _id: string
  name: string
  town: string
  area?: string
  address: string
  description?: string
  cuisine?: string
  diningType?: string
  priceLevel?: string
  averageMealCost?: number
  seatsPerSlot?: number
  rating?: number
  reviewCount?: number
  status: RestaurantStatus
  images?: string[]
  location?: { type: 'Point'; coordinates: [number, number] }
  openingHours?: Record<string, DayHours>
}

export type RestaurantPayload = Omit<
  RestaurantRecord,
  '_id' | 'status' | 'rating' | 'reviewCount'
>

export type TownOption = { _id: string; name: string }

function unwrapList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[]
  const inner = (data as Record<string, unknown> | null)?.[key]
  return Array.isArray(inner) ? (inner as T[]) : []
}

function unwrapOne<T>(data: unknown, key: string): T {
  const obj = data as Record<string, unknown> | null
  return (obj?.[key] ?? data) as T
}

export function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string } } }
  return e?.response?.data?.message ?? fallback
}

export async function getRestaurants(status?: RestaurantStatus) {
  const res = await api.get('/restaurants', { params: status ? { status } : {} })
  return unwrapList<RestaurantRecord>(res.data, 'restaurants')
}

export async function getMyRestaurants() {
  const res = await api.get('/restaurants/mine')
  return unwrapList<RestaurantRecord>(res.data, 'restaurants')
}

export async function getRestaurant(id: string) {
  const res = await api.get(`/restaurants/${id}`)
  return unwrapOne<RestaurantRecord>(res.data, 'restaurant')
}

export async function createRestaurant(payload: RestaurantPayload) {
  const res = await api.post('/restaurants', payload)
  return unwrapOne<RestaurantRecord>(res.data, 'restaurant')
}

export async function updateRestaurant(id: string, payload: RestaurantPayload) {
  const res = await api.put(`/restaurants/${id}`, payload)
  return unwrapOne<RestaurantRecord>(res.data, 'restaurant')
}

export async function deleteRestaurant(id: string) {
  await api.delete(`/restaurants/${id}`)
}

export async function setRestaurantStatus(id: string, status: RestaurantStatus) {
  const res = await api.patch(`/restaurants/${id}/status`, { status })
  return unwrapOne<RestaurantRecord>(res.data, 'restaurant')
}

export async function getTowns() {
  const res = await api.get('/towns')
  return unwrapList<TownOption>(res.data, 'towns')
}