import { useContext, type ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemeContext } from "@/context/ThemeContext";
import Navbar from "@/layout/Navbar";
import { createGlobalStyles } from "@/styles/global";

const StaffScreenLayout = ({ children }: { children: ReactNode }) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  return (
    <SafeAreaView edges={["bottom"]} style={globalStyles.screen}>
      <Navbar />
      {children}
    </SafeAreaView>
  );
};

export default StaffScreenLayout;
