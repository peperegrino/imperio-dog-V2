import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import AppNavigation, { ProfileButton } from '../../components/AppNavigation';
import { styles } from './styles';
import {
  bellXml,
  calendarXml,
  careXml,
  historyXml,
  receiptXml,
  viewBoletoXml,
  payBoletoXml,
  foodXml,
  vipXml,
} from './svgIcons';

const charges = [
  {
    id: 'IMP-8841',
    title: 'Day Care Quinzenal de Outubro',
    description: 'Vencimento: 05/11/2026 · Boleto bancário',
    amount: 'R$ 480,00',
    status: 'pending',
    statusLabel: 'Em aberto',
  },
  {
    id: 'IMP-7492',
    title: 'Banho Premium',
    description: 'Pago em: 15/10/2026 · Boleto bancário',
    amount: 'R$ 195,00',
    status: 'paid',
    statusLabel: 'Liquidado',
  },
  {
    id: 'IMP-6920',
    title: 'Hospedagem Feriado 7 de Setembro',
    description: 'Pago em: 08/09/2026 · Boleto bancário',
    amount: 'R$ 420,00',
    status: 'paid',
    statusLabel: 'Liquidado',
  },
  {
    id: 'IMP-6418',
    title: 'Day Care Premium',
    description: 'Vencimento: 10/11/2026 · Boleto bancário',
    amount: 'R$ 289,90',
    status: 'pending',
    statusLabel: 'Em aberto',
  },
];

