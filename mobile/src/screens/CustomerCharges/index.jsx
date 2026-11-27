import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppNavigation from '../../components/AppNavigation';
import ChargeFilters from '../../components/ChargeFilters';
import { date, money, ResourceState, statusLabel, useResource } from '../../components/ConnectedUI';
import { colors } from '../../theme/colors';
import { emptyChargeFilters, filterCharges, paymentStatusMatches } from '../../utils/chargeFilters';
import { styles } from './styles';

const filters = [
  { key: 'ALL', label: 'Todas' },
  { key: 'PENDING', label: 'Pendentes' },
  { key: 'PAYMENT_IN_PROCESS', label: 'Em processamento' },
  { key: 'PAID', label: 'Pagas' },
  { key: 'OVERDUE', label: 'Vencidas' },
  { key: 'CANCELED', label: 'Canceladas' },
];

const statusTone = {
  PENDING: 'pending',
  PAYMENT_IN_PROCESS: 'progress',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELED: 'cancelled',
};

function StatusBadge({ charge }) {
  const tone = statusTone[charge.status] || 'neutral';
  const pillTone = styles['status_' + tone];
  const textTone = styles['statusText_' + tone];
  return (
    <View style={[styles.statusPill, pillTone]}>
      <Text style={[styles.statusText, textTone]}>{statusLabel[charge.status] || 'Status não informado'}</Text>
    </View>
  );
}

export default function CustomerChargesScreen({ navigation }) {
  const resource = useResource('/admin/charges');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [advanced, setAdvanced] = useState(emptyChargeFilters);
  const charges = useMemo(() => Array.isArray(resource.data) ? resource.data : [], [resource.data]);
  const visibleCharges = useMemo(() => filterCharges(charges, filter, query, advanced), [charges, filter, query, advanced]);

  const counts = useMemo(() => ({
    total: visibleCharges.length,
    pending: visibleCharges.filter((charge) => paymentStatusMatches(charge.status, 'PENDING')).length,
    paid: visibleCharges.filter((charge) => charge.status === 'PAID').length,
    overdue: visibleCharges.filter((charge) => charge.status === 'OVERDUE').length,
  }), [visibleCharges]);

  function clearFilters() {
    setQuery('');
    setFilter('ALL');
    setAdvanced(emptyChargeFilters);
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Admin')} style={styles.backButton}>
          <Text style={styles.backMark}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Faturas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>GESTÃO FINANCEIRA</Text>
          <Text style={styles.title}>Cobranças de clientes</Text>
          <Text style={styles.subtitle}>Acompanhe cobranças e pagamentos registrados.</Text>
        </View>

        <View style={styles.summary}>
          <Summary label="Total" value={counts.total} />
          <Summary label="Em aberto" value={counts.pending} tone="pending" />
          <Summary label="Pagas" value={counts.paid} tone="paid" />
          <Summary label="Vencidas" value={counts.overdue} tone="overdue" />
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Buscar por cliente, pet, serviço ou cobrança"
            value={query}
            onChangeText={setQuery}
            placeholder="Cliente, pet, serviço ou código"
            placeholderTextColor="#8A817D"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <ScrollView horizontal contentContainerStyle={styles.filters} showsHorizontalScrollIndicator={false}>
          {filters.map((item) => {
            const selected = filter === item.key;
            return (
              <Pressable key={item.key} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setFilter(item.key)} style={[styles.filterChip, selected && styles.filterChipSelected]}>
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ChargeFilters value={advanced} onApply={setAdvanced} onClear={clearFilters} allowCustomer
          active={!!query || filter !== 'ALL' || Object.values(advanced).some(Boolean)} />

        <ResourceState resource={resource} />

        {!resource.loading && !resource.error && visibleCharges.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>▤</Text>
            <Text style={styles.emptyTitle}>{charges.length ? 'Nenhuma cobrança encontrada' : 'Nenhuma cobrança cadastrada'}</Text>
            <Text style={styles.emptyDescription}>{charges.length ? 'Altere a busca ou o filtro para ver outros resultados.' : 'As cobranças emitidas aparecerão nesta lista.'}</Text>
          </View>
        ) : null}

        {visibleCharges.map((charge) => {
          return (
            <Pressable key={charge.id} accessibilityRole="button" onPress={() => navigation.navigate('Pagamento', { chargeId: charge.id })} style={styles.chargeCard}>
              <View style={styles.cardHeader}>
                <View style={styles.customerBadge}><Text style={styles.customerInitial}>{charge.customerName?.trim()?.[0]?.toUpperCase() || 'C'}</Text></View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName} numberOfLines={1}>{charge.customerName || 'Cliente não informado'}</Text>
                  <Text style={styles.chargeRef}>Cobrança #{charge.id}</Text>
                </View>
                <StatusBadge charge={charge} />
              </View>
              <View style={styles.divider} />
              <InfoRow label="Pet" value={charge.petName || 'Não informado'} />
              <InfoRow label="Serviço" value={charge.serviceName || 'Não informado'} />
              {charge.issuanceState === 'SIMULATED' && <InfoRow label="Tipo" value="Simulação" />}
              <View style={styles.cardFooter}>
                <View><Text style={styles.caption}>{charge.status === 'PAID' ? 'Pago em' : 'Vencimento'}</Text><Text style={styles.dateValue}>{date(charge.status === 'PAID' ? charge.paymentDate : charge.dueDate)}</Text></View>
                <Text style={styles.amount}>{money(charge.amount)}</Text>
              </View>
              <Text style={styles.cardAction}>Ver cobrança ›</Text>
            </Pressable>
          );
        })}

        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Charges', { homeRoute: 'Admin' })} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>＋  Nova cobrança bancária</Text>
        </Pressable>
      </ScrollView>
      <AppNavigation activeRoute="Charges" homeRoute="Admin" navigation={navigation} />
    </SafeAreaView>
  );
}

function Summary({ label, value, tone = 'default' }) {
  return <View style={styles.summaryItem}><Text style={[styles.summaryValue, styles[`summary_${tone}`]]}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

function InfoRow({ label, value }) {
  return <View style={styles.infoRow}><Text style={styles.caption}>{label}</Text><Text style={styles.infoValue} numberOfLines={1}>{value}</Text></View>;
}
