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
    marginTop: spacing.formOverlap,
    paddingTop: spacing.card,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  emailField: {
    marginTop: spacing.lg,
    paddingTop: spacing.xxs,
  },
  passwordField: {
    marginTop: spacing.title,
  },
  optionsRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  rememberLabel: {
    marginLeft: spacing.md,
    color: colors.textGray,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    lineHeight: 18,
  },
  optionsSpacer: {
    flex: 1,
  },
  forgotPasswordPressable: {
    minHeight: 20,
    justifyContent: 'center',
  },
  forgotPassword: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    lineHeight: 18,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.xl,
  },
  signupCopy: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    lineHeight: 19.5,
  },
  signupLink: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    lineHeight: 19.5,
  },
  submitButton: {
    marginTop: spacing.button,
  },
  footerSpacer: {
    flex: 1,
    minHeight: spacing.xxl,
  },
});
