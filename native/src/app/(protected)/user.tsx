// native\src\app\(protected)\user.tsx

// OFFLINE-FIRST AUTH FLOW:
// login online → παίρνουμε JWT → το σώζουμε AsyncStorage
// μετά:
// - app restart → decode JWT → user υπάρχει
// - server offline → fallback σε JWT user
// - notes → φορτώνονται από local SQLite
// 👉 full offline experience
// όταν ξαναγίνει online:
// - backend validation γίνεται κανονικά

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { useEffect, useState, useContext, useCallback } from 'react'
// καλούμε το api που φτιάξαμε στο authlogin/services για να κάνει intercept το 401 γιατι τώρα κρατάμε Logged in τον χρηστη οταν offline
import { api } from '@/authLogin/services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { backendUrl } from '../../constants/constants'
import { UserAuthContext } from '../../authLogin/context/UserAuthContext'
import BgScreenWrapper from '../../components/layout/BgScreenWrapper'
import { createGlobalStyles } from '@/styles/global'
import { useFocusEffect, useRouter } from 'expo-router'
import { ThemeContext } from '@/context/ThemeContext'


type UserData = {
  id: number
  username: string
  role?: string
  roles?: string[]
}

export default function UserPage() {
  const { colors } = useContext(ThemeContext)
  const globalStyles = createGlobalStyles(colors)

  const [user, setUser] = useState<UserData | null>(null)

  const { user: authUser } = useContext(UserAuthContext)
  const userId = authUser?._id || authUser?.id

  const router = useRouter()
  const styles = createStyles(colors) // χρειαστηκε γιατι το colors δεν έφτανε στο styles

  const fetchUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      // αν δεν υπάρχει userId:
      // σημαίνει ότι:
      // - context δεν έχει φορτώσει ακόμα ή
      // - είμαστε offline και δεν έχουμε full backend user
      // fallback σε authUser (decoded από JWT) ώστε: - να μην μείνει η οθόνη σε loading - να δείξουμε basic user info
      if (!userId) {
        if (authUser) {
          setUser({
            id: Number(authUser._id || authUser.id),
            username: authUser.username,
            role: authUser.roles?.[0],
          })
        }
        return
      }

      const res = await api.get(
        `${backendUrl}/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setUser(res.data.data)
    } catch (err) {
      console.log(err)

      // αν αποτύχει το API call (π.χ. server offline) χρησιμοποιούμε τα δεδομένα από το JWT (authUser). Έτσι: - app συνεχίζει να δουλεύει offline - user βλέπει notes κανονικά (local DB)
      if (authUser) {
        console.log('USER ID:', userId)
        setUser({
          id: Number(authUser._id || authUser.id),
          username: authUser.username,
          role: authUser.roles?.[0],
        })
      }
    }
  }, [authUser, userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])



  // 🎯 unified user source (online + offline)
  // priority: 1. backend user (full data) 2. fallback authUser (JWT)
  const displayUser = user || (
    authUser && {
      id: Number(authUser._id || authUser.id),
      username: authUser.username,
      role: authUser.roles?.[0],
    }
  )

  if (!displayUser) {
    return (
      <BgScreenWrapper>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </BgScreenWrapper>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          globalStyles.scrollContainer,
          { paddingBottom: 80 }
        ]}
      >
        {/* 👤 USER */}
        <View>
          <Text style={globalStyles.title}>{displayUser.username}</Text>
          <Text style={styles.value}>
            {displayUser.role || displayUser.roles?.[0]}
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

const createStyles = (colors: Record<string, string>) =>
  StyleSheet.create({
    value: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
      opacity: 0.8,
    },
  })