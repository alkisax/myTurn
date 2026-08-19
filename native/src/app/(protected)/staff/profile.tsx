import { useContext } from "react";
import { ScrollView, Text, View } from "react-native";

import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import StaffScreenLayout from "@/components/staffSetup/StaffScreenLayout";
import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";
import { createStaffStyles } from "@/styles/staff.styles";

const StaffProfile = () => {
  const { user } = useContext(UserAuthContext);
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStaffStyles(colors);

  return (
    <StaffScreenLayout>
      <ScrollView
        style={globalStyles.screen}
        contentContainerStyle={styles.content}
      >
        <View style={styles.stepContainer}>
          <Text style={globalStyles.title}>My Profile</Text>
          <Text style={globalStyles.dimText}>
            This page shows the information associated with your MyTurn staff
            account.
          </Text>
          <View style={[globalStyles.card, styles.section]}>
            <Text style={globalStyles.text}>
              Name: {user?.name || "Not provided"}
            </Text>
            <Text style={globalStyles.text}>
              Username: {user?.username || "Not provided"}
            </Text>
            <Text style={globalStyles.text}>
              Email: {user?.email || "Not provided"}
            </Text>
            <Text style={globalStyles.text}>
              Role: {user?.roles.join(", ") || "Not provided"}
            </Text>
            <Text style={globalStyles.text}>
              User ID: {user?.id || user?._id || "Not provided"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </StaffScreenLayout>
  );
};

export default StaffProfile;
