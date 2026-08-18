// native\src\authLogin\types\types.ts

import type { ReactNode } from 'react'
import type { JwtPayload } from 'jwt-decode'

// 🔥 ίδιο enum με backend (important)
export type Roles = 'ADMIN' | 'STAFF' | 'USER'

export interface IUser {
  id?: number
  _id?: number // legacy support

  username: string
  name?: string
  surname?: string
  email?: string

  hashedPassword?: string
  password?: string

  hasPassword: boolean

  role?: Roles
  roles: Roles[] // 🔥 UI needs array

  provider?: 'backend'

  favorites?: string[]
}

// 🔥 aligned with sqlite backend JWT
export interface BackendJwtPayload extends JwtPayload {
  id: number
  username: string
  email?: string
  name?: string

  role: Roles // 🔥 single role από backend
}

export interface UserAuthContextType {
  user: IUser | null
  setUser: (user: IUser | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  refreshUser: () => Promise<void>
}

// Props type for the provider
export interface UserProviderProps {
  children: ReactNode
}

// for updating a user (future use)
export interface UpdateUser {
  username?: string
  name?: string
  roles?: Roles[]
  password?: string
  hashedPassword?: string
  favorites?: string[]
}