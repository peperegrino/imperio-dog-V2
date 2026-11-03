import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import FontLoading from '../components/FontLoading';
import { useAuth } from '../contexts/AuthContext';
import AdminScreen from '../screens/Admin';
import ChargesScreen from '../screens/Charges';
import CustomersScreen from '../screens/Customers';
import HistoryScreen from '../screens/History';
import HomeScreen from '../screens/Home';
import LoginScreen from '../screens/Login';
import NewPetScreen from '../screens/NewPet';
import PagamentoScreen from '../screens/Pagamento/PagamentoScreen';
import PetsScreen from '../screens/Pets';
import ProfileScreen from '../screens/Profile';
import SignupScreen from '../screens/Signup';
import ServicesScreen from '../screens/Services';
import { setUnauthorizedHandler } from '../services/api';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: 'login',
      Signup: 'cadastro',
      Home: 'home',
      Admin: 'admin',
      Profile: 'perfil',
      Customers: 'customers',
      Pets: 'pets',
      NewPet: 'novo-pet',
      Services: 'services',
      Charges: 'charges',
      History: 'historico',
      Pagamento: 'pagamento',
    },
  },
};

function PagamentoRoute({ navigation, route }) {
  const homeRoute = route.params?.homeRoute || 'Home';

  return (
    <PagamentoScreen
      onBack={() => navigation.goBack()}
      onBackToDetails={() => navigation.goBack()}
      onNavigate={(target) => navigation.navigate(target, { homeRoute })}
      onProfilePress={() => navigation.navigate('Profile', { homeRoute })}
      homeRoute={homeRoute}
    />
  );
}

function AdminRoute({ navigation }) {
  const { session } = useAuth();

  useEffect(() => {
    if (session?.role !== 'ADMIN') {
      navigation.replace(session ? 'Home' : 'Login');
    }
  }, [navigation, session]);

  return session?.role === 'ADMIN' ? <AdminScreen navigation={navigation} /> : null;
}

export default function Navigation() {
  const { session, isLoading, initializationError, signOut } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await signOut();
      if (navigationRef.isReady()) {
        navigationRef.resetRoot({ index: 0, routes: [{ name: 'Login' }] });
      }
    });

    return () => setUnauthorizedHandler(undefined);
  }, [signOut]);

  if (isLoading) {
    return <FontLoading />;
  }

  if (initializationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Não foi possível restaurar sua sessão: {initializationError.message}
        </Text>
      </View>
    );
  }

  function handleNavigationReady() {
    const currentRoute = navigationRef.getCurrentRoute()?.name;
    if (!session && !['Login', 'Signup'].includes(currentRoute)) {
      navigationRef.resetRoot({ index: 0, routes: [{ name: 'Login' }] });
    } else if (
      session &&
      ['Login', 'Signup', 'Home', 'Admin'].includes(currentRoute) &&
      currentRoute !== (session.role === 'ADMIN' ? 'Admin' : 'Home')
    ) {
      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: session.role === 'ADMIN' ? 'Admin' : 'Home' }],
      });
    }
  }

  return (
    <View style={styles.viewport}>
      <View style={styles.appContent}>
        <NavigationContainer
          ref={navigationRef}
          linking={linking}
          onReady={handleNavigationReady}
        >
          <Stack.Navigator
            initialRouteName={session?.role === 'ADMIN' ? 'Admin' : session ? 'Home' : 'Login'}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Admin" component={AdminRoute} />
            <Stack.Screen name="Customers" component={CustomersScreen} />
            <Stack.Screen name="Pets" component={PetsScreen} />
            <Stack.Screen name="NewPet" component={NewPetScreen} />
            <Stack.Screen name="Services" component={ServicesScreen} />
            <Stack.Screen name="Charges" component={ChargesScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Pagamento" component={PagamentoRoute} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#EEECE8' : colors.background,
  },
  appContent: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textDark,
    textAlign: 'center',
  },
});
