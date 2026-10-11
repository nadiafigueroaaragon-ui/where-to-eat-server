import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../api/axios'
import type { TownWithRestaurants } from '../lib/town'

export function useTown(id: string | undefined) {
  const [data, setData] = useState<TownWithRestaurants | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!id) return

    const controller = new AbortController()
    setLoading(true)
    setError('')
    setNotFound(false)

    api
      .get<TownWithRestaurants>(`/towns/${id}/restaurants`, { signal: controller.signal })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return
        const status = err.response?.status
        // 404 = no such town, 400 = the id is not a valid id
        if (status === 404 || status === 400) setNotFound(true)
        else setError(err.response?.data?.message || 'Could not load this town. Is the server running?')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [id, attempt])

  return { data, loading, error, notFound, retry: () => setAttempt((a) => a + 1) }
}