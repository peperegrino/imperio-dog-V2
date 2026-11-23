import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Action, Field, s } from '../ConnectedUI';
import { colors } from '../../theme/colors';
import { validateChargeFilters } from '../../utils/chargeFilters';

export default function ChargeFilters({ value, onApply, onClear, allowCustomer, active }) {
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const close = () => setDraft(null);
  const open = () => { setError(''); setDraft(value); };
  const change = (key, text) => setDraft((current) => ({ ...current, [key]: text }));

  function apply() {
    try {
      onApply(validateChargeFilters(draft));
      close();
    } catch (issue) {
      setError(issue.message);
    }
  }

  return (
    <View style={styles.controls}>
      <Pressable accessibilityRole="button" onPress={open} style={styles.option}>
        <Text style={s.label}>{Object.values(value).some(Boolean) ? 'Mais filtros · ativos' : 'Mais filtros'}</Text>
      </Pressable>
      {active && (
        <Pressable accessibilityRole="button" onPress={onClear} style={styles.option}>
          <Text style={s.label}>Limpar filtros</Text>
        </Pressable>
      )}
      <Modal transparent visible={draft !== null} onRequestClose={close} animationType="fade">
        {draft && <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} accessible={false} onPress={close} />
          <View style={styles.panel} accessibilityViewIsModal>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text accessibilityRole="header" style={s.title}>Filtros de cobrança</Text>
              <Field label="Vencimento inicial (AAAA-MM-DD)" value={draft.start} onChangeText={(text) => change('start', text)} />
              <Field label="Vencimento final (AAAA-MM-DD)" value={draft.end} onChangeText={(text) => change('end', text)} />
              {allowCustomer && <Field label="Cliente" value={draft.customer} onChangeText={(text) => change('customer', text)} />}
              <Field label="Valor mínimo (R$)" keyboardType="decimal-pad" value={draft.minimum} onChangeText={(text) => change('minimum', text)} />
              <Field label="Valor máximo (R$)" keyboardType="decimal-pad" value={draft.maximum} onChangeText={(text) => change('maximum', text)} />
              <Text style={s.label}>Ordenar por vencimento</Text>
              {[
                ['', 'Ordem original'],
                ['newest', 'Mais recente'],
                ['oldest', 'Mais antiga'],
              ].map(([order, label]) => (
                <Pressable key={label} accessibilityRole="radio" accessibilityState={{ checked: draft.order === order }}
                  onPress={() => change('order', order)} style={[styles.option, draft.order === order && styles.selected]}>
                  <Text style={s.label}>{label}</Text>
                </Pressable>
              ))}
              {!!error && <Text accessibilityRole="alert" style={s.errorMessage}>{error}</Text>}
              <Action title="Aplicar" onPress={apply} />
              <Pressable accessibilityRole="button" onPress={() => { onClear(); close(); }} style={styles.option}>
                <Text style={s.label}>Limpar</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={close} style={styles.option}>
                <Text style={s.label}>Cancelar</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 40, paddingHorizontal: 10, justifyContent: 'center', alignSelf: 'flex-start', borderRadius: 8 },
  selected: { backgroundColor: colors.tabActiveBorder },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#0007' },
  panel: { width: '100%', maxWidth: 400, maxHeight: '90%', padding: 16, borderRadius: 16, backgroundColor: colors.surface },
});
