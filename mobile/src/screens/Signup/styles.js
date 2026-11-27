import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 252,
    backgroundColor: colors.headerOverlay,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  formCard: {
    width: '100%',
    maxWidth: 480,
    marginTop: spacing.formOverlap,
    paddingTop: spacing.card,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  title: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
  },
  description: {
    marginTop: 8,
    marginBottom: 12,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  field: {
    marginTop: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 10,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 4,
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
  },
  submitButton: {
    marginTop: 32,
  },
  cancelButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  cancelLabel: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
  },
});
