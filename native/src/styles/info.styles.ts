// native\src\styles\info.styles.ts

import { StyleSheet } from 'react-native'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '@/styles/global'

export const createInfoStyles = (theme: typeof COLORS.light) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      padding: SPACING.md,
      paddingBottom: SPACING.xl,
    },

    card: {
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      gap: SPACING.sm,
    },

    backLink: {
      alignSelf: 'flex-start',
      marginBottom: SPACING.sm,
    },

    backText: {
      fontSize: FONT_SIZE.sm,
      color: theme.dimText,
      fontWeight: '600',
    },

    title: {
      fontSize: FONT_SIZE.xl,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: SPACING.md,
    },

    sectionTitle: {
      fontSize: FONT_SIZE.md,
      fontWeight: '800',
      color: theme.text,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },

    paragraph: {
      fontSize: FONT_SIZE.md,
      color: theme.text,
      lineHeight: 22,
    },

    rulesExample: {
      fontSize: FONT_SIZE.md,
      color: theme.text,
      fontWeight: '700',
      lineHeight: 24,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      marginVertical: SPACING.xs,
    },

    linkText: {
      fontSize: FONT_SIZE.md,
      color: theme.primary,
      fontWeight: '800',
      textDecorationLine: 'underline',
      marginTop: SPACING.sm,
    },
  })