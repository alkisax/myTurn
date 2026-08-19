import { useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import {
  publicTabletTicketStorageKey,
  publicWebUrl,
} from "@/constants/constants";
import { ThemeContext } from "@/context/ThemeContext";
import { useStaffContext } from "@/context/useStaffContext";
import usePublicTabletTicketResult from "@/hooks/publicPageHooks/usePublicTabletTicketResult";
import { createGlobalStyles } from "@/styles/global";
import { createStaffStyles } from "@/styles/staff.styles";
import type { TicketResult } from "@/types/ticket.types";

const PublicTabletTicketResult = () => {
  const router = useRouter();
  const { session } = useStaffContext();
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStaffStyles(colors);
  const [restoredResult, setRestoredResult] = useState<TicketResult | null>(
    null,
  );
  const { trackingData, secondsRemaining, countdownFinished } =
    usePublicTabletTicketResult(restoredResult);

  const returnHome = useCallback(async () => {
    await AsyncStorage.removeItem(publicTabletTicketStorageKey);
    router.replace("/staff/public-tablet");
  }, [router]);

  useEffect(() => {
    AsyncStorage.getItem(publicTabletTicketStorageKey).then((storedResult) => {
      if (storedResult) {
        setRestoredResult(JSON.parse(storedResult) as TicketResult);
      }
    });
  }, []);

  useEffect(() => {
    if (countdownFinished) {
      void returnHome();
    }
  }, [countdownFinished, returnHome]);

  if (!session || !trackingData) {
    return (
      <View style={[globalStyles.screen, styles.tabletContent]}>
        <Text style={globalStyles.title}>Ticket result unavailable</Text>
        <Pressable
          onPress={() => void returnHome()}
          style={globalStyles.primaryButton}
        >
          <Text style={globalStyles.primaryButtonText}>
            Back to Kiosk Home
          </Text>
        </Pressable>
      </View>
    );
  }

  const result = trackingData;
  const trackingUrl = `${publicWebUrl}/track/${result.ticket.trackingToken}`;

  return (
    <ScrollView
      style={globalStyles.screen}
      contentContainerStyle={styles.tabletContent}
    >
      <Text style={globalStyles.title}>Your Ticket</Text>
      <View style={[globalStyles.card, styles.tabletCard]}>
        <Text style={styles.ticketNumber}>#{result.ticket.number}</Text>
        <Text style={globalStyles.title}>PIN {result.ticket.pin}</Text>
        <Text style={globalStyles.text}>Queue</Text>
        <Text style={globalStyles.text}>{result.queueName}</Text>
        <QRCode value={trackingUrl} size={180} />
        {typeof result.ticket.estimatedWaitingMinutes === "number" ? (
          <>
            <Text style={globalStyles.text}>Estimated Waiting Time</Text>
            <Text style={globalStyles.text}>
              {result.ticket.estimatedWaitingMinutes.toFixed(1)} minutes
            </Text>
          </>
        ) : null}
        <Text style={globalStyles.text}>Services</Text>
        <Text style={globalStyles.text}>
          {result.serviceNames.length > 0
            ? result.serviceNames.join(", ")
            : "None selected"}
        </Text>
        <Text style={globalStyles.text}>Status</Text>
        <Text style={globalStyles.text}>{result.ticket.status}</Text>
      </View>
      <Text style={globalStyles.text}>
        Returning to kiosk home in {secondsRemaining} seconds
      </Text>
      <Pressable
        onPress={() => void returnHome()}
        style={globalStyles.primaryButton}
      >
        <Text style={globalStyles.primaryButtonText}>Back to Kiosk Home</Text>
      </Pressable>
    </ScrollView>
  );
};

export default PublicTabletTicketResult;
