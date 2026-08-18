// native\src\styles\markdown.styles.ts

import {
  FONT_SIZE,
  RADIUS,
  SPACING,
  type AppColors,
} from '@/styles/global'

export const createMarkdownStyles = (
  colors: AppColors,
  compact = false,
) => ({
  body: {
    color: colors.text,
    fontSize: compact ? FONT_SIZE.sm : FONT_SIZE.md,
  },

  paragraph: {
    marginTop: 0,
    marginBottom: compact ? 2 : SPACING.sm,
  },

  heading1: {
    color: colors.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700' as const,
    marginBottom: SPACING.md,
  },

  heading2: {
    color: colors.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700' as const,
    marginBottom: SPACING.sm,
  },

  heading3: {
    color: colors.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700' as const,
    marginBottom: SPACING.sm,
  },

  strong: {
    fontWeight: '700' as const,
  },

  em: {
    fontStyle: 'italic' as const,
  },

  bullet_list: {
    marginBottom: SPACING.sm,
  },

  ordered_list: {
    marginBottom: SPACING.sm,
  },

  list_item: {
    marginBottom: compact ? 0 : 4,
  },

  code_inline: {
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 4,
    borderRadius: 4,
  },

  code_block: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },

  fence: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },

  blockquote: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.buttonBorder,
    paddingLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginVertical: SPACING.sm,
  },

  link: {
    color: colors.player1,
  },
})