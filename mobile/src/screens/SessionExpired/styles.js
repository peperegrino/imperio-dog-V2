import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF8F5' },
  content: { flex: 1, alignSelf: 'center', justifyContent: 'center', width: '100%', maxWidth: 390, paddingHorizontal: 24 },
  iconWrap: { width: 88, height: 88, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 25, borderRadius: 44, backgroundColor: '#F3E9DF', borderWidth: 1, borderColor: '#E8D8C8' },
  icon: { color: colors.primary, fontSize: 44, fontWeight: '700' },
  eyebrow: { color: '#B58C63', fontFamily: typography.fontFamily.bold, fontSize: 10, letterSpacing: 1.1, textAlign: 'center' },
  title: { marginTop: 10, color: '#332522', fontFamily: typography.fontFamily.bold, fontSize: 25, lineHeight: 32, textAlign: 'center' },
  description: { marginTop: 10, color: '#776C67', fontFamily: typography.fontFamily.regular, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  infoCard: { marginTop: 28, padding: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEE8E1', borderRadius: 16 },
  infoTitle: { color: '#332522', fontFamily: typography.fontFamily.semibold, fontSize: 13 },
  infoText: { marginTop: 6, color: '#776C67', fontFamily: typography.fontFamily.regular, fontSize: 12, lineHeight: 19 },
  primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 20, backgroundColor: colors.primary, borderRadius: 14 },
  primaryText: { color: '#FFFFFF', fontFamily: typography.fontFamily.semibold, fontSize: 14 },
  footer: { marginTop: 22, color: '#8A817D', fontFamily: typography.fontFamily.medium, fontSize: 10, textAlign: 'center' },
});
