import { useContext } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ThemeContext } from "@/context/ThemeContext";
import { useStaffContext } from "@/context/useStaffContext";
import usePublicTablet from "@/hooks/publicPageHooks/usePublicTablet";
import { createGlobalStyles } from "@/styles/global";
import { createStaffStyles } from "@/styles/staff.styles";

const PublicTablet = () => {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStaffStyles(colors);
  const { session, selectedCompany, selectedDesk, desks } = useStaffContext();
  const { number, deskId } = usePublicTablet({ session, selectedCompany });
  const servingDesk = desks.find((desk) => desk.id === deskId);

  const handleBack = () => {
    router.replace("/staff");
  };

  if (!session) {
    return (
      <View style={[globalStyles.screen, styles.tabletContent]}>
        <Text style={globalStyles.title}>Public tablet unavailable</Text>
        <Text style={globalStyles.text}>
          This public tablet requires an active staff session.
        </Text>
        <Pressable onPress={handleBack} style={globalStyles.primaryButton}>
          <Text style={globalStyles.primaryButtonText}>
            Back to Staff Workspace
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.screen}
      contentContainerStyle={styles.tabletContent}
    >
      <Text style={globalStyles.title}>MyTurn</Text>
      <Text style={globalStyles.text}>NOW SERVING</Text>
      <View style={[globalStyles.card, styles.tabletCard]}>
        {number === null ? (
          <Text style={globalStyles.text}>
            Waiting for the next customer call
          </Text>
        ) : (
          <>
            <Text style={styles.ticketNumber}>#{number}</Text>
            <Text style={globalStyles.text}>Please go to</Text>
            <Text style={globalStyles.title}>
              {servingDesk?.name ?? "the service desk"}
            </Text>
          </>
        )}
        <Text style={globalStyles.dimText}>
          {selectedCompany?.name} · {selectedDesk?.queueName}
        </Text>
      </View>
      <Pressable
        onPress={() => router.push("/staff/public-tablet/issue")}
        style={globalStyles.primaryButton}
      >
        <Text style={globalStyles.primaryButtonText}>Issue a Ticket</Text>
      </Pressable>
    </ScrollView>
  );
};

export default PublicTablet;
