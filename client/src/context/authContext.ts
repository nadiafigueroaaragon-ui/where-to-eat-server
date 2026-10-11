import { createContext } from 'react'

export type Role = 'traveler' | 'owner' | 'admin'

export interface User {
  _id?: string
  id?: string
  name: string
  email: string
  role: Role
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  role: 'traveler' | 'owner'
}

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
