import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE8E1',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  backMark: {
    color: colors.primary,
    fontSize: 32,
    lineHeight: 36,
  },
  headerTitle: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    textAlign: 'center',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 100,
  },
  intro: {
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.brown,
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    marginTop: 5,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    lineHeight: 30,
  },
  description: {
    marginTop: 5,
    color: colors.textGray,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  summaryCard: {
    minHeight: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#F0ECE7',
    borderRadius: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  summaryPaid: {
    color: '#2D5A43',
  },
  summaryPending: {
    color: '#8A6237',
  },
  summaryLabel: {
    marginTop: 3,
    color: colors.textGray,
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: '#E9E1D8',
  },
  notice: {
    marginTop: 14,
    padding: 14,
    backgroundColor: '#FBF6EF',
    borderWidth: 1,
    borderColor: '#EFE4D5',
    borderRadius: 14,
  },
  noticeTitle: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
  },
  noticeText: {
    marginTop: 4,
    color: colors.textGray,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 17,
  },
  filterList: {
    columnGap: 8,
    paddingVertical: 17,
  },
  filterChip: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E9E1D8',
    borderRadius: 18,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
  },
  filterTextSelected: {
    color: colors.white,
    fontFamily: typography.fontFamily.semibold,
  },
  chargeCard: {
    marginBottom: 12,
    padding: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#F0ECE7',
    borderRadius: 16,
    shadowColor: '#32251E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF6EF',
    borderRadius: 12,
  },
  receiptMark: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
  },
  cardHeading: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
  },
  chargeTitle: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    lineHeight: 18,
  },
  chargeId: {
    marginTop: 2,
    color: colors.textGray,
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusPill_paid: {
    backgroundColor: '#F2F7F4',
  },
  statusPill_pending: {
    backgroundColor: '#FAF5EE',
  },
  statusPill_overdue: {
    backgroundColor: '#FAF1F2',
  },
  statusPill_cancelled: {
    backgroundColor: '#F1F0EF',
  },
  statusPill_neutral: {
    backgroundColor: '#F1F0EF',
  },
  statusText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
  },
  statusText_paid: {
    color: '#2D5A43',
  },
  statusText_pending: {
    color: '#8A6237',
  },
  statusText_overdue: {
    color: colors.primary,
  },
  statusText_cancelled: {
    color: colors.textGray,
  },
  statusText_neutral: {
    color: colors.textGray,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 13,
    backgroundColor: '#EEE8E1',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: colors.textGray,
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
  },
  detailValue: {
    maxWidth: '68%',
    color: colors.textMuted,
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  dateValue: {
    marginTop: 3,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
  },
  amount: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
  emptyTitle: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
  },
  emptyDescription: {
    marginTop: 5,
    color: colors.textGray,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
  },
});
