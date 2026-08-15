// frontend\src\authLogin\types\types.ts
import type { ReactNode } from 'react'
import type { JwtPayload } from 'jwt-decode'

// 🔥 ίδιο enum με backend (important)
export type Roles =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'STAFF'
  | 'USER'

export interface IUser {
  id?: string
  _id?: string // legacy support

  username: string
  name?: string
  surname?: string
  email?: string

  hashedPassword?: string
  password?: string

  hasPassword: boolean

  roles: Roles[] // 🔥 UI needs array

  provider?: 'backend'

  favorites?: string[]
}

// 🔥 aligned with sqlite backend JWT
export interface BackendJwtPayload extends JwtPayload {
  id: string
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

export interface BackendUserView {
  id: string
  username: string
  name?: string
  email?: string
  role: Roles
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}