import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeIcon from './icons';
import { styles } from './styles';

const chargeSummaries = [
  { label: 'Recebido', value: 'R$ 8.450', detail: 'Total pago', icon: 'received', tone: 'green' },
  { label: 'Pendente', value: 'R$ 1.280', detail: '4 faturas', icon: 'pending', tone: 'gold' },
  { label: 'Vencido', value: 'R$ 620', detail: 'Ação necessária', icon: 'overdue', tone: 'red' },
  { label: 'A vencer', value: 'R$ 1.940', detail: 'Próx. 7 dias', icon: 'calendar', tone: 'brown' },
];

const recentCharges = [
  { name: 'Mariana Oliveira', service: 'Hospedagem mensal', date: '25 set 2026', amount: 'R$ 289,90', status: 'PENDENTE', tone: 'gold', avatar: 'avatarMariana' },
  { name: 'Carlos Mendes', service: 'Banho e tosa', date: '27 set 2026', amount: 'R$ 159,90', status: 'PAGO', tone: 'green', avatar: 'avatarCarlos' },
  { name: 'Fernanda Alves', service: 'Hospedagem + recreação', date: '30 set 2026', amount: 'R$ 420,00', status: 'A VENCER', tone: 'brown', avatar: 'avatarFernanda' },
];

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
  return (
    <View style={styles.recentCharge}>
      <View style={styles.recentChargeMain}>
        <HomeIcon name={charge.avatar} />
        <View style={styles.recentChargeText}>
          <Text numberOfLines={1} style={styles.customerName}>{charge.name}</Text>
          <Text numberOfLines={1} style={styles.serviceName}>{charge.service}</Text>
          <Text style={styles.chargeDate}>{charge.date}</Text>
        </View>
        <View style={styles.recentChargeAmount}>
          <Text style={styles.amountText}>{charge.amount}</Text>
          <StatusBadge label={charge.status} tone={charge.tone} />
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

export default function HomeScreen({ navigation }) {
  const goTo = (route) => navigation?.navigate(route);

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageContent}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Menu indisponível"
              accessibilityState={{ disabled: true }}
              disabled
              style={styles.headerIconButton}
            >
              <HomeIcon name="menu" />
            </Pressable>
            <Text style={styles.headerTitle}>Início</Text>
            <Pressable
  accessibilityRole="button"
  accessibilityLabel="Abrir perfil"
  onPress={() => goTo('Profile')}
  style={styles.profileButton}
>
  <HomeIcon name="financeBadge" />
</Pressable>
          </View>

          <View style={styles.greeting}>
            <View style={styles.greetingCopy}>
              <Text style={styles.brandEyebrow}>IMPÉRIO DOG RESORT</Text>
              <Text style={styles.greetingTitle}>Olá, Administrador</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityHint="Abre o cadastro de clientes existente."
              onPress={() => goTo('Customers')}
              style={styles.clientButton}
            >
              <HomeIcon name="addCircle" />
              <Text style={styles.clientButtonText}>Cliente</Text>
            </Pressable>
          </View>

          <View style={styles.financialCard}>
            <View style={styles.financialTopRow}>
              <Text style={styles.financialLabel}>RESUMO FINANCEIRO</Text>
              <HomeIcon name="financeWallet" />
            </View>
            <Text style={styles.financialAmount}>R$ 8.450</Text>
            <View style={styles.financialChange}>
              <HomeIcon name="growth" />
              <Text style={styles.financialChangeText}>+12,5% este mês</Text>
            </View>
            <View pointerEvents="none" style={styles.financialDecoration}>
              <HomeIcon name="financialOverlay" />
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeading title="Resumo das cobranças" action="Ver faturas" onAction={() => goTo('Charges')} />
            <View style={styles.summaryGrid}>
              {chargeSummaries.map((item) => <ChargeSummaryCard key={item.label} item={item} />)}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeading title="Ações rápidas" />
            <View style={styles.quickActions}>
              <Pressable onPress={() => goTo('Charges')} style={[styles.quickAction, styles.quickActionPrimary]}>
                <HomeIcon name="addCircle" />
                <Text style={[styles.quickActionLabel, styles.quickActionPrimaryLabel]}>Cobrança</Text>
              </Pressable>
              <Pressable onPress={() => goTo('Customers')} style={styles.quickAction}>
                <HomeIcon name="quickCustomers" />
                <Text style={styles.quickActionLabel}>Clientes</Text>
              </Pressable>
              <Pressable
                accessibilityState={{ disabled: true }}
                accessibilityHint="Indisponível: não há tela de gastos cadastrada."
                disabled
                style={[styles.quickAction, styles.quickActionOutlined, styles.disabledAction]}
              >
                <HomeIcon name="quickExpenses" />
                <Text style={[styles.quickActionLabel, styles.disabledActionLabel]}>Gastos</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.goalCard}>
              <View style={styles.goalTitleRow}>
                <Text style={styles.sectionTitle}>Meta mensal</Text>
                <Text style={styles.goalPercent}>84,5%</Text>
              </View>
              <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: 84.5 }} style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
              <View style={styles.goalValues}>
                <View>
                  <Text style={styles.goalCurrent}>R$ 8.450</Text>
                  <Text style={styles.goalOf}>arrecadados</Text>
                </View>
                <Text style={styles.goalTarget}>Meta R$ 10.000</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeading title="Últimas cobranças" action="Ver todas" onAction={() => goTo('Charges')} />
            <View style={styles.recentList}>
              {recentCharges.map((charge) => (
                <RecentCharge key={charge.name} charge={charge} />
              ))}
            </View>
          </View>

          <Pressable onPress={() => goTo('Charges')} style={styles.primaryAction}>
            <HomeIcon name="addCircle" />
            <Text style={styles.primaryActionText}>Nova cobrança</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.bottomNavigation}>
        <BottomTab label="Início" icon="home" active onPress={() => {}} />
        <BottomTab label="Faturas" icon="invoices" onPress={() => goTo('Charges')} />
        <BottomTab label="Histórico" icon="history" disabled />
        <BottomTab label="Perfil" icon="profile" onPress={() => goTo('Profile')} />
      </View>
    </SafeAreaView>
  );
}
