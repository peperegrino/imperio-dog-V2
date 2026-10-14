import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 52,
    position: 'relative',
    zIndex: 1,
  },
  logoCard: {
    width: 106,
    height: 102,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.logoCardBorder,
    borderRadius: radius.logo,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logo: {
    width: 90,
    height: 58,
  },
  copy: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  eyebrow: {
    color: colors.brown,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 0.55,
    lineHeight: 16.5,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: spacing.sm,
    color: colors.textDark,
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    letterSpacing: -0.55,
    lineHeight: 33,
  },
  subtitle: {
    maxWidth: 320,
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
  },
});
