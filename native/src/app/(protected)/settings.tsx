// native\src\app\(protected)\settings.tsx

// settings.tsx

import { View, Text, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useContext } from 'react'
import { AdsConsentPrivacyOptionsRequirementStatus } from 'react-native-google-mobile-ads'
import { UserAuthContext } from '@/authLogin/context/UserAuthContext'
import { useAdsConsent } from '@/context/AdsConsentContext'
import { ThemeContext } from '@/context/ThemeContext'
import { createGlobalStyles } from '@/styles/global'
import DeleteAccountButton from '@/components/DeleteAccountButton.native'

const Settings = () => {
  const { user } = useContext(UserAuthContext)
  const { colors } = useContext(ThemeContext)
  const globalStyles = createGlobalStyles(colors)
  const {
    privacyOptionsRequirementStatus,
    showPrivacyOptions,
  } = useAdsConsent()

  if (!user) return null

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
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

        {privacyOptionsRequirementStatus ===
          AdsConsentPrivacyOptionsRequirementStatus.REQUIRED && (
            <Pressable
              onPress={() => void showPrivacyOptions()}
              style={globalStyles.primaryButton}
            >
              <Text style={globalStyles.primaryButtonText}>
                Privacy choices
              </Text>
            </Pressable>
          )}

      </ScrollView>
    </SafeAreaView>
  )
}

export default Settings
