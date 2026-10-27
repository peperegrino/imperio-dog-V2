import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminScreen from '../screens/Admin';
import ChargesScreen from '../screens/Charges';
import CustomersScreen from '../screens/Customers';
import HistoryScreen from '../screens/History';
import HomeScreen from '../screens/Home';
import LoginScreen from '../screens/Login';
import PagamentoScreen from '../screens/Pagamento/PagamentoScreen';
import PetsScreen from '../screens/Pets';
import ProfileScreen from '../screens/Profile';
import ServicesScreen from '../screens/Services';

const Stack = createNativeStackNavigator();

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

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="Customers" component={CustomersScreen} />
        <Stack.Screen name="Pets" component={PetsScreen} />
        <Stack.Screen name="Services" component={ServicesScreen} />
        <Stack.Screen name="Charges" component={ChargesScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Pagamento" component={PagamentoRoute} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
