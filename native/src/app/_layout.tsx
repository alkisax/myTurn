// native/src/app/_layout.tsx

import { RoomProvider } from "@/context/RoomContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/authLogin/context/UserAuthContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <RoomProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </RoomProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
