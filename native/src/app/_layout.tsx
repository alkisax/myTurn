// native/src/app/_layout.tsx

import { RoomProvider } from '@/context/RoomContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RoomProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </RoomProvider>
    </ThemeProvider>
  );
}