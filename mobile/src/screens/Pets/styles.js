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
  emptyCard: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 30,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#F0ECE7',
    borderRadius: 18,
  },
  pawBadge: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF6EF',
    borderRadius: 29,
  },
  paw: {
    color: colors.brown,
    fontSize: 28,
  },
  emptyTitle: {
    marginTop: 16,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
  },
  emptyDescription: {
    marginTop: 8,
    color: colors.textGray,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
  addButton: {
    minHeight: 46,
    minWidth: 190,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 13,
  },
  addButtonText: {
    color: colors.white,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
  },
});
