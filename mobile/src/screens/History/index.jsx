import { useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppNavigation, { ProfileButton } from '../../components/AppNavigation';
import ChargeFilters from '../../components/ChargeFilters';
import { useAuth } from '../../contexts/AuthContext';
import { date, Field, money, statusLabel, ResourceState, useResource } from '../../components/ConnectedUI';
import { colors } from '../../theme/colors';
import { emptyChargeFilters, filterCharges, paymentStatusMatches } from '../../utils/chargeFilters';
import { styles } from './styles';

const filters = [
  { key: 'ALL', label: 'Todas' },
  { key: 'PAID', label: 'Pagas' },
  { key: 'PENDING', label: 'Pendentes' },
  { key: 'OVERDUE', label: 'Vencidas' },
  { key: 'CANCELED', label: 'Canceladas' },
];

const statusDetails = {
  paid: { label: 'Pago', tone: 'paid' },
  pending: { label: 'Pendente', tone: 'pending' },
  payment_in_process: { label: 'Em processamento', tone: 'progress' },
  overdue: { label: 'Vencido', tone: 'overdue' },
  cancelled: { label: 'Cancelado', tone: 'cancelled' },
};

function ChargeHistoryCard({ charge, openCharge }) {
  const status = statusDetails[charge.status] || {
    label: statusLabel[charge.originalStatus] || 'Status não informado',
    tone: 'neutral',
  };

  return (
    <Pressable accessibilityRole="button" onPress={openCharge} style={styles.chargeCard}>
      <View style={styles.cardTop}>
        <View style={styles.receiptIcon}>
          <Text style={styles.receiptMark}>R$</Text>
        </View>
        <View style={styles.cardHeading}>
          <Text style={styles.chargeTitle}>{charge.issuanceState === 'SIMULATED' && 'Simulação · '}{charge.serviceName}</Text>
          <Text style={styles.chargeId}>Cobrança #{charge.id}</Text>
        </View>
        <View style={[styles.statusPill, styles[`statusPill_${status.tone}`]]}>
          <Text style={[styles.statusText, styles[`statusText_${status.tone}`]]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Pet</Text>
        <Text style={styles.detailValue}>{charge.petName || 'Não informado'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Serviço</Text>
        <Text numberOfLines={2} style={styles.detailValue}>{charge.serviceName}</Text>
      </View>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.detailLabel}>
            {charge.status === 'paid' ? 'Data do pagamento' : 'Data da cobrança'}
          </Text>
          <Text style={styles.dateValue}>{date(charge.status === 'paid' ? charge.paymentDate : charge.dueDate)}</Text>
        </View>
        <Text style={styles.amount}>{money(charge.amount)}</Text>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen({ navigation }) {
  const { session } = useAuth();
  const admin = session.role === 'ADMIN';
  const homeRoute = admin ? 'Admin' : 'Home';
  const resource = useResource(admin ? '/admin/charges' : '/charges/my-charges');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [advanced, setAdvanced] = useState(emptyChargeFilters);
  const charges = Array.isArray(resource.data) ? resource.data : [];
  const visibleCharges = filterCharges(charges, activeFilter, query, advanced).map((charge) => ({
    ...charge,
    status: charge.status === 'CANCELED' ? 'cancelled' : charge.status?.toLowerCase(),
    originalStatus: charge.status,
  }));
  const paidCount = visibleCharges.filter((charge) => charge.originalStatus === 'PAID').length;
  const pendingCount = visibleCharges.filter((charge) =>
    charge.issuanceState !== 'SIMULATED' && paymentStatusMatches(charge.originalStatus, 'PENDING'),
  ).length;

  function clearFilters() {
    setQuery('');
    setActiveFilter('ALL');
    setAdvanced(emptyChargeFilters);
  }

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(homeRoute, { homeRoute });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={goBack}
          style={styles.backButton}
        >
          <Text style={styles.backMark}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Histórico</Text>
        <ProfileButton
          onPress={() => navigation.navigate('Profile', { homeRoute })}
          size={32}
          iconSize={16}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>FINANCEIRO</Text>
          <Text style={styles.title}>Histórico de cobranças</Text>
          <Text style={styles.description}>
            Consulte os serviços, valores e status das cobranças disponíveis no aplicativo.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{visibleCharges.length}</Text>
            <Text style={styles.summaryLabel}>Registros</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.summaryPaid]}>{paidCount}</Text>
            <Text style={styles.summaryLabel}>Pagos</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.summaryPending]}>{pendingCount}</Text>
            <Text style={styles.summaryLabel}>Pendentes</Text>
          </View>
        </View>

        <ResourceState resource={resource} />
        <Field label="Buscar no histórico" value={query} onChangeText={setQuery} returnKeyType="search" />

        <ScrollView
          contentContainerStyle={styles.filterList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {filters.map((filter) => {
            const selected = filter.key === activeFilter;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ChargeFilters value={advanced} onApply={setAdvanced} onClear={clearFilters} allowCustomer={admin}
          active={!!query || activeFilter !== 'ALL' || Object.values(advanced).some(Boolean)} />

        {resource.loading || resource.error ? null : visibleCharges.length ? (
          visibleCharges.map((charge) => (
            <ChargeHistoryCard charge={charge} key={charge.id} openCharge={() => navigation.navigate("Pagamento", { chargeId: charge.id })} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum registro neste filtro</Text>
            <Text style={styles.emptyDescription}>
              {charges.length ? 'Altere a busca ou os filtros para ver outros resultados.' : 'Nenhuma cobrança registrada.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <AppNavigation
        activeRoute="History"
        homeRoute={homeRoute}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}
