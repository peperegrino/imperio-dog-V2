import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Action, date, money } from '../ConnectedUI';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function BoletoPreview({ visible, onClose, customer, pet, services, dueDate, totalCents }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.panel}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.brand}>IMPÉRIO DOG RESORT</Text>
            <Text accessibilityRole="header" style={styles.title}>Boleto demonstrativo</Text>
            <Text style={styles.notice}>SIMULAÇÃO · SEM VALIDADE PARA PAGAMENTO</Text>
            <View style={styles.section}>
              <Detail label="Tutor" value={customer} />
              <Detail label="Pet" value={pet} />
              <Detail label="Vencimento previsto" value={date(dueDate)} />
            </View>
            <View style={styles.section}>
              {services.map((service) => (
                <Detail
                  key={service.id}
                  label={`${service.quantity} × ${service.name}`}
                  value={money(service.unitCents * service.quantity / 100)}
                />
              ))}
              <Detail label="Valor demonstrativo" value={money(totalCents / 100)} />
            </View>
            <Text style={styles.copy}>Prévia da apresentação. Nenhuma cobrança foi emitida.</Text>
            <Action title="Fechar prévia" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#0007' },
  panel: { width: '100%', maxWidth: 410, maxHeight: '90%', borderRadius: 16, backgroundColor: colors.surface },
  content: { padding: 20, gap: 12 },
  brand: { color: colors.brown, fontFamily: typography.fontFamily.bold, fontSize: 11 },
  title: { color: colors.primary, fontFamily: typography.fontFamily.bold, fontSize: 23 },
  notice: {
    color: colors.primary,
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#F3E5E3',
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
  },
  section: { borderTopWidth: 1, borderTopColor: colors.tabActiveBorder, paddingTop: 10, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { flex: 1, color: colors.textMuted, fontSize: 13 },
  value: { flexShrink: 1, color: colors.textDark, textAlign: 'right', fontFamily: typography.fontFamily.semibold, fontSize: 13 },
  copy: { color: colors.textMuted, fontSize: 12 },
});
