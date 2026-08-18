// native\src\app\login.tsx

import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { UserAuthContext } from '../authLogin/context/UserAuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
// καλούμε το api που φτιάξαμε στο authlogin/services για να κάνει intercept το 401 γιατι τώρα κρατάμε Logged in τον χρηστη οταν offline
import { api } from '@/authLogin/services/api'
import { backendUrl } from '../constants/constants'
import BgScreenWrapper from '../components/layout/BgScreenWrapper'
import { Ionicons } from '@expo/vector-icons'
import { ThemeContext } from '@/context/ThemeContext'
import { createGlobalStyles } from '@/styles/global'

const Login = () => {
  const { colors } = useContext(ThemeContext)
  const globalStyles = createGlobalStyles(colors)
  const { user, setUser } = useContext(UserAuthContext)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // reveal password toggle
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  // αν είναι ήδη logged in → redirect
  useEffect(() => {
    if (user) {
      router.replace('/')
    }
  }, [router, user])

  const handleLogin = async () => {
    try {
      const res = await api.post(
        `${backendUrl}/auth/login`,
        { username, password }
      )

      if (res.data.status) {
        const { token, user } = res.data.data

        // console.log('TOKEN:', token)

        // save token (RN)
        await AsyncStorage.setItem('token', token)

        // trigger context refresh (temporary hack)
        setUser(user)

        console.log('LOGIN OK')

        // redirect μετά login
        setUser(user)

        setTimeout(() => {
          router.replace('/user')
        }, 100)
      }
    } catch (err: unknown) {
      console.log('LOGIN ERROR', err)

      if (err instanceof Error) {
        // axios error check
        if ('response' in err) {
          const axiosErr = err as {
            response?: { status?: number }
          }

          const status = axiosErr.response?.status

          if (status === 401 || status === 400) {
            Alert.alert('Error', 'Wrong username or password')
            return
          }
        }
      }

      Alert.alert('Error', 'Login failed')
    }
  }

  return (
    <BgScreenWrapper>
      <View style={[globalStyles.container, globalStyles.centered]}>
        <Text style={[globalStyles.title, { marginBottom: 20, textAlign: 'center' }]}>Login</Text>

        {/* username */}
        <TextInput
          placeholder='Username'
          value={username}
          onChangeText={setUsername}
          placeholderTextColor='rgba(255,255,255,0.5)'
          style={[globalStyles.input, { marginBottom: 12 }]}
        />

        {/* password + reveal */}
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder='Password'
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={[globalStyles.input, { marginBottom: 12 }]}
            placeholderTextColor='rgba(255,255,255,0.5)'
          />

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 12,
              top: '20%',
              // transform: [{ translateY: -10 }],
            }}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.secondary}
            />
          </Pressable>
        </View>

        {/* login button */}
        <Pressable style={globalStyles.button} onPress={handleLogin}>
          <Text style={globalStyles.buttonText}>Login</Text>
        </Pressable>

        {/* register link */}
        <Pressable onPress={() => router.push('/register')}>
          <Text style={[globalStyles.link, { marginTop: 12 }]}>
            Don’t have an account? Register
          </Text>
        </Pressable>

      </View>
    </BgScreenWrapper>
  )
}

export default Login
