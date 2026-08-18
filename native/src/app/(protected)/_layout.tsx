// native\src\app\(protected)\_layout.tsx

import { Text } from 'react-native'
import { UserAuthContext } from "@/authLogin/context/UserAuthContext"
import { Stack, useRouter } from "expo-router"
import { useContext, useEffect } from "react"

const ProtectedLayout = () => {
  const { user } = useContext(UserAuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.replace('/login')
    }
  }, [router, user])

  if (!user) return <Text>Loading...</Text>

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
          paddingTop: 0
        },
      }}
    />
  )
}
export default ProtectedLayout

