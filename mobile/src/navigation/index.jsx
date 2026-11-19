import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import FontLoading from "../components/FontLoading";
import AdminScreen from "../screens/Admin";
import HomeScreen from "../screens/Home";
import HistoryScreen from "../screens/History";
import PetsScreen from "../screens/Pets";
import ProfileScreen from "../screens/Profile";
import NewPetScreen from "../screens/NewPet";
import SignupScreen from "../screens/Signup";
import CustomersScreen from "../screens/Customers";
import CustomersListScreen from "../screens/CustomerList";
import CustomerChargesScreen from "../screens/CustomerCharges/index.jsx";
import CustomerDetailsScreen from "../screens/CustomerDetails";
import ServicesScreen from "../screens/Services";
import LoginScreen from "../screens/Login";
import SessionExpiredScreen from "../screens/SessionExpired";
import { useAuth } from "../contexts/AuthContext";
import {
  Management,
  ChargeList,
} from "../screens/Connected";
import Payment from "../screens/Connected/Payment";
import { setUnauthorizedHandler } from "../services/api";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: "login",
      Signup: "cadastro",
      Home: "home",
      Admin: "admin",
      Profile: "perfil",
      Customers: "customers",
      CustomersList: "customers/list",
      CustomerDetails: "customers/:customerId",
      CustomerCharges: "admin/charges",
      Pets: "pets",
      NewPet: "novo-pet",
      Services: "services",
      Charges: "charges",
      History: "historico",
      Pagamento: "pagamento",
    },
  },
};

export default function Navigation() {
  const { session, isLoading, initializationError, signOut } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await signOut();
      if (navigationRef.isReady()) {
        navigationRef.resetRoot({ index: 0, routes: [{ name: "SessionExpired" }] });
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
    if (!session && !["Login", "Signup", "SessionExpired"].includes(currentRoute)) {
      navigationRef.resetRoot({ index: 0, routes: [{ name: "Login" }] });
    } else if (
      session &&
      ["Login", "Signup", "Home", "Admin"].includes(currentRoute) &&
      currentRoute !== (session.role === "ADMIN" ? "Admin" : "Home")
    ) {
      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: session.role === "ADMIN" ? "Admin" : "Home" }],
      });
    }
  }

  return (
    <View style={styles.viewport}>
      <View style={[styles.appContent, !session && styles.authContent]}>
        <NavigationContainer
          ref={navigationRef}
          linking={linking}
          onReady={handleNavigationReady}
        >
          <Stack.Navigator
            initialRouteName={
              session?.role === "ADMIN" ? "Admin" : session ? "Home" : "Login"
            }
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="SessionExpired" component={SessionExpiredScreen} />
            {!session ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
              </>
            ) : (
              <>
                <Stack.Screen
                  name={session.role === "ADMIN" ? "Admin" : "Home"}
                  component={session.role === "ADMIN" ? AdminScreen : HomeScreen}
                />
                {session.role === "ADMIN" && (
                  <>
                    <Stack.Screen name="Customers" component={CustomersScreen} />
                    <Stack.Screen name="CustomersList" component={CustomersListScreen} />
                    <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
                    <Stack.Screen name="CustomerCharges" component={CustomerChargesScreen} />
                    <Stack.Screen name="Services" component={ServicesScreen} />
                  </>
                )}
                <Stack.Screen name="Pets" component={PetsScreen} />
                <Stack.Screen name="NewPet" component={NewPetScreen} />
                <Stack.Screen
                  name="Charges"
                  component={session.role === "ADMIN" ? Management : ChargeList}
                />
                <Stack.Screen name="History" component={HistoryScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Pagamento" component={Payment} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? "#EEECE8" : colors.background,
  },
  appContent: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 480 : undefined,
    alignSelf: "center",
    backgroundColor: colors.background,
  },
  authContent: { maxWidth: Platform.OS === "web" ? 390 : undefined },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textDark,
    textAlign: "center",
  },
});
