import { useState } from 'react';
import { Animated, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useAuth } from '../../contexts/AuthContext';
import HomeIcon from '../../screens/Home/icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import CustomerIcon from '../CustomerIcons';

const adminItems = [
  { route: 'Admin', label: 'Início', icon: 'home' },
  { route: 'CustomersList', label: 'Clientes', icon: 'quickCustomers' },
  { route: 'Customers', label: 'Cadastrar Cliente', icon: 'addCircle' },
  { route: 'CustomerCharges', label: 'Cobranças', icon: 'invoices' },
  { route: 'Charges', label: 'Nova Cobrança', icon: 'quickExpenses' },
  { route: 'History', label: 'Histórico', icon: 'history' },
  { route: 'Services', label: 'Serviços e Valores', icon: 'financeWallet' },
  { route: 'Profile', label: 'Meu Perfil', icon: 'profile' },
];

const tutorItems = [
  { route: 'Home', label: 'Início', icon: 'home' },
  { route: 'Pets', label: 'Meus Pets', icon: 'pet' },
  { route: 'NewPet', label: 'Cadastrar Pet', icon: 'addCircle' },
  { route: 'Charges', label: 'Minhas Cobranças', icon: 'invoices' },
  { route: 'History', label: 'Histórico', icon: 'history' },
  { route: 'Profile', label: 'Meu Perfil', icon: 'profile' },
];

export default function SideMenu({ navigation, currentRoute, onLogout, buttonStyle }) {
  const { session } = useAuth();
  const [visible, setVisible] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));
  const isAdmin = session?.role === 'ADMIN';
  const homeRoute = isAdmin ? 'Admin' : 'Home';

  function open() {
    progress.setValue(0);
    setVisible(true);
  }

  function animateOpen() {
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }

  function close() {
    setVisible(false);
  }

  function goTo(route) {
    close();
    if (route !== currentRoute) navigation.navigate(route, { homeRoute });
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir menu lateral"
        accessibilityState={{ expanded: visible }}
        hitSlop={8}
        onPress={open}
        style={[styles.iconButton, buttonStyle]}
      >
        <HomeIcon name="menu" />
      </Pressable>

      {visible && (
        <Modal transparent visible onShow={animateOpen} onRequestClose={close}>
          <View style={styles.modal}>
            <Animated.View style={[styles.backdrop, { opacity: progress }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={close} accessible={false} />
            </Animated.View>
            <Animated.View
              style={[styles.drawer, { transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-320, 0] }) }] }]}
            >
              <SafeAreaView style={styles.content} accessibilityViewIsModal>
                <View style={styles.header}>
                  <Text accessibilityRole="header" style={styles.title}>Menu</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Fechar menu lateral" onPress={close} style={styles.iconButton}>
                    <Svg width={20} height={20} viewBox="0 0 24 24">
                      <Path d="m6 6 12 12M18 6 6 18" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                  </Pressable>
                </View>
                <ScrollView style={styles.routes} showsVerticalScrollIndicator={false}>
                  {(isAdmin ? adminItems : tutorItems).map(({ route, label, icon }) => {
                    const active = route === currentRoute;
                    return (
                      <Pressable
                        key={route}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => goTo(route)}
                        style={[styles.item, active && styles.activeItem]}
                      >
                        <View style={styles.itemIcon}>
                          {icon === 'pet' ? <CustomerIcon name="pet" /> : (
                            <HomeIcon name={icon} size={19} color={active ? colors.primary : colors.textMuted} />
                          )}
                        </View>
                        <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <View style={styles.footer}>
                  <Pressable accessibilityRole="button" onPress={() => { close(); void onLogout(); }} style={styles.item}>
                    <View style={styles.itemIcon}>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path d="M10 4H5v16h5m4-13 5 5-5 5m5-5H9" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <Text style={[styles.label, styles.activeLabel]}>Sair da Conta</Text>
                  </Pressable>
                </View>
              </SafeAreaView>
            </Animated.View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, flexDirection: 'row' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,28,28,0.55)' },
  drawer: { width: '84%', maxWidth: 320, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 16 },
  header: {
    paddingVertical: 12,
    paddingLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: colors.primary, fontFamily: typography.fontFamily.bold, fontSize: 22 },
  routes: { flex: 1 },
  item: { minHeight: 46, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 },
  itemIcon: { width: 22, alignItems: 'center', justifyContent: 'center' },
  activeItem: { backgroundColor: '#F0E1E2' },
  label: { color: colors.textDark, fontFamily: typography.fontFamily.semibold, fontSize: 14 },
  activeLabel: { color: colors.primary },
  footer: { borderTopWidth: 1, borderTopColor: colors.tabActiveBorder, paddingVertical: 8 },
});
