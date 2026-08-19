import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, Stack } from "expo-router";

import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { StaffProvider } from "@/context/StaffContext";
import { ThemeContext } from "@/context/ThemeContext";
import { createStaffStyles } from "@/styles/staff.styles";

export default function StaffLayout() {
  const { user, isLoading } = useContext(UserAuthContext);
  const { colors } = useContext(ThemeContext);
  const styles = createStaffStyles(colors);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user?.roles.includes("STAFF")) {
    return <Redirect href="/" />;
  }

  return (
    <StaffProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </StaffProvider>
  );
}
