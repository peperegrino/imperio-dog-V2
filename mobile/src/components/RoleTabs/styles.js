import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 4,
    paddingHorizontal: 3.5,
    backgroundColor: colors.inputBg,
    borderTopWidth: 1,
    borderTopColor: colors.inputBorderTop,
    borderRadius: radius.md,
  },
  tab: {
    width: 168,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  teamTab: {
    width: 165,
  },
  activeTab: {
    backgroundColor: colors.surface,
    borderColor: colors.tabActiveBorder,
    borderRadius: radius.md,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
    borderColor: colors.tabInactiveBorder,
    borderRadius: 16,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
  },
  activeLabel: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  inactiveLabel: {
    color: colors.brown,
    fontFamily: typography.fontFamily.semibold,
  },
});
