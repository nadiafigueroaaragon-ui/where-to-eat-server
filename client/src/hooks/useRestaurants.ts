import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../api/axios'
import type { Filters } from '../lib/filters'
import type { Restaurant } from '../lib/types'
import type { Coords } from './useGeolocation'

export function useRestaurants(filters: Filters, coords: Coords | null, waiting: boolean) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search.trim())

  const { search, rating, priceLevel, sort, cuisine, diningType, walkMinutes } = filters
  const lat = coords?.lat
  const lng = coords?.lng
  // Derived while rendering: use the distance endpoint only when we know where the traveler is
  const byDistance = Boolean(walkMinutes) && lat !== undefined && lng !== undefined

  // Wait until the person stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (waiting) return // wait for the browser to give us the location

    const controller = new AbortController()
    setLoading(true)
    setError('')

    const shared = {
      q: debouncedSearch || undefined,
      minRating: rating || undefined,
      priceLevel: priceLevel || undefined,
      cuisine: cuisine || undefined,
      diningType: diningType || undefined,
    }

    const request = byDistance
      ? api.get<Restaurant[]>('/restaurants/nearby', {
          params: { ...shared, lat, lng, minutes: walkMinutes },
          signal: controller.signal,
        })
      : api.get<Restaurant[]>('/restaurants/search', {
          params: { ...shared, sort: sort || undefined },
          signal: controller.signal,
        })

    request
      .then((res) => setRestaurants(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError(err.response?.data?.message || 'Could not load restaurants. Is the server running?')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedSearch, rating, priceLevel, sort, cuisine, diningType, walkMinutes, byDistance, lat, lng, waiting, attempt])

  return { restaurants, loading: loading || waiting, error, retry: () => setAttempt((a) => a + 1) }
}