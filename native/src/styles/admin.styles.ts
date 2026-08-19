import { StyleSheet } from "react-native";

import {
  AppColors,
  FONT_SIZE,
  RADIUS,
  SPACING,
} from "@/styles/global";

export const createAdminStyles = (colors: AppColors) =>
  StyleSheet.create({
    content: {
      padding: SPACING.md,
      gap: SPACING.md,
    },
    tabList: {
      gap: SPACING.sm,
      paddingBottom: SPACING.xs,
    },
    section: {
      gap: SPACING.sm,
      paddingBottom: SPACING.lg,
    },
    heading: {
      fontSize: FONT_SIZE.lg,
      fontWeight: "700",
      color: colors.text,
    },
    item: {
      gap: SPACING.xs,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      backgroundColor: colors.surface,
    },
    itemTitle: {
      fontSize: FONT_SIZE.lg,
      fontWeight: "700",
      color: colors.text,
    },
    itemText: {
      color: colors.dimText,
    },
    buttonRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "center",
      padding: SPACING.md,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    infoModal: {
      gap: SPACING.sm,
    },
    qrContainer: {
      alignItems: "center",
      paddingVertical: SPACING.sm,
    },
  });
