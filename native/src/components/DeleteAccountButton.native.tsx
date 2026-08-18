// native\src\components\DeleteAccountButton.native.tsx

import { Pressable, Text, Alert, Platform } from 'react-native'
// καλούμε το api που φτιάξαμε στο authlogin/services για να κάνει intercept το 401 γιατι τώρα κρατάμε Logged in τον χρηστη οταν offline
import { api } from '@/authLogin/services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { backendUrl } from '../constants/constants'
import { handleLogout } from '@/authLogin/authFunctions'
import { useContext } from 'react'
import { UserAuthContext } from '@/authLogin/context/UserAuthContext'
import { router } from 'expo-router'
import { createGlobalStyles } from '@/styles/global'
import { ThemeContext } from '@/context/ThemeContext'

type Props = {
  userId: number
}

const DeleteAccountButton = ({ userId }: Props) => {

  const { setUser } = useContext(UserAuthContext)
  const { colors } = useContext(ThemeContext)
  const globalStyles = createGlobalStyles(colors)

  const handleDelete = () => {
    console.log("PRESS TEST")

    if (Platform.OS === 'web') {
      const confirm = window.confirm(
        'Are you sure you want to delete your account?'
      )

      if (!confirm) return

      executeDelete()
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: executeDelete,
          },
        ]
      )
    }
  }

  const executeDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('token')

      await api.delete(
        `${backendUrl}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      Alert.alert('Account deleted')

      // 🔥 σωστό logout
      await handleLogout(setUser)

      console.log('User deleted → logged out')

      router.replace('/login')

    } catch (err) {
      console.log(err)
      Alert.alert('Error deleting account')
    }
  }

  return (
    <Pressable
      onPress={handleDelete}
      style={[
        globalStyles.primaryButton,
        {
          backgroundColor: colors.alert,
          alignSelf: 'center',
          width: '60%',
          maxWidth: 220,
        },
      ]}
    >
      <Text
        style={{
          color: 'white',
          fontWeight: '600',
          fontSize: 14,
        }}
      >
        Delete Account
      </Text>
    </Pressable>
  )
}

export default DeleteAccountButton