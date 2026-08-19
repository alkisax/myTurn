import { useContext } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useStaffContext } from "@/context/useStaffContext";
import useStaffNumberDisplay from "@/hooks/staffPageHooks/useStaffNumberDisplay";
import { ThemeContext } from "@/context/ThemeContext";
import { createStaffStyles } from "@/styles/staff.styles";

const StaffNumberDisplay = () => {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const styles = createStaffStyles(colors);
  const { session, selectedCompany, desks } = useStaffContext();
  const { queues, queueDisplayState, loading, desksById } =
    useStaffNumberDisplay({
      session,
      selectedCompany,
      desks,
    });

  const handleExit = () => {
    router.replace("/staff");
  };

  if (!session) {
    return (
      <View style={[styles.displayScreen, styles.displayContent]}>
        <Text style={styles.displayTitle}>
          This display requires an active staff session.
        </Text>
        <Pressable onPress={handleExit}>
          <Text style={styles.displayText}>Back to Staff Workspace</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.displayScreen}
      contentContainerStyle={styles.displayContent}
    >
      <View style={styles.displayHeader}>
        <Text style={styles.displayTitle}>MyTurn</Text>
        <Pressable onPress={handleExit}>
          <Text style={styles.displayText}>Exit Number Display</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator color="#d98282" />}

      {!loading && queues.length === 0 && (
        <Text style={styles.displayText}>
          No active queues are available at this location.
        </Text>
      )}

      {queues.map((queue) => {
        const currentEntries = queueDisplayState[queue.id] ?? [];

        return (
          <View key={queue.id} style={styles.displayCard}>
            <Text style={styles.displayDesk}>{queue.name}</Text>

            {currentEntries.length > 0 ? (
              currentEntries.map((current) => (
                <View key={current.deskId} style={styles.displayEntry}>
                  <Text style={styles.displayNumber}>#{current.number}</Text>
                  <Text style={styles.displayText}>PLEASE GO TO</Text>
                  <Text style={styles.displayDesk}>
                    {desksById.get(current.deskId)?.name ??
                      current.deskName ??
                      "the service desk"}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.displayText}>Waiting for next call</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default StaffNumberDisplay;
