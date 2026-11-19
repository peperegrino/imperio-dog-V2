import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  heading: { gap: 5, marginBottom: 8 },
  eyebrow: { color: '#B58C63', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  title: { color: '#332522', fontSize: 23, fontWeight: '700' },
  subtitle: { color: '#776C67', fontSize: 12, lineHeight: 18 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { color: '#332522', fontSize: 16, fontWeight: '700' },
  count: { color: '#722F37', fontSize: 13, fontWeight: '700' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEE8E1' },
  detailRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  label: { color: '#776C67', fontSize: 12 },
  value: { flex: 1, color: '#332522', fontSize: 12, fontWeight: '600', textAlign: 'right' },
  itemTitle: { color: '#332522', fontSize: 14, fontWeight: '700' },
  notes: { color: '#776C67', fontSize: 12, lineHeight: 18, marginTop: 8 },
  chargeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  chargeCopy: { flex: 1, gap: 3 },
  muted: { color: '#776C67', fontSize: 10 },
  amount: { color: '#722F37', fontSize: 14, fontWeight: '700' },
  linkButton: { alignSelf: 'flex-end', paddingVertical: 8 },
  linkText: { color: '#722F37', fontSize: 12, fontWeight: '700' },
});
