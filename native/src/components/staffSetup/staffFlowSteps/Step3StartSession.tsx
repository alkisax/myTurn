import { Pressable, Text, View } from "react-native";
import { useContext } from "react";

import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";
import { createStaffStyles } from "@/styles/staff.styles";
import type { Company, StaffDesk } from "@/types/staff.types";

interface Props {
  company: Company;
  desk: StaffDesk;
  loading: boolean;
  errorMessage: string;
  onStart: () => void;
  onBack: () => void;
}

const Step3StartSession = ({
  company,
  desk,
  loading,
  errorMessage,
  onStart,
  onBack,
}: Props) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStaffStyles(colors);

  return (
    <View style={styles.stepContainer}>
      <Text style={globalStyles.title}>Step 3 — Start your shift</Text>
      <Text style={globalStyles.dimText}>
        Confirm your workplace before starting your staff session.
      </Text>

      <View style={[globalStyles.card, styles.section]}>
        <Text style={globalStyles.text}>{company.name}</Text>
        <Text style={globalStyles.text}>Location: {desk.locationName}</Text>
        <Text style={globalStyles.text}>Desk: {desk.name}</Text>
        <Text style={globalStyles.text}>Queue: {desk.queueName}</Text>
      </View>

      {errorMessage ? (
        <Text style={globalStyles.error}>{errorMessage}</Text>
      ) : null}

      <Pressable
        disabled={loading}
        onPress={onStart}
        style={[globalStyles.primaryButton, loading && styles.disabled]}
      >
        <Text style={globalStyles.primaryButtonText}>
          {loading ? "Starting..." : "Start Shift"}
        </Text>
      </Pressable>

      <Pressable
        disabled={loading}
        onPress={onBack}
        style={[globalStyles.secondaryButton, loading && styles.disabled]}
      >
        <Text style={globalStyles.secondaryButtonText}>Back</Text>
      </Pressable>
    </View>
  );
};

export default Step3StartSession;
