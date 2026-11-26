import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SideMenu from '../../components/SideMenu';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { showAlert, showConfirm } from '../../utils/alert';
import HomeIcon from '../Home/icons';
import { styles } from './styles';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value) {
  if (!value) return 'Sem data';
  const iso = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function normalizeStatus(status) {
  const normalized = String(status || '').toUpperCase();

  if (normalized === 'PAID') {
    return { label: 'PAGO', tone: 'green' };
  }

  if (normalized === 'OVERDUE') {
    return { label: 'VENCIDO', tone: 'red' };
  }

  if (normalized === 'PAYMENT_IN_PROCESS') {
    return { label: 'EM PROCESSO', tone: 'gold' };
  }

  if (normalized === 'CANCELED') {
    return { label: 'CANCELADO', tone: 'brown' };
  }

  return { label: 'PENDENTE', tone: 'gold' };
}

function getCustomerName(charge) {
  return charge?.customerName || 'Cliente';
}

function getServiceName(charge) {
  const name = charge?.serviceName || 'Cobrança';
  return charge?.issuanceState === 'SIMULATED' ? `Simulação · ${name}` : name;
}

function getDueDate(charge) {
  return charge?.dueDate || null;
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isUpcomingCharge(charge, now) {
  const status = String(charge?.status || '').toUpperCase();
  if (!['PENDING', 'PAYMENT_IN_PROCESS'].includes(status)) return false;

  const dueDate = getDueDate(charge);
  if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return false;

  const today = new Date(now);
  const lastUpcomingDay = new Date(now);
  lastUpcomingDay.setDate(lastUpcomingDay.getDate() + 7);
  return dueDate >= formatLocalDate(today) && dueDate <= formatLocalDate(lastUpcomingDay);
}

function calculateSummary(charges, nowMs = 0) {
  const items = Array.isArray(charges) ? charges.filter((charge) => charge.issuanceState !== 'SIMULATED') : [];
  const now = nowMs || Date.now();

  const received = items
    .filter((charge) => String(charge?.status || '').toUpperCase() === 'PAID')
    .reduce((sum, charge) => sum + Number(charge?.amount || 0), 0);

  const pending = items
    .filter((charge) => ['PENDING', 'PAYMENT_IN_PROCESS'].includes(String(charge?.status || '').toUpperCase()))
    .reduce((sum, charge) => sum + Number(charge?.amount || 0), 0);

  const overdue = items
    .filter((charge) => String(charge?.status || '').toUpperCase() === 'OVERDUE')
    .reduce((sum, charge) => sum + Number(charge?.amount || 0), 0);

  const upcoming = items
    .filter((charge) => isUpcomingCharge(charge, now))
    .reduce((sum, charge) => sum + Number(charge?.amount || 0), 0);

  return {
    received,
    pending,
    overdue,
    upcoming,
    total: items.reduce((sum, charge) => sum + Number(charge?.amount || 0), 0),
  };
}

function SectionHeading({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <View style={styles.sectionActionRow}>
            <Text style={styles.sectionAction}>{action}</Text>
            <HomeIcon name="arrow" />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

function ChargeSummaryCard({ item }) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTopRow}>
        <Text style={styles.summaryLabel}>{item.label}</Text>
        <HomeIcon name={item.icon} />
      </View>
      <Text style={[styles.summaryValue, styles[`summaryValue_${item.tone}`]]}>{item.value}</Text>
      <Text style={[styles.summaryDetail, styles[`summaryDetail_${item.tone}`]]}>{item.detail}</Text>
    </View>
  );
}

function StatusBadge({ label, tone }) {
  return (
    <View style={[styles.statusBadge, styles[`statusBadge_${tone}`]]}>
      <Text style={[styles.statusText, styles[`statusText_${tone}`]]}>{label}</Text>
    </View>
  );
}

function RecentCharge({ charge }) {
  const status = normalizeStatus(charge?.status);
  const customerName = getCustomerName(charge);
  const serviceName = getServiceName(charge);
  const dueDate = formatDate(getDueDate(charge));

  return (
    <View style={styles.recentCharge}>
      <View style={styles.recentChargeMain}>
        <HomeIcon name={charge?.avatar || 'profile'} />
        <View style={styles.recentChargeText}>
          <Text numberOfLines={1} style={styles.customerName}>{customerName}</Text>
          <Text numberOfLines={1} style={styles.serviceName}>{serviceName}</Text>
          <Text style={styles.chargeDate}>{dueDate}</Text>
        </View>
        <View style={styles.recentChargeAmount}>
          <Text style={styles.amountText}>{formatCurrency(charge?.amount)}</Text>
          <StatusBadge label={status.label} tone={status.tone} />
        </View>
      </View>
    </View>
  );
}

function BottomTab({ label, icon, active, disabled, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      accessibilityHint={disabled ? 'Indisponível: esta seção ainda não possui uma tela.' : undefined}
      disabled={disabled}
      onPress={onPress}
      style={styles.bottomTab}
    >
      <HomeIcon name={icon} />
      <Text style={[styles.bottomTabLabel, active && styles.bottomTabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export default function AdminScreen({ navigation }) {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nowMs, setNowMs] = useState(0);
  const isFocused = useRef(false);

  const goTo = (route) => navigation?.navigate(route, { homeRoute: 'Admin' });

  const loadDashboard = useCallback(async () => {
    if (!isFocused.current) return;
    setLoading(true);
    setError('');
    try {
      const [profileData, chargesData] = await Promise.all([
        api.get('/account/me'),
        api.get('/admin/charges'),
      ]);

      if (!isFocused.current) return;
      setProfile(profileData || null);
      setCharges(Array.isArray(chargesData) ? chargesData : []);
      setNowMs(Date.now());
    } catch (e) {
      if (isFocused.current) {
        setError(e.message || 'Não foi possível carregar o painel administrativo.');
      }
    } finally {
      if (isFocused.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      void loadDashboard();
      return () => {
        isFocused.current = false;
      };
    }, [loadDashboard]),
  );

  const summary = useMemo(() => calculateSummary(charges, nowMs), [charges, nowMs]);
  const financialCharges = useMemo(
    () => charges.filter((charge) => charge.issuanceState !== 'SIMULATED'),
    [charges],
  );
  const paidCount = useMemo(() => financialCharges.filter((charge) => String(charge?.status || '').toUpperCase() === 'PAID').length, [financialCharges]);
  const pendingCount = useMemo(() => financialCharges.filter((charge) => ['PENDING', 'PAYMENT_IN_PROCESS'].includes(String(charge?.status || '').toUpperCase())).length, [financialCharges]);
  const overdueCount = useMemo(() => financialCharges.filter((charge) => String(charge?.status || '').toUpperCase() === 'OVERDUE').length, [financialCharges]);
  const upcomingCount = useMemo(
    () => financialCharges.filter((charge) => isUpcomingCharge(charge, nowMs)).length,
    [financialCharges, nowMs],
  );

  const summaryCards = useMemo(() => [
    { label: 'Recebido', value: formatCurrency(summary.received), detail: `${paidCount} cobranças`, icon: 'received', tone: 'green' },
    { label: 'Pendente', value: formatCurrency(summary.pending), detail: `${pendingCount} em aberto`, icon: 'pending', tone: 'gold' },
    { label: 'Vencido', value: formatCurrency(summary.overdue), detail: `${overdueCount} vencidas`, icon: 'overdue', tone: 'red' },
    { label: 'A vencer', value: formatCurrency(summary.upcoming), detail: `${upcomingCount} nos próximos 7 dias`, icon: 'calendar', tone: 'brown' },
  ], [paidCount, pendingCount, overdueCount, upcomingCount, summary]);

  const recentCharges = useMemo(() => {
    const sorted = [...charges].sort((first, second) => {
      return String(getDueDate(second) || '').localeCompare(String(getDueDate(first) || ''));
    });
    return sorted.slice(0, 3);
  }, [charges]);

  const paidShare = summary.total > 0 ? Math.min(Math.round((summary.received / summary.total) * 100), 100) : 0;

  async function sair() {
    try {
      if (!(await showConfirm('Sair da conta?', 'Deseja encerrar sua sessão?'))) {
        return;
      }
      await signOut();
      navigation.replace('Login');
    } catch (error) {
      showAlert('Não foi possível sair', error.message || 'Tente novamente.');
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageContent}>
          <View style={styles.header}>
            <SideMenu navigation={navigation} currentRoute="Admin" onLogout={sair} buttonStyle={styles.headerIconButton} />
            <Text style={styles.headerTitle}>Painel da Equipe</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir perfil"
              onPress={() => goTo('Profile')}
              style={styles.profileButton}
            >
              <HomeIcon name="financeBadge" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={sair}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutLabel}>Sair</Text>
            </Pressable>
          </View>

          <View style={styles.greeting}>
            <View style={styles.greetingCopy}>
              <Text style={styles.brandEyebrow}>IMPÉRIO DOG RESORT</Text>
              <Text style={styles.greetingTitle}>Olá, {profile?.name || 'Administrador'}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cadastrar novo cliente"
              accessibilityHint="Abre o cadastro de clientes."
              onPress={() => goTo('Customers')}
              style={styles.clientButton}
            >
              <HomeIcon name="addCircle" />
              <Text style={styles.clientButtonText}>Cliente</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>Carregando painel administrativo...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={loadDashboard} style={styles.stateButton}>
                <Text style={styles.stateButtonText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.financialCard}>
                <View style={styles.financialTopRow}>
                  <Text style={styles.financialLabel}>RESUMO FINANCEIRO</Text>
                  <HomeIcon name="financeWallet" />
                </View>
                <Text style={styles.financialAmount}>{formatCurrency(summary.total)}</Text>
                <View style={styles.financialChange}>
                  <HomeIcon name="growth" />
                  <Text style={styles.financialChangeText}>{paidShare}% recebida</Text>
                </View>
                <View pointerEvents="none" style={styles.financialDecoration}>
                  <HomeIcon name="financialOverlay" />
                </View>
              </View>

              <View style={styles.section}>
                <SectionHeading title="Resumo das cobranças" action="Ver faturas" onAction={() => goTo('CustomerCharges')} />
                <View style={styles.summaryGrid}>
                  {summaryCards.map((item) => <ChargeSummaryCard key={item.label} item={item} />)}
                </View>
              </View>

              <View style={styles.section}>
                <SectionHeading title="Ações rápidas" />
                <View style={styles.quickActions}>
                  <Pressable onPress={() => goTo('Charges')} style={[styles.quickAction, styles.quickActionPrimary]}>
                    <HomeIcon name="addCircle" />
                    <Text style={[styles.quickActionLabel, styles.quickActionPrimaryLabel]}>Cobrança</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Ver clientes cadastrados"
                    onPress={() => goTo('CustomersList')}
                    style={styles.quickAction}
                  >
                    <HomeIcon name="quickCustomers" />
                    <Text style={styles.quickActionLabel}>Clientes</Text>
                  </Pressable>
                  <Pressable onPress={() => goTo('Services')} style={styles.quickAction}>
                    <HomeIcon name="invoices" />
                    <Text style={styles.quickActionLabel}>Serviços</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.goalCard}>
                  <View style={styles.goalTitleRow}>
                    <Text style={styles.sectionTitle}>Cobranças do período</Text>
                    <Text style={styles.goalPercent}>{paidShare}%</Text>
                  </View>
                  <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: paidShare }} style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${paidShare}%` }]} />
                  </View>
                  <View style={styles.goalValues}>
                    <View>
                      <Text style={styles.goalCurrent}>{formatCurrency(summary.received)}</Text>
                      <Text style={styles.goalOf}>recebido</Text>
                    </View>
                    <Text style={styles.goalTarget}>Total {formatCurrency(summary.total)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <SectionHeading title="Últimas cobranças" action="Ver todas" onAction={() => goTo('CustomerCharges')} />
                {recentCharges.length ? (
                  <View style={styles.recentList}>
                    {recentCharges.map((charge) => (
                      <RecentCharge key={charge.id || charge.customerName || charge.serviceName} charge={charge} />
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyStateCard}>
                    <Text style={styles.emptyStateTitle}>Nenhuma cobrança cadastrada</Text>
                    <Text style={styles.emptyStateText}>As cobranças emitidas aparecerão aqui automaticamente.</Text>
                  </View>
                )}
              </View>

              <Pressable onPress={() => goTo('Charges')} style={styles.primaryAction}>
                <HomeIcon name="addCircle" />
                <Text style={styles.primaryActionText}>Nova cobrança</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNavigation}>
        <BottomTab label="Início" icon="home" active disabled />
        <BottomTab label="Faturas" icon="invoices" onPress={() => goTo('CustomerCharges')} />
        <BottomTab label="Histórico" icon="history" onPress={() => goTo('History')} />
        <BottomTab label="Perfil" icon="profile" onPress={() => goTo('Profile')} />
      </View>
    </SafeAreaView>
  );
}
