import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import FontLoading from "../components/FontLoading";
import LoginScreen from "../screens/Login";
import { useAuth } from "../contexts/AuthContext";
import {
  Dashboard,
  CustomerForm,
  Pets,
  NewPet,
  Services,
  Management,
  ChargeList,
  Profile,
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
      Pets: "pets",
      NewPet: "novo-pet",
      Services: "services",
      Charges: "charges",
      History: "historico",
      Pagamento: "pagamento",
    },
  },
};

function SignupRoute(props) {
  return <CustomerForm {...props} signup />;
}
function HistoryRoute(props) {
  return <ChargeList {...props} history />;
}
export default function Navigation() {
  const { session, isLoading, initializationError, signOut } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await signOut();
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
    if (!session && !["Login", "Signup"].includes(currentRoute)) {
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
      <View style={styles.appContent}>
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
            {!session ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupRoute} />
              </>
            ) : (
              <>
                <Stack.Screen
                  name={session.role === "ADMIN" ? "Admin" : "Home"}
                  component={Dashboard}
                />
                {session.role === "ADMIN" && (
                  <>
                    <Stack.Screen name="Customers" component={CustomerForm} />
                    <Stack.Screen name="Services" component={Services} />
                  </>
                )}
                <Stack.Screen name="Pets" component={Pets} />
                <Stack.Screen name="NewPet" component={NewPet} />
                <Stack.Screen
                  name="Charges"
                  component={session.role === "ADMIN" ? Management : ChargeList}
                />
                <Stack.Screen name="History" component={HistoryRoute} />
                <Stack.Screen name="Profile" component={Profile} />
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
