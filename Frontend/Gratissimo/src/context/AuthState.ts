import { createContext } from 'react'

export type User = {
  id: number
  firstname: string
  lastname: string
}

export type AuthContextValue = {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  setSession: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