const filters = [
  { key: 'all', label: 'Todas (4)' },
  { key: 'pending', label: 'Pendentes (2)' },
  { key: 'paid', label: 'Pagas (2)' },
  { key: 'services', label: 'Serviços' },
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

function ChargeCard({ charge, onOpenCharges }) {
  const isPending = charge.status === 'pending';

  return (
    <View style={styles.chargeCard}>
      <View style={styles.chargeCardTop}>
        <Text style={styles.chargeId}>#{charge.id}</Text>
        <StatusPill tone={isPending ? 'warning' : 'success'}>
          {charge.statusLabel}
        </StatusPill>
      </View>
      <Text style={styles.chargeTitle}>{charge.title}</Text>
      <Text style={styles.chargeDescription}>{charge.description}</Text>
      <View style={styles.chargeDivider} />
      <View style={styles.chargeFooter}>
        <View>
          {isPending ? <Text style={styles.amountCaption}>Total</Text> : null}
          <Text style={styles.chargeAmount}>{charge.amount}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenCharges}
          style={[styles.chargeAction, isPending && styles.chargeActionPrimary]}
        >
          {isPending ? (
            <Icon xml={payBoletoXml} size={12} />
          ) : (
            <Text style={styles.downloadMark}>↓</Text>
          )}
          <Text
            style={[
              styles.chargeActionText,
              isPending && styles.chargeActionTextPrimary,
            ]}
          >
            {isPending ? 'Ver boleto' : 'Comprovante Oficial'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const pendingCharges = charges.filter((charge) => charge.status === 'pending');
  const visibleCharges = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'services') {
      return charges;
    }

    return charges.filter((charge) => charge.status === activeFilter);
  }, [activeFilter]);
  const hasPendingCharges = pendingCharges.length > 0;
  const openCharges = () => {
  const invoices = charges.map((charge) => ({
    dueDate: charge.description.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] || '',
    dateLabel: charge.status === 'pending' ? 'Vencimento' : 'Pago em',
    title: charge.title,
    status: charge.status === 'pending' ? 'pendente' : 'pago',
    amount: charge.amount,
  }));

  navigation.navigate('Charges', {
    homeRoute: 'Home',
    invoices,
  });
};

  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel do Tutor</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel={
              hasPendingCharges
                ? `${pendingCharges.length} cobranças pendentes`
                : 'Notificações'
            }
            accessibilityRole="button"
            onPress={openCharges}
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
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.introHeading}>
            <Text style={styles.greeting}>Olá, Mariana</Text>
            <View style={styles.vipPill}>
              <Icon xml={vipXml} size={11} />
              <Text style={styles.vipText}>VIP</Text>
            </View>
          </View>
          <Text style={styles.introDescription}>
            Gerencie a hospedagem do Thor, mimos contratados e faturas com total
            conveniência.
          </Text>
        </View>

        <View style={styles.petCard}>
          <View style={styles.petAvatar}>
            <Text style={styles.petEmoji}>🐶</Text>
            <View style={styles.petOnlineDot} />
          </View>
          <View style={styles.petDetails}>
            <View style={styles.petHeading}>
              <Text style={styles.petName}>Thor</Text>
              <StatusPill tone="resort">No Resort</StatusPill>
            </View>
            <Text style={styles.petDescription}>
              Hospedado na Suíte Master 04
            </Text>
            <View style={styles.petDates}>
              <Icon xml={calendarXml} size={11} />
              <Text style={styles.petDatesText}>
                25 Out – 02 Nov (Restam 2 dias)
              </Text>
            </View>
          </View>
          <View style={styles.petActions}>
            <Pressable
              onPress={() => navigation.navigate('Pets', { homeRoute: 'Home' })}
              style={styles.petActionSecondary}
            >
              <Text style={styles.petActionSecondaryText}>Ver detalhes</Text>
            </Pressable>
            <Pressable onPress={openCharges} style={styles.petActionSoft}>
              <Icon xml={historyXml} size={12} />
              <Text style={styles.petActionSoftText}>Histórico</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Mimos & Cuidados Inclusos</Text>
          <View style={styles.inProgressLabel}>
            <View style={styles.brownDot} />
            <Text style={styles.inProgressText}>3 em andamento</Text>
          </View>
        </View>

        <View style={styles.serviceCard}>
          <View style={styles.serviceIconBath}>
            <Icon xml={careXml} size={18} />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceTitle}>Banho Relaxante</Text>
            <Text style={styles.serviceDescription}>
              Agendado para amanhã às 10:30 com Dr. Valter.
            </Text>
          </View>
          <StatusPill tone="success">Confirmado</StatusPill>
        </View>

        <View style={styles.serviceCard}>
          <View style={styles.serviceIconFood}>
            <Icon xml={foodXml} size={16} />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceTitle}>Cardápio Natural</Text>
            <Text style={styles.serviceDescription}>
              2 porções diárias de carne magra e legumes no vapor
            </Text>
          </View>
          <StatusPill>Em curso</StatusPill>
        </View>

        <View style={styles.currentChargeCard}>
          <View style={styles.currentChargeTop}>
            <View style={styles.currentChargeLabel}>
              <View style={styles.primaryDot} />
              <Text style={styles.currentChargeTitle}>COBRANÇA ATUAL</Text>
            </View>
            <StatusPill tone="warning">Vence em 2 dias</StatusPill>
          </View>
          <View style={styles.currentChargeDivider} />
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.amountCaption}>VALOR TOTAL</Text>
              <Text style={styles.currentAmount}>R$ 1.280,00</Text>
            </View>
            <Pressable onPress={openCharges} style={styles.pdfButton}>
              <Icon xml={receiptXml} size={12} />
              <Text style={styles.pdfText}>PDF</Text>
            </Pressable>
          </View>
          <Text style={styles.currentChargeDescription}>
            5 diárias em Suíte Master Imperial + Day Care VIP e Banho Premium
          </Text>
          <Pressable onPress={openCharges} style={styles.boletoButton}>
            <Icon xml={viewBoletoXml} size={15} />
            <Text style={styles.boletoText}>Visualizar boleto</Text>
          </Pressable>
        </View>

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

        {visibleCharges.map((charge) => (
          <ChargeCard
            charge={charge}
            key={charge.id}
            onOpenCharges={openCharges}
          />
        ))}

        <View style={styles.footerSpacer} />
      </ScrollView>

      <AppNavigation
        activeRoute="Home"
        navigation={navigation}
      />
    </SafeAreaView>
  );
}
