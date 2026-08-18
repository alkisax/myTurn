// native/src/app/(protected)/user.tsx

import { useContext, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { UserAuthContext } from '@/authLogin/context/UserAuthContext'
import { api } from '@/authLogin/services/api'
import { backendUrl } from '@/constants/constants'
import { ThemeContext } from '@/context/ThemeContext'
import { useRoomContext } from '@/context/RoomContext'
import Navbar from '@/layout/Navbar'
import { createGlobalStyles } from '@/styles/global'

type UserData = {
  id: number
  username: string
  name?: string
  email?: string
  role?: string
}

const UserPage = () => {
  const { colors } = useContext(ThemeContext)
  const { user } = useContext(UserAuthContext)
  const globalStyles = createGlobalStyles(colors)

  const {
    roomCode,
    setRoomCode,
    username,
    setUsername,
    isConnected,
    hasPeer,
    connectToChatRoom,
    disconnectFromChatRoom,
  } = useRoomContext()

  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    if (!user?.id) {
      return
    }

    const loadUser = async () => {
      const token = await AsyncStorage.getItem('token')

      const response = await api.get(
        `${backendUrl}/users/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setUserData(response.data.data)
    }

    void loadUser()
  }, [user?.id])

  return (
    <View style={globalStyles.screen}>
      <Navbar
        roomId={roomCode}
        setRoomId={setRoomCode}
        username={username}
        setUsername={setUsername}
        handleConnectSocket={connectToChatRoom}
        handleDisconnectSocket={disconnectFromChatRoom}
        isConnected={isConnected}
        hasPeer={hasPeer}
      />

      <View style={globalStyles.centerContent}>
        <Text style={globalStyles.title}>User</Text>

        {userData ? (
          <>
            <Text style={globalStyles.title}>
              Username: {userData.username}
            </Text>

            <Text style={globalStyles.title}>
              Name: {userData.name || '-'}
            </Text>

            <Text style={globalStyles.title}>
              Email: {userData.email || '-'}
            </Text>

            <Text style={globalStyles.title}>
              Role: {userData.role || '-'}
            </Text>
          </>
        ) : (
          <Text style={globalStyles.title}>Loading...</Text>
        )}
      </View>
    </View>
  )
}

export default UserPage