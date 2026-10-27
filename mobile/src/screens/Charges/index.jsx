import { useState } from 'react';
import { BlurView } from 'expo-blur';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import AppNavigation, { ProfileButton } from '../../components/AppNavigation';
import InvoiceCard from '../../components/InvoiceCard';
import { styles } from './styles';

const invoices = [
  {
    dueDate: '30/09/2026',
    title: 'Hospedagem mensal — Suíte\nImperial',
    status: 'pendente',
    amount: 'R$ 850,00',
  },
  {
    dueDate: '15/09/2026',
    title: 'Serviços de banho e tosa — Pacote\nEspecial',
    status: 'pago',
    amount: 'R$ 289,90',
  },
  {
    dueDate: '01/09/2026',
    title: 'Day Care Premium — Diárias',
    status: 'vencido',
    amount: 'R$ 420,00',
  },
];

const filters = [
  { label: 'Todas', value: 'todas', style: styles.allChip },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Pagas', value: 'pago', style: styles.paidChip },
  { label: 'Vencidas', value: 'vencido' },
];

function IconSlot({ style }) {
  return <View accessible={false} style={style} />;
}

function Header() {
  return (
    <BlurView intensity={12} tint="light" style={styles.headerBlur}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.logoBox}>
            <Image
              resizeMode="contain"
              source={require('../../assets/images/logo-imperio-dog.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandName}>IMPÉRIO DOG RESORT</Text>
            <Text style={styles.headerTitle}>Faturas</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.notificationButton}>
            <IconSlot style={styles.bellIconSlot} />
            <View style={styles.notificationDot} />
          </View>
          <View style={styles.avatarContainer}>
            <ProfileButton
              onPress={() => navigation.navigate('Profile', { homeRoute })}
              size={32}
              iconSize={16}
            />
          </View>
        </View>
      </View>
    </BlurView>
  );
}

export default function ChargesScreen({ navigation, route }) {
  const [activeFilter, setActiveFilter] = useState('todas');
  const homeRoute = route.params?.homeRoute || 'Home';
  const visibleInvoices = activeFilter === 'todas'
    ? invoices
    : invoices.filter((invoice) => invoice.status === activeFilter);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.main}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>Minhas cobranças</Text>
          <Text style={styles.subtitle}>
            Consulte seus boletos e acompanhe seus pagamentos.
          </Text>
        </View>

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
                style={[
                  styles.filterChip,
                  filter.style,
                  isActive ? styles.activeChip : styles.inactiveChip,
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    isActive ? styles.activeChipLabel : styles.inactiveChipLabel,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.invoiceList}>
          {visibleInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.dueDate}
              onPress={() =>
                navigation.navigate('Pagamento', { homeRoute })
              }
              {...invoice}
            />
          ))}
        </View>
      </ScrollView>
      <Header />
      <AppNavigation
        activeRoute="Charges"
        homeRoute={homeRoute}
        navigation={navigation}
      />
    </View>
  );
}
