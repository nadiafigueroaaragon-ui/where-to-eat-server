import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import api from '../api/axios'
import { AuthContext, type RegisterInput, type User } from './authContext'

async function fetchMe(): Promise<User> {
  const res = await api.get('/auth/me')
  const body = res.data as { user?: User } & Partial<User>
  return body.user ?? (body as User)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Only "loading" when there is a saved token we still need to check
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))

  // On page load, restore the session from the saved token
  useEffect(() => {
    if (!localStorage.getItem('token')) return
    let cancelled = false
    fetchMe()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch(() => localStorage.removeItem('token')) // expired or invalid token
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const body = res.data as { token: string; user?: User }
    localStorage.setItem('token', body.token)
    setUser(body.user ?? (await fetchMe()))
  }, [])

  const register = useCallback(
    async (data: RegisterInput) => {
      const res = await api.post('/auth/register', data)
      const body = res.data as { token?: string; user?: User }
      if (body.token) {
        localStorage.setItem('token', body.token)
        setUser(body.user ?? (await fetchMe()))
      } else {
        await login(data.email, data.password)
      }
    },
    [login],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
