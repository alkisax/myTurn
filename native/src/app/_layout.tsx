// native/src/app/_layout.tsx

import { ThemeProvider } from "@/context/ThemeContext";
import { AdsConsentProvider } from "@/context/AdsConsentContext";
import { UserAdStatusProvider } from "@/context/UserAdStatusContext";
import { UserProvider } from "@/authLogin/context/UserAuthContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <UserAdStatusProvider>
            <AdsConsentProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
            </AdsConsentProvider>
          </UserAdStatusProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
