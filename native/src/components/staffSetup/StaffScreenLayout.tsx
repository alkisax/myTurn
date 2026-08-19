import { useContext, type ReactNode } from "react";
import { View } from "react-native";

import { ThemeContext } from "@/context/ThemeContext";
import Navbar from "@/layout/Navbar";
import { createGlobalStyles } from "@/styles/global";

const StaffScreenLayout = ({ children }: { children: ReactNode }) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  return (
    <View style={globalStyles.screen}>
      <Navbar />
      {children}
    </View>
  );
};

export default StaffScreenLayout;
