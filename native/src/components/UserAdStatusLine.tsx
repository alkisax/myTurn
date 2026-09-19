import { useContext } from "react";
import { Text } from "react-native";

import { ThemeContext } from "@/context/ThemeContext";

interface UserAdStatusLineProps {
  hasPaid: boolean;
  adFreeUntil: string | null;
  loading: boolean;
  hidden: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const UserAdStatusLine = ({
  hasPaid,
  adFreeUntil,
  loading,
  hidden,
}: UserAdStatusLineProps) => {
  const { colors } = useContext(ThemeContext);

  if (loading || hidden) {
    return null;
  }

  const adFreeDate = adFreeUntil ? new Date(adFreeUntil) : null;
  const hasActiveAdFreePeriod =
    adFreeDate !== null &&
    !Number.isNaN(adFreeDate.getTime()) &&
    adFreeDate.getTime() > Date.now();
  const adFreeText = hasActiveAdFreePeriod
    ? `ad free period until: ${dateFormatter.format(adFreeDate)}`
    : "no ad free period";

  return (
    <Text
      style={{
        paddingVertical: 4,
        color: colors.dimText,
        fontSize: 11,
        textAlign: "center",
      }}
    >
      paid: {hasPaid ? "y" : "n"} | {adFreeText}
    </Text>
  );
};

export default UserAdStatusLine;
