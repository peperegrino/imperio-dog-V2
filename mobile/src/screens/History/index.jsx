import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppNavigation, { ProfileButton } from '../../components/AppNavigation';
import { charges } from '../../data/charges';
import { colors } from '../../theme/colors';
import { styles } from './styles';

const filters = [
  { key: 'all', label: 'Todas' },
  { key: 'paid', label: 'Pagas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'overdue', label: 'Vencidas' },
  { key: 'cancelled', label: 'Canceladas' },
];

const statusDetails = {
  paid: { label: 'Pago', tone: 'paid' },
  pending: { label: 'Pendente', tone: 'pending' },
  overdue: { label: 'Vencido', tone: 'overdue' },
  cancelled: { label: 'Cancelado', tone: 'cancelled' },
};

function getChargeDate(description) {
  const date = description.match(/\d{2}\/\d{2}\/\d{4}/)?.[0];
  return date || 'Data não informada';
}

function ChargeHistoryCard({ charge }) {
  const status = statusDetails[charge.status] || {
    label: charge.statusLabel || 'Status não informado',
    tone: 'neutral',
  };

  return (
    <View style={styles.chargeCard}>
      <View style={styles.cardTop}>
        <View style={styles.receiptIcon}>
          <Text style={styles.receiptMark}>R$</Text>
        </View>
        <View style={styles.cardHeading}>
          <Text style={styles.chargeTitle}>{charge.title}</Text>
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
        <Text style={styles.detailValue}>Não informado</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Serviço</Text>
        <Text numberOfLines={2} style={styles.detailValue}>{charge.title}</Text>
      </View>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.detailLabel}>
            {charge.status === 'paid' ? 'Data do pagamento' : 'Data da cobrança'}
          </Text>
          <Text style={styles.dateValue}>{getChargeDate(charge.description)}</Text>
        </View>
        <Text style={styles.amount}>{charge.amount}</Text>
      </View>
    </View>
  );
}

export default function HistoryScreen({ navigation, route }) {
  const homeRoute = route.params?.homeRoute || 'Home';
  const [activeFilter, setActiveFilter] = useState('all');
  const visibleCharges = useMemo(
    () => (activeFilter === 'all'
      ? charges
      : charges.filter((charge) => charge.status === activeFilter)),
    [activeFilter],
  );
  const paidCount = charges.filter((charge) => charge.status === 'paid').length;
  const pendingCount = charges.filter((charge) => charge.status === 'pending').length;

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
            <Text style={styles.summaryValue}>{charges.length}</Text>
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

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Dados demonstrativos</Text>
          <Text style={styles.noticeText}>
            O aplicativo ainda não está conectado a uma API de cobranças. Estes são os registros locais já exibidos na tela inicial.
          </Text>
        </View>

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

        {visibleCharges.length ? (
          visibleCharges.map((charge) => (
            <ChargeHistoryCard charge={charge} key={charge.id} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum registro neste filtro</Text>
            <Text style={styles.emptyDescription}>
              Não há cobranças com esse status nos dados disponíveis.
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
