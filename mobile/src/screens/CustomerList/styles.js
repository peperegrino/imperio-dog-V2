import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  heading: {
    gap: 6,
  },
  title: {
    color: '#332522',
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    color: '#694B42',
    fontSize: 14,
    lineHeight: 20,
  },
  count: {
    color: '#722F37',
    fontSize: 15,
    fontWeight: '700',
  },
  customerButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  customerCopy: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    color: '#332522',
    fontSize: 16,
    fontWeight: '700',
  },
  customerEmail: {
    color: '#694B42',
    fontSize: 13,
  },
  expandLabel: {
    color: '#722F37',
    fontSize: 13,
    fontWeight: '600',
  },
  details: {
    borderTopColor: '#E8DED2',
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
  },
  detail: {
    color: '#694B42',
    fontSize: 13,
  },
});
