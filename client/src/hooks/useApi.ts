import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../api/axios'
import { messageFrom } from '../lib/apiError'

// GET a URL and track loading / error / data. Pass null to skip the request.
// retry() loads again (used by the "Try again" button and after changes).
export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(Boolean(url))
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError('')

    api
      .get<T>(url, { signal: controller.signal })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError(messageFrom(err, 'Could not load this. Is the server running?'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [url, attempt])

  return { data, loading, error, retry: () => setAttempt((a) => a + 1) }
}
