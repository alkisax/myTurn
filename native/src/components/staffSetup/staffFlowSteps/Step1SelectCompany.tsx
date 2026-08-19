import { Pressable, Text, View } from "react-native";
import { useContext } from "react";

import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";
import { createStaffStyles } from "@/styles/staff.styles";
import type { Company } from "@/types/staff.types";

interface Props {
  companies: Company[];
  onSelectCompany: (companyId: number) => void;
}

const Step1SelectCompany = ({ companies, onSelectCompany }: Props) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStaffStyles(colors);

  return (
    <View style={styles.stepContainer}>
      <Text style={globalStyles.title}>Step 1 — Choose your organization</Text>
      <Text style={globalStyles.dimText}>
        Select the organization where you are working today.
      </Text>

      {companies.map((company) => (
        <Pressable
          key={company.id}
          onPress={() => onSelectCompany(company.id)}
          style={globalStyles.secondaryButton}
        >
          <Text style={globalStyles.secondaryButtonText}>{company.name}</Text>
        </Pressable>
      ))}

      {companies.length === 0 && (
        <Text style={globalStyles.dimText}>
          No organizations are assigned to your account.
        </Text>
      )}
    </View>
  );
};

export default Step1SelectCompany;
