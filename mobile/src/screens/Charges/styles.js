import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.background,
  },
  main: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 96,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  invoiceList: {
    gap: 12,
  },
  filterScroll: {
    height: 38,
    flexGrow: 0,
    flexShrink: 0,
    marginHorizontal: -24,
    marginBottom: 20,
  },
  filterRow: {
    height: 38,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  activeChip: {
    backgroundColor: colors.primary,
  },
  inactiveChip: {
    backgroundColor: colors.white,
    borderColor: '#EEDFDC',
    borderWidth: 1,
  },
  filterLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    lineHeight: 16,
  },
  activeChipLabel: {
    color: colors.white,
  },
  inactiveChipLabel: {
    color: colors.textMuted,
  },
  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderBottomColor: '#EEE5DE',
    borderBottomWidth: 1,
  },
  headerLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  headerTitle: {
    color: '#4A1F25',
    fontFamily: typography.fontFamily.semibold,
    fontSize: 17,
    lineHeight: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  emptyState: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 28,
  },
  illustration: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 54,
    borderWidth: 1,
    borderColor: '#E8D8C8',
    backgroundColor: '#F3EBE2',
  },
  emptyCopy: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    color: '#332522',
    fontFamily: typography.fontFamily.semibold,
    fontSize: 21,
    letterSpacing: -0.35,
    lineHeight: 29,
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#534343',
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyHint: {
    marginTop: 2,
    color: '#786A63',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonWrap: {
    width: '100%',
    maxWidth: 300,
  },
  noFilteredInvoices: {
    paddingVertical: 28,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
