import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';

import AppNavigation, { ProfileButton } from '../../components/AppNavigation';
import SideMenu from '../../components/SideMenu';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { styles } from './styles';
import { showAlert, showConfirm } from '../../utils/alert';
import {
  bellXml,
  calendarXml,
  historyXml,
  receiptXml,
  viewBoletoXml,
} from './svgIcons';

const filters = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'overdue', label: 'Vencidas' },
  { key: 'paid', label: 'Pagas' },
];

function Icon({ xml, size = 16 }) {
  return <SvgXml height={size} width={size} xml={xml} />;
}

function StatusPill({ children, tone = 'neutral' }) {
  return (
    <View style={[styles.statusPill, styles[`statusPill_${tone}`]]}>
      <Text style={[styles.statusText, styles[`statusText_${tone}`]]}>
        {children}
      </Text>
    </View>
  );
}

function toCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value) {
  if (typeof value !== 'string') return '';
  const date = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function getChargeStatus(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'PAID') return { filter: 'paid', label: 'Pago', tone: 'success' };
  if (value === 'OVERDUE') return { filter: 'overdue', label: 'Vencido', tone: 'danger' };
  if (value === 'PAYMENT_IN_PROCESS') {
    return { filter: 'pending', label: 'Em processamento', tone: 'warning' };
  }
  if (value === 'PENDING') return { filter: 'pending', label: 'Pendente', tone: 'warning' };
  if (value === 'CANCELED') return { filter: 'cancelled', label: 'Cancelado', tone: 'neutral' };
  return { filter: 'unknown', label: 'Status não identificado', tone: 'neutral' };
}

function filterCharges(charges, filter) {
  if (filter === 'all') return charges;
  return charges.filter((charge) => getChargeStatus(charge.status).filter === filter);
}

