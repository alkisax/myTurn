// native/src/app/_layout.tsx

import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/authLogin/context/UserAuthContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import mobileAds from "react-native-google-mobile-ads";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    void mobileAds()
      .initialize()
      .catch((error: unknown) => {
        console.warn("Native ads SDK failed to initialize:", error);
      });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
