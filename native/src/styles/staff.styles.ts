import { StyleSheet } from "react-native";

import {
  type AppColors,
  FONT_SIZE,
  RADIUS,
  SPACING,
} from "@/styles/global";

export const createStaffStyles = (colors: AppColors) =>
  StyleSheet.create({
    content: {
      padding: SPACING.md,
      gap: SPACING.md,
    },
    stepContainer: {
      width: "100%",
      maxWidth: 700,
      alignSelf: "center",
      gap: SPACING.md,
    },
    section: {
      gap: SPACING.sm,
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
    },
    splitRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: SPACING.md,
    },
    countGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
    },
    countCard: {
      flexGrow: 1,
      minWidth: 130,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
    },
    countValue: {
      color: colors.text,
      fontSize: FONT_SIZE.xl,
      fontWeight: "700",
    },
    ticketNumber: {
      color: colors.text,
      fontSize: 40,
      fontWeight: "700",
      textAlign: "center",
    },
    statusText: {
      color: colors.text,
      fontWeight: "700",
    },
    disabled: {
      opacity: 0.45,
    },
    displayScreen: {
      flex: 1,
      backgroundColor: "#090a0c",
    },
    displayContent: {
      padding: SPACING.md,
      gap: SPACING.md,
    },
    displayHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: SPACING.md,
    },
    displayTitle: {
      color: "#e56f6f",
      fontSize: 32,
      fontWeight: "700",
    },
    displayText: {
      color: "#d98282",
      fontSize: FONT_SIZE.md,
    },
    displayCard: {
      minHeight: 280,
      justifyContent: "center",
      alignItems: "center",
      gap: SPACING.md,
      padding: SPACING.lg,
      backgroundColor: "#17191d",
      borderColor: "#3a2024",
      borderWidth: 1,
      borderRadius: RADIUS.lg,
    },
    displayNumber: {
      color: "#f06f6f",
      fontSize: 64,
      fontWeight: "700",
    },
    displayDesk: {
      color: "#e58a8a",
      fontSize: FONT_SIZE.xl,
      fontWeight: "700",
      textAlign: "center",
    },
    displayEntry: {
      alignItems: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    tabletContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: SPACING.lg,
      gap: SPACING.md,
    },
    tabletCard: {
      width: "100%",
      maxWidth: 520,
      gap: SPACING.md,
      alignItems: "center",
    },
    fullWidth: {
      width: "100%",
    },
  });
