import { useCallback, useEffect, useState } from 'react'
import api from '../api/axios'
import type { Town } from '../lib/town'
import type { TownFormValues } from '../lib/townSchema'

function messageFrom(err: unknown, fallback: string) {
  const e = err as { response?: { status?: number; data?: { message?: string } } }
  if (e.response?.status === 401) return 'Please log in as an admin first.'
  if (e.response?.status === 403) return 'Only an admin can do this.'
  return e.response?.data?.message || fallback
}

export function useTownAdmin() {
  const [towns, setTowns] = useState<Town[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get<Town[]>('/towns')
      setTowns(res.data)
    } catch (err) {
      setError(messageFrom(err, 'Could not load towns. Is the server running?'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Each action throws a readable message on failure, so the page can show it
  async function createTown(values: TownFormValues) {
    try {
      await api.post('/towns', values)
    } catch (err) {
      throw new Error(messageFrom(err, 'Could not add the town.'))
    }
    await load()
  }

  async function updateTown(id: string, values: TownFormValues) {
    try {
      await api.put(`/towns/${id}`, values)
    } catch (err) {
      throw new Error(messageFrom(err, 'Could not update the town.'))
    }
    await load()
  }

  async function deleteTown(id: string) {
    try {
      await api.delete(`/towns/${id}`)
    } catch (err) {
      throw new Error(messageFrom(err, 'Could not delete the town.'))
    }
    await load()
  }

  return { towns, loading, error, reload: load, createTown, updateTown, deleteTown }
}