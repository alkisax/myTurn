import { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { ThemeContext } from "@/context/ThemeContext";
import { publicTabletTicketStorageKey } from "@/constants/constants";
import { useStaffContext } from "@/context/useStaffContext";
import usePublicTabletIssueTicket from "@/hooks/publicPageHooks/usePublicTabletIssueTicket";
import { createGlobalStyles } from "@/styles/global";
import { createStaffStyles } from "@/styles/staff.styles";

const PublicTabletIssueTicket = () => {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStaffStyles(colors);
  const { session, selectedCompany, selectedDesk } = useStaffContext();
  const ticketOptions = usePublicTabletIssueTicket({
    session,
    selectedCompany,
    selectedDesk,
  });

  const handleIssueTicket = async () => {
    const result = await ticketOptions.issueTicket();

    if (!result) {
      return;
    }

    await AsyncStorage.setItem(
      publicTabletTicketStorageKey,
      JSON.stringify(result),
    );
    router.push("/staff/public-tablet/ticket");
  };

  return (
    <ScrollView
      style={globalStyles.screen}
      contentContainerStyle={styles.tabletContent}
    >
      <Text style={globalStyles.title}>Issue a Ticket</Text>
      <TextInput
        value={ticketOptions.email}
        onChangeText={ticketOptions.setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email (optional)"
        placeholderTextColor={colors.dimText}
        style={[globalStyles.input, styles.fullWidth]}
      />

      <View style={[globalStyles.card, styles.tabletCard]}>
        <Text style={globalStyles.text}>Choose Queue</Text>
        {ticketOptions.queues.map((queue) => {
          const selected = ticketOptions.selectedQueueId === queue.id;

          return (
            <Pressable
              key={queue.id}
              disabled={!queue.isActive}
              onPress={() => ticketOptions.setSelectedQueueId(queue.id)}
              style={[
                globalStyles.secondaryButton,
                selected && globalStyles.primaryButtonActive,
                !queue.isActive && styles.disabled,
              ]}
            >
              <Text style={globalStyles.secondaryButtonText}>{queue.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {ticketOptions.selectedQueueId ? (
        <View style={[globalStyles.card, styles.tabletCard]}>
          <Text style={globalStyles.text}>Services (optional)</Text>
          {ticketOptions.services.map((service) => {
            const selected = ticketOptions.selectedServiceIds.includes(
              service.id,
            );

            return (
              <Pressable
                key={service.id}
                onPress={() => ticketOptions.toggleService(service.id)}
                style={globalStyles.secondaryButton}
              >
                <Text style={globalStyles.secondaryButtonText}>
                  {selected ? "☑" : "☐"} {service.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {ticketOptions.location ? (
        <Text style={globalStyles.dimText}>{ticketOptions.location.name}</Text>
      ) : null}
      {ticketOptions.errorMessage ? (
        <Text style={globalStyles.error}>{ticketOptions.errorMessage}</Text>
      ) : null}

      <Pressable
        disabled={
          ticketOptions.loading || ticketOptions.selectedQueueId === null
        }
        onPress={() => void handleIssueTicket()}
        style={[
          globalStyles.primaryButton,
          (ticketOptions.loading || ticketOptions.selectedQueueId === null) &&
            styles.disabled,
        ]}
      >
        <Text style={globalStyles.primaryButtonText}>
          {ticketOptions.loading ? "Issuing..." : "Issue Ticket"}
        </Text>
      </Pressable>
      <Pressable
        onPress={() =>
          router.replace("/staff/public-tablet")
        }
        style={globalStyles.secondaryButton}
      >
        <Text style={globalStyles.secondaryButtonText}>Back to Kiosk Home</Text>
      </Pressable>
    </ScrollView>
  );
};

export default PublicTabletIssueTicket;
