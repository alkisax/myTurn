// native\src\app\register.tsx

import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useContext, useState } from 'react'
import { useRouter } from 'expo-router'
import axios from 'axios'
import { backendUrl } from '../constants/constants'
import BgScreenWrapper from '../components/layout/BgScreenWrapper'

import {
  frontendValidatePassword,
  frontEndValidateEmail,
} from '../authLogin/utils/registerBackend'
import { createGlobalStyles } from '@/styles/global'
import { ThemeContext } from '@/context/ThemeContext'

const Register = () => {
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { colors } = useContext(ThemeContext)
  const globalStyles = createGlobalStyles(colors)

  const handleRegister = async () => {
    setError(null)

    // 🔥 validation (reuse 100%)
    const passError = frontendValidatePassword(password)
    if (passError) return setError(passError)

    const emailError = frontEndValidateEmail(email)
    if (emailError) return setError(emailError)

    if (!username || !name || !email || !password || !confirmPassword) {
      return setError('Please fill in all fields')
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    try {
      setLoading(true)

      const res = await axios.post(`${backendUrl}/auth/register`, {
        username,
        name,
        email,
        password,
      })

      if (res.data.status) {
        Alert.alert('Success 🚀', 'Account created successfully')

        // 👉 redirect to login
        router.replace('/login')
      } else {
        setError(
          res.data.error || res.data.data || 'Registration failed'
        )
      }
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.error || err?.response?.data?.message

      if (backendMsg) {
        setError(Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg)
      } else {
        setError('Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <BgScreenWrapper>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps='handled'
      >

        <View style={[globalStyles.container]}>
          <View style={globalStyles.centered}>
            <Text style={[globalStyles.title, { marginBottom: 20, textAlign: 'center' }]}>Register!</Text>

            <TextInput
              placeholder='Username'
              value={username}
              onChangeText={setUsername}
              style={[globalStyles.input, { marginBottom: 12 }]}
            />

            <TextInput
              placeholder='Full Name'
              value={name}
              onChangeText={setName}
              style={[globalStyles.input, { marginBottom: 12 }]}
            />

            <TextInput
              placeholder='Email'
              value={email}
              onChangeText={setEmail}
              style={[globalStyles.input, { marginBottom: 12 }]}
              autoCapitalize='none'
            />

            <TextInput
              placeholder='Password'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[globalStyles.input, { marginBottom: 12 }]}
            />

            <TextInput
              placeholder='Confirm Password'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={[globalStyles.input, { marginBottom: 12 }]}
            />

            {error && (
              <Text style={[globalStyles.error, { marginBottom: 10 }]}>{error}</Text>
            )}

            <Pressable style={globalStyles.button} onPress={handleRegister}>
              <Text style={globalStyles.buttonText}>
                {loading ? 'Loading...' : 'Register'}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.replace('/login')}>
              <Text style={[globalStyles.link, { marginTop: 12 }]}>
                Already have an account? Login
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={globalStyles.container}>
      </View>
    </BgScreenWrapper>
  )
}

export default Register
