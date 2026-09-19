// native/src/app/_layout.tsx

import { ThemeProvider } from "@/context/ThemeContext";
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
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </UserAdStatusProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
