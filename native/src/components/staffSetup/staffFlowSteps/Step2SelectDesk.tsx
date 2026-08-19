import { Pressable, Text, View } from "react-native";
import { useContext } from "react";

import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";
import { createStaffStyles } from "@/styles/staff.styles";
import type { Company, StaffDesk } from "@/types/staff.types";

interface Props {
  company: Company;
  desks: StaffDesk[];
  onSelectDesk: (desk: StaffDesk) => void;
  onBack: () => void;
}

const Step2SelectDesk = ({ company, desks, onSelectDesk, onBack }: Props) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStaffStyles(colors);

  return (
    <View style={styles.stepContainer}>
      <Text style={globalStyles.title}>Step 2 — Choose your desk</Text>
      <Text style={globalStyles.text}>{company.name}</Text>
      <Text style={globalStyles.dimText}>
        Select the desk where you are working today. Your desk determines which
        queue you will serve.
      </Text>

      {desks.map((desk) => (
        <View key={desk.id} style={[globalStyles.card, styles.section]}>
          <Text style={globalStyles.text}>{desk.name}</Text>
          <Text style={globalStyles.text}>
            Location: {desk.locationName}
          </Text>
          <Text style={globalStyles.text}>Queue: {desk.queueName}</Text>
          <Pressable
            disabled={!desk.isActive}
            onPress={() => onSelectDesk(desk)}
            style={[
              globalStyles.primaryButton,
              !desk.isActive && styles.disabled,
            ]}
          >
            <Text style={globalStyles.primaryButtonText}>
              {desk.isActive ? "Select this desk" : "Desk unavailable"}
            </Text>
          </Pressable>
        </View>
      ))}

      {desks.length === 0 && (
        <Text style={globalStyles.dimText}>
          No desks are available for this organization.
        </Text>
      )}

      <Pressable onPress={onBack} style={globalStyles.secondaryButton}>
        <Text style={globalStyles.secondaryButtonText}>Back</Text>
      </Pressable>
    </View>
  );
};

export default Step2SelectDesk;