function ChargeCard({ charge, onOpenCharges }) {
  const status = getChargeStatus(charge.status);
  const dueDate = formatDate(charge.dueDate);

  return (
    <View style={styles.chargeCard}>
      <View style={styles.chargeCardTop}>
        <Text style={styles.chargeId}>#{charge.id}</Text>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </View>
      <Text style={styles.chargeTitle}>{charge.issuanceState === 'SIMULATED' && 'Simulação · '}{charge.serviceName || 'Cobrança'}</Text>
      <Text style={styles.chargeDescription}>
        {charge.petName ? `${charge.petName} · ` : ''}
        {dueDate ? `Vencimento ${dueDate}` : 'Vencimento não informado'}
      </Text>
      <View style={styles.chargeDivider} />
      <View style={styles.chargeFooter}>
        <View>
          <Text style={styles.amountCaption}>Total</Text>
          <Text style={styles.chargeAmount}>{toCurrency(charge.amount)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => onOpenCharges(charge.id)}
          style={styles.chargeAction}
        >
          <Text style={styles.chargeActionText}>Ver cobrança</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { signOut } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [profile, setProfile] = useState(null);
  const [pets, setPets] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isFocused = useRef(false);

  const load = useCallback(async () => {
    if (!isFocused.current) return;
    setLoading(true);
    setError('');
    try {
      const [profileData, petsData, chargesData] = await Promise.all([
        api.get('/account/me'),
        api.get('/account/pets'),
        api.get('/charges/my-charges'),
      ]);

      if (!profileData || typeof profileData !== 'object' || Array.isArray(profileData)) {
        throw new Error('A API retornou um perfil inválido.');
      }
      if (!Array.isArray(petsData) || !Array.isArray(chargesData)) {
        throw new Error('A API retornou uma lista de pets ou cobranças inválida.');
      }

      if (!isFocused.current) return;
      setProfile(profileData);
      setPets(petsData);
      setCharges(chargesData);
    } catch (e) {
      if (isFocused.current) {
        setError(e.message || 'Não foi possível carregar os dados do tutor.');
      }
    } finally {
      if (isFocused.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      void load();
      return () => {
        isFocused.current = false;
      };
    }, [load]),
  );

  const openChargesForTutor = charges.filter((charge) => (
    charge.issuanceState !== 'SIMULATED'
    && ['PENDING', 'PAYMENT_IN_PROCESS', 'OVERDUE'].includes(charge.status)
  ));
  const visibleCharges = useMemo(() => {
    return filterCharges(charges, activeFilter);
  }, [activeFilter, charges]);
  const billedServices = useMemo(() => {
    const byName = new Map();
    charges.forEach((charge) => {
      if (charge.issuanceState === 'SIMULATED') return;
      const name = charge.serviceName?.trim();
      if (!name) return;
      const entry = byName.get(name) || { name, count: 0, pets: new Set(), chargeId: charge.id };
      entry.count += 1;
      if (charge.petName) entry.pets.add(charge.petName);
      byName.set(name, entry);
    });
    return [...byName.values()];
  }, [charges]);

  const hasPendingCharges = openChargesForTutor.length > 0;
  const currentCharge = openChargesForTutor[0] || charges.find((charge) => charge.issuanceState !== 'SIMULATED') || null;
  const currentChargeStatus = currentCharge ? getChargeStatus(currentCharge.status) : null;
  const currentChargeDueDate = currentCharge ? formatDate(currentCharge.dueDate) : '';

  const openCharges = (chargeId) => {
    if (chargeId != null) {
      navigation.navigate('Pagamento', { chargeId });
    } else {
      navigation.navigate('Charges', { homeRoute: 'Home' });
    }
  };

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
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.header}>
        <SideMenu navigation={navigation} currentRoute="Home" onLogout={sair} buttonStyle={styles.bellButton} />
        <Text style={styles.headerTitle}>Painel do Tutor</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel={
              hasPendingCharges
              ? `${openChargesForTutor.length} cobranças em aberto`
                : 'Notificações'
            }
            accessibilityRole="button"
            onPress={() => openCharges()}
            style={styles.bellButton}
          >
            <Icon xml={bellXml} size={18} />
            {hasPendingCharges ? <View style={styles.notificationDot} /> : null}
          </Pressable>
          <ProfileButton
            onPress={() => navigation.navigate('Profile', { homeRoute: 'Home' })}
            size={30}
            iconSize={15}
          />
          <Pressable
            accessibilityRole="button"
            onPress={sair}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutLabel}>Sair</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color="#722F37" />
            <Text style={styles.loadingText}>Carregando dados do tutor...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void load()}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.intro}>
              <View style={styles.introHeading}>
                <Text style={styles.greeting}>Olá, {profile?.name || 'Tutor'}</Text>
              </View>
              <Text style={styles.introDescription}>
                {pets.length
                  ? `Você possui ${pets.length} pet${pets.length > 1 ? 's' : ''} cadastrado${pets.length > 1 ? 's' : ''}.`
                  : 'Ainda não há pets cadastrados para este tutor.'}
              </Text>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Meus pets</Text>
              <View style={styles.inProgressLabel}>
                <View style={styles.brownDot} />
                <Text style={styles.inProgressText}>{pets.length} pet{pets.length === 1 ? '' : 's'}</Text>
              </View>
            </View>

            {pets.length ? pets.map((pet) => (
              <View key={pet.id} style={styles.petCard}>
                <View style={styles.petAvatar}>
                  <Text style={styles.petInitial}>{pet.name?.trim()?.[0]?.toUpperCase() || 'P'}</Text>
                </View>
                <View style={styles.petDetails}>
                  <Text style={styles.petName}>{pet.name || 'Pet sem nome'}</Text>
                  <Text style={styles.petDescription}>
                    {[pet.species, pet.breed].filter(Boolean).join(' · ') || 'Espécie não informada'}
                  </Text>
                  {pet.sex || pet.weight != null ? (
                    <Text style={styles.petMeta}>
                      {[pet.sex, pet.weight != null ? `${pet.weight} kg` : null].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}
                  {formatDate(pet.birthDate) ? (
                    <View style={styles.petDates}>
                      <Icon xml={calendarXml} size={11} />
                      <Text style={styles.petDatesText}>Nascimento: {formatDate(pet.birthDate)}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.petActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => navigation.navigate('Pets', { homeRoute: 'Home' })}
                    style={styles.petActionSecondary}
                  >
                    <Text style={styles.petActionSecondaryText}>Ver detalhes</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => navigation.navigate('History', { homeRoute: 'Home' })}
                    style={styles.petActionSoft}
                  >
                    <Icon xml={historyXml} size={12} />
                    <Text style={styles.petActionSoftText}>Histórico</Text>
                  </Pressable>
                </View>
              </View>
            )) : (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>Nenhum pet cadastrado no momento.</Text>
              </View>
            )}

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Serviços nas cobranças</Text>
              <Text style={styles.inProgressText}>{billedServices.length} serviços</Text>
            </View>
            {billedServices.length ? billedServices.map((service) => (
              <Pressable
                key={service.name}
                accessibilityRole="button"
                onPress={() => openCharges(service.chargeId)}
                style={styles.serviceCard}
              >
                <View style={styles.serviceIconBath}><Icon xml={receiptXml} size={16} /></View>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceTitle}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>
                    {service.count} cobrança{service.count === 1 ? '' : 's'}
                    {service.pets.size ? ` · ${[...service.pets].join(', ')}` : ''}
                  </Text>
                </View>
                <Text style={styles.serviceChevron}>›</Text>
              </Pressable>
            )) : (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>Não há serviços descritos nas cobranças carregadas.</Text>
              </View>
            )}

            {currentCharge ? (
              <View style={styles.currentChargeCard}>
                <View style={styles.currentChargeTop}>
                  <View style={styles.currentChargeLabel}>
                    <View style={styles.primaryDot} />
                    <Text style={styles.currentChargeTitle}>COBRANÇA ATUAL</Text>
                  </View>
                  <StatusPill tone={currentChargeStatus.tone}>{currentChargeStatus.label}</StatusPill>
                </View>
                <View style={styles.currentChargeDivider} />
                <View style={styles.totalRow}>
                  <View>
                    <Text style={styles.amountCaption}>VALOR TOTAL</Text>
                    <Text style={styles.currentAmount}>{toCurrency(currentCharge.amount)}</Text>
                  </View>
                  <Pressable onPress={() => openCharges(currentCharge.id)} style={styles.pdfButton}>
                    <Icon xml={receiptXml} size={12} />
                    <Text style={styles.pdfText}>Detalhes</Text>
                  </Pressable>
                </View>
                <Text style={styles.currentChargeDescription}>
                  {currentCharge.serviceName || 'Cobrança'}
                  {currentChargeDueDate ? ` · vencimento ${currentChargeDueDate}` : ''}
                </Text>
                <Pressable onPress={() => openCharges(currentCharge.id)} style={styles.boletoButton}>
                  <Icon xml={viewBoletoXml} size={15} />
                  <Text style={styles.boletoText}>Ver cobranças</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>Nenhuma cobrança disponível no momento.</Text>
              </View>
            )}

            <View style={styles.historyHeading}>
              <Text style={styles.sectionTitle}>Histórico & Cobranças</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={styles.filterList}
              showsHorizontalScrollIndicator={false}
            >
              {filters.map((filter) => {
                const selected = filter.key === activeFilter;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={filter.key}
                    onPress={() => setActiveFilter(filter.key)}
                    style={[styles.filterPill, selected && styles.filterPillActive]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selected && styles.filterTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {visibleCharges.length ? (
              visibleCharges.map((charge) => (
                <ChargeCard
                  charge={charge}
                  key={charge.id}
                  onOpenCharges={openCharges}
                />
              ))
            ) : (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>Nenhuma cobrança para este filtro.</Text>
              </View>
            )}

            <View style={styles.footerSpacer} />
          </>
        )}
      </ScrollView>

      <AppNavigation activeRoute="Home" navigation={navigation} />
    </SafeAreaView>
  );
}
