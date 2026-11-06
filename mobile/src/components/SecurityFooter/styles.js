import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 16.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14.5,
    gap: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: colors.brown,
    borderRadius: 9999,
  },
  label: {
    color: colors.brown,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    lineHeight: 16.5,
  },
});
