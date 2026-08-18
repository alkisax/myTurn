// native/src/app/_layout.tsx

import { RoomProvider } from "@/context/RoomContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/authLogin/context/UserAuthContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
  );
}
