// native\src\app\(protected)\settings.tsx

// settings.tsx

import { View, Text, ScrollView } from 'react-native'
import { useContext } from 'react'
import { UserAuthContext } from '@/authLogin/context/UserAuthContext'
import { ThemeContext } from '@/context/ThemeContext'
import { createGlobalStyles } from '@/styles/global'
import DeleteAccountButton from '@/components/DeleteAccountButton.native'

const Settings = () => {
  const { user } = useContext(UserAuthContext)
  const { colors } = useContext(ThemeContext)
  const globalStyles = createGlobalStyles(colors)

  if (!user) return null

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>

        <Text style={[globalStyles.title, { marginBottom: 20 }]}>
          Settings
        </Text>

        {/* USER INFO */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.text }}>Username: {user.username}</Text>
          <Text style={{ color: colors.textSecondary }}>
            Role: {user.role || user.roles?.[0]}
          </Text>
        </View>

        <DeleteAccountButton />

      </ScrollView>
    </View>
  )
}

export default Settings
