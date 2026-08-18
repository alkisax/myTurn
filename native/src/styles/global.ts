// native\src\styles\global.ts

import { StyleSheet } from "react-native";

export const COLORS = {
  light: {
    background: "#fffdf4",
    surface: "#ffffff",
    surfaceAlt: "#f4f1e3",
    border: "#ddd4aa",
    text: "#222222",
    dimText: "#666666",

    primary: "#5c1a1b",
    primaryActive: "#7a2224",

    switchTrackOff: "#d8cf9d",
    switchTrackOn: "#7a2224",
    switchThumb: "#ffffff",

    topBar: "#ffffff",
    topBarBorder: "#ddd4aa",
    panel: "#ffffff",
    panelBorder: "#ddd4aa",
    buttonBorder: "#ddd4aa",
    green: "#27ae60",
    red: "#d63031",

    borderSubtle: "rgba(0,0,0,0.1)",
    surfaceGlass: "rgba(0,0,0,0.03)",
    alert: "#ff5252",
    textSecondary: "#555",
    secondary: "#6c63ff",
  },

  dark: {
    background: "#121212",
    surface: "#1b1b1b",
    surfaceAlt: "#1f1f1f",
    border: "#333333",
    text: "#f1f1f1",
    dimText: "#999999",

    primary: "#7a2224",
    primaryActive: "#a62d30",

    switchTrackOff: "#444444",
    switchTrackOn: "#a62d30",
    switchThumb: "#ffffff",

    topBar: "#1b1b1b",
    topBarBorder: "#333333",
    panel: "#1b1b1b",
    panelBorder: "#333333",
    buttonBorder: "#444444",
    green: "#2ecc71",
    red: "#ff6b6b",

    borderSubtle: "rgba(255,255,255,0.08)",
    surfaceGlass: "rgba(255,255,255,0.06)",
    alert: "#ff5252",
    textSecondary: "#a0a0b0",
    secondary: "#6c63ff",
  },
};

export type AppColors = typeof COLORS.light;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZE = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  round: 999,
};

export const createGlobalStyles = (colors: AppColors) =>
  StyleSheet.create({
    // =========================
    // SCREEN / LAYOUT
    // =========================

    // Βασικό wrapper για κάθε screen.
    // Χρησιμοποιείται σε index.tsx, blackHole.tsx και μελλοντικά game screens.
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Κεντράρει περιεχόμενο οριζόντια και κάθετα.
    // Χρήσιμο για home screen, empty states, simple menus.
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SPACING.md,
      gap: SPACING.md,
    },

    // Generic κεντράρισμα χωρίς flex: 1.
    // Χρήσιμο μέσα σε cards, μικρά panels, button groups.
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },

    // Generic horizontal row.
    // Χρήσιμο για labels + switch, icon + text, μικρά control rows.
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
    },

    // =========================
    // TYPOGRAPHY
    // =========================

    // Μεγάλος τίτλος screen ή card.
    // Π.χ. "Game Settings", "Pen and Paper Games".
    title: {
      fontSize: FONT_SIZE.xl,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
    },

    // Βασικό text style.
    // Χρησιμοποιείται για απλό κείμενο σε screens/cards.
    text: {
      fontSize: FONT_SIZE.md,
      color: colors.text,
    },

    // Δευτερεύον/βοηθητικό κείμενο.
    // Π.χ. hints, descriptions, room status, μικρές σημειώσεις.
    dimText: {
      fontSize: FONT_SIZE.sm,
      color: colors.dimText,
    },

    // Κεντραρισμένο απλό κείμενο.
    // Χρήσιμο για messages, score summaries, empty states.
    centeredText: {
      textAlign: "center",
      color: colors.text,
    },

    // =========================
    // SURFACES / CARDS
    // =========================

    // Generic card/panel.
    // Χρησιμοποιείται για settings panels, game info boxes, endgame panels.
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
    },

    // =========================
    // PRIMARY BUTTONS
    // =========================

    // Μεγάλο βασικό κουμπί.
    // Χρησιμοποιείται για κύριες ενέργειες: "Black Hole", "Play Again", "Start Game".
    primaryButton: {
      minWidth: 160,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },

    // Active/selected κατάσταση για primary button.
    // Χρήσιμο όταν ένα βασικό κουμπί λειτουργεί σαν selected option.
    primaryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    // Κείμενο primary button.
    // Χρησιμοποιείται μέσα σε primaryButton.
    primaryButtonText: {
      fontSize: FONT_SIZE.lg,
      fontWeight: "700",
      color: colors.text,
    },

    // Κείμενο primary button όταν είναι active.
    // Συνήθως άσπρο πάνω σε primary background.
    primaryButtonTextActive: {
      color: "#ffffff",
    },

    // =========================
    // SECONDARY BUTTONS
    // =========================

    // Μικρότερο/λιγότερο σημαντικό κουμπί.
    // Χρήσιμο για cancel, reset, secondary actions, μικρά menu actions.
    secondaryButton: {
      minWidth: 120,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      justifyContent: "center",
      alignItems: "center",
    },

    // Κείμενο secondary button.
    // Χρησιμοποιείται μέσα σε secondaryButton.
    secondaryButtonText: {
      fontSize: FONT_SIZE.md,
      fontWeight: "600",
      color: colors.text,
    },

    // =========================
    // SEGMENTED BUTTONS
    // =========================

    // Μικρό option button για επιλογές τύπου 2P / 3P, Easy / Hard, Local / Online.
    // Δεν είναι για κύρια actions.
    segmentButton: {
      minWidth: 58,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.round,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },

    // Active/selected κατάσταση για segmentButton.
    // Π.χ. όταν είναι επιλεγμένο το 2P ή 3P.
    segmentButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    // Κείμενο segmentButton.
    // Χρησιμοποιείται σε μικρά option buttons.
    segmentButtonText: {
      fontSize: FONT_SIZE.md,
      fontWeight: "700",
      color: colors.text,
    },

    // Κείμενο segmentButton όταν είναι active.
    // Συνήθως άσπρο πάνω σε primary background.
    segmentButtonTextActive: {
      color: "#ffffff",
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
      paddingHorizontal: 20,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.surfaceGlass,
      color: colors.text,
    },

    link: {
      textAlign: "center",
      color: colors.primary,
      fontWeight: "600",
    },

    scrollContainer: {
      backgroundColor: colors.background,
      paddingTop: 60,
      paddingHorizontal: 20,
    },

    error: {
      color: colors.alert,
      textAlign: "center",
    },
  });
