// native\src\authLogin\authFunctions.ts

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { IUser } from './types/types'

type SetUser = (user: IUser | null) => void

export const handleLogout = async (setUser: SetUser) => {
  try {
    // remove token
    await AsyncStorage.removeItem('token')

    // clear state
    setUser(null)

    console.log('LOGOUT OK')
  } catch (error) {
    console.error('Logout error:', error)
  }
}