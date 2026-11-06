import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.background,
  },
  header: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EFEB',
  },
  headerTitle: {
    color: colors.textDark,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    flexGrow: 1,
    alignItems: 'stretch',
    gap: 12,
    padding: 16,
    paddingBottom: 96,
  },
  message: {
    marginBottom: 8,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  link: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderColor: '#EEDFDC',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  linkText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
});
