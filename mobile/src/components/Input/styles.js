import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    lineHeight: 19.5,
  },
  inputWrap: {
    position: 'relative',
    width: '100%',
    height: 50,
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 12,
    color: colors.textDark,
    backgroundColor: colors.inputBg,
    borderTopWidth: 1,
    borderTopColor: colors.inputBorderTop,
    borderRadius: radius.md,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
  },
  inputWithIcon: {
    paddingRight: 46,
  },
  placeholder: {
    color: colors.brown,
  },
  iconButton: {
    position: 'absolute',
    right: 12,
    width: 22,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
