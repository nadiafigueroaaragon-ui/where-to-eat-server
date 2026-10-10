import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../api/axios'
import type { Town } from '../lib/town'

export function useTowns() {
  const [towns, setTowns] = useState<Town[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')

    api
      .get<Town[]>('/towns', { signal: controller.signal })
      .then((res) => setTowns(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError(err.response?.data?.message || 'Could not load towns. Is the server running?')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt])

  return { towns, loading, error, retry: () => setAttempt((a) => a + 1) }
}