import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChargesScreen from '../screens/Charges';
import CustomersScreen from '../screens/Customers';
import HomeScreen from '../screens/Home';
import LoginScreen from '../screens/Login';
import PagamentoScreen from '../screens/Pagamento/PagamentoScreen';
import PetsScreen from '../screens/Pets';
import ServicesScreen from '../screens/Services';

const Stack = createNativeStackNavigator();

function PagamentoRoute({ navigation }) {
  return (
    <PagamentoScreen
      onBack={() => navigation.goBack()}
      onBackToDetails={() => navigation.goBack()}
    />
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Customers" component={CustomersScreen} />
        <Stack.Screen name="Pets" component={PetsScreen} />
        <Stack.Screen name="Services" component={ServicesScreen} />
        <Stack.Screen name="Charges" component={ChargesScreen} />
        <Stack.Screen name="Pagamento" component={PagamentoRoute} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
