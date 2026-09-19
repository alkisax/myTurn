// native/src/app/_layout.tsx

import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/authLogin/context/UserAuthContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
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
