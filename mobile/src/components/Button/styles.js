import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
