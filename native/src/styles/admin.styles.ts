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
      paddingBottom: SPACING.sm,
    },
    tabButton: {
      minWidth: 0,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.round,
      flexGrow: 0,
      flexShrink: 0,
    },
    tabButtonSelected: {
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.primary,
    },
    tabText: {
      color: colors.text,
      fontSize: FONT_SIZE.sm,
      fontWeight: "600",
      includeFontPadding: false,
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
    itemSelected: {
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.primary,
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
    overviewCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    overviewCardContent: {
      flex: 1,
      gap: SPACING.xs,
    },
    overviewCardTitle: {
      color: colors.text,
      fontSize: FONT_SIZE.md,
      fontWeight: "700",
    },
    overviewIndicator: {
      color: colors.dimText,
      fontSize: FONT_SIZE.lg,
    },
    overviewIntro: {
      color: colors.dimText,
      lineHeight: 20,
    },
    overviewDeleteAccount: {
      marginTop: SPACING.xl,
    },
  });
