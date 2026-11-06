import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  blur: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: colors.white,
    borderTopColor: 'rgba(237,213,208,0.4)',
    borderTopWidth: 1,
  },
  container: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.25,
    lineHeight: 15,
  },
  activeLabel: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  inactiveLabel: {
    color: '#6E5B58',
    fontFamily: typography.fontFamily.medium,
  },
  profileButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
