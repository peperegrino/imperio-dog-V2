import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  card: {
    padding: 17,
    gap: 12,
    backgroundColor: colors.white,
    borderColor: '#EEDFDC',
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  invoiceInfo: {
    flex: 1,
    gap: 4,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarIconSlot: {
    width: 11.25,
    height: 12.5,
  },
  dueDate: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  invoiceTitle: {
    color: colors.textDark,
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 12,
  },
  badgeLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    lineHeight: 22,
    textTransform: 'uppercase',
  },
  pendingBadge: {
    backgroundColor: '#FAF5EE',
    borderColor: '#E8D8C5',
  },
  pendingBadgeLabel: {
    color: '#8A6237',
  },
  paidBadge: {
    backgroundColor: '#F2F7F4',
    borderColor: '#D2E4DA',
  },
  paidBadgeLabel: {
    color: '#2D5A43',
  },
  overdueBadge: {
    backgroundColor: '#FAF1F2',
    borderColor: '#ECCCD0',
  },
  overdueBadgeLabel: {
    color: colors.primary,
  },
  cardBottom: {
    paddingTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: colors.background,
    borderTopWidth: 1,
  },
  amountLabel: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 22,
  },
  amount: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 21,
    lineHeight: 28,
  },
  detailsButton: {
    borderRadius: 12,
  },
  filledButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  outlineButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailsButtonLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  filledButtonLabel: {
    color: colors.white,
  },
  outlineButtonLabel: {
    color: colors.primary,
  },
});
