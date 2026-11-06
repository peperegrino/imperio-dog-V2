import { useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import AppNavigation, { ProfileButton } from '../../components/AppNavigation';
import Button from '../../components/Button';
import InvoiceCard from '../../components/InvoiceCard';
import { colors } from '../../theme/colors';
import { bellXml } from '../Home/svgIcons';
import ManagementChargesScreen from './ManagementScreen';
import { styles } from './styles';

const backIconXml = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6M9 12h12" fill="none" stroke="#722F37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const receiptIconXml = '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24"><path d="M7 3.5h10a2 2 0 0 1 2 2v15l-2.5-1.6L14 20.5l-2-1.6-2 1.6-2.5-1.6L5 20.5v-15a2 2 0 0 1 2-2Z" fill="none" stroke="#722F37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" fill="none" stroke="#B58C63" stroke-width="1.5" stroke-linecap="round"/></svg>';
const filters = [
  { label: 'Todas', value: 'todas' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Pagas', value: 'pago' },
  { label: 'Vencidas', value: 'vencido' },
];

function Header({ navigation, homeRoute }) {
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(homeRoute, { homeRoute });
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeading}>
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          hitSlop={8}
          onPress={goBack}
          style={styles.backButton}
        >
          <SvgXml height={22} width={22} xml={backIconXml} />
        </Pressable>
        <Text style={styles.headerTitle}>Cobrança</Text>
      </View>
      <View style={styles.headerActions}>
        <View accessibilityLabel="Notificações" accessible style={styles.notificationButton}>
          <SvgXml height={19} width={15} xml={bellXml} />
        </View>
        <ProfileButton
          onPress={() => navigation.navigate('Profile', { homeRoute })}
          size={34}
          iconSize={16}
        />
      </View>
    </View>
  );
}

function EmptyChargesState({ onBackToHome }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.illustration}>
        <SvgXml height={42} width={42} xml={receiptIconXml} />
      </View>
      <View style={styles.emptyCopy}>
        <Text style={styles.emptyTitle}>Nenhuma cobrança encontrada</Text>
        <Text style={styles.emptyDescription}>
          No momento, você não possui nenhuma cobrança disponível para pagamento.
        </Text>
        <Text style={styles.emptyHint}>
          Quando uma nova cobrança for gerada, ela aparecerá automaticamente nesta área.
        </Text>
      </View>
      <View style={styles.buttonWrap}>
        <Button label="Voltar ao início" onPress={onBackToHome} />
      </View>
    </View>
  );
}

function TutorChargesScreen({ navigation, route }) {
  const homeRoute = route.params?.homeRoute || 'Home';
  const invoices = route.params?.invoices || [];
  const [activeFilter, setActiveFilter] = useState('todas');
  const visibleInvoices = activeFilter === 'todas'
    ? invoices
    : invoices.filter((invoice) => invoice.status === activeFilter);
  const goToHome = () => navigation.navigate(homeRoute, { homeRoute });

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <Header homeRoute={homeRoute} navigation={navigation} />
      <ScrollView
        contentContainerStyle={styles.main}
        showsVerticalScrollIndicator={false}
      >
        {invoices.length === 0 ? (
          <EmptyChargesState onBackToHome={goToHome} />
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.filterRow}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {filters.map((filter) => {
                const isActive = activeFilter === filter.value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    key={filter.value}
                    onPress={() => setActiveFilter(filter.value)}
                    style={[styles.filterChip, isActive ? styles.activeChip : styles.inactiveChip]}
                  >
                    <Text style={[styles.filterLabel, isActive ? styles.activeChipLabel : styles.inactiveChipLabel]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {visibleInvoices.length === 0 ? (
              <Text style={styles.noFilteredInvoices}>
                Nenhuma cobrança encontrada neste filtro.
              </Text>
            ) : (
              <View style={styles.invoiceList}>
                {visibleInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.dueDate}
                    onPress={() => navigation.navigate('Pagamento', { homeRoute })}
                    {...invoice}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
      <AppNavigation
        activeRoute="Charges"
        homeRoute={homeRoute}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

export default function ChargesScreen({ navigation, route }) {
  if (route.params?.homeRoute === 'Admin') {
    return <ManagementChargesScreen navigation={navigation} />;
  }

  return <TutorChargesScreen navigation={navigation} route={route} />;
}
