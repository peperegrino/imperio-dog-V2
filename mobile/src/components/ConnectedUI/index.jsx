import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppNavigation from "../AppNavigation";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";

export const money = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
export const date = (value) =>
  value ? value.slice(0, 10).split("-").reverse().join("/") : "Não informado";
export const statusLabel = {
  PENDING: "Pendente",
  PAYMENT_IN_PROCESS: "Em processamento",
  PAID: "Pago",
  OVERDUE: "Vencido",
  CANCELED: "Cancelado",
};
export function useResource(path) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api.get(path));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path]);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );
  return { data, error, loading, reload };
}
export function Action({ title, onPress, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[s.button, disabled && { opacity: 0.5 }]}
    >
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
}
export function Field({
  label,
  value,
  onChangeText,
  secret = false,
  ...props
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={String(value ?? "")}
        onChangeText={onChangeText}
        secureTextEntry={secret}
        style={s.input}
        {...props}
      />
    </View>
  );
}
export function Card({ children }) {
  return <View style={s.card}>{children}</View>;
}
export function Message({ children }) {
  return (
    <Text accessibilityLiveRegion="polite" style={s.message}>
      {children}
    </Text>
  );
}
export function ResourceState({ resource }) {
  return resource.loading ? (
    <ActivityIndicator color="#722F37" />
  ) : resource.error ? (
    <>
      <Message>{resource.error}</Message>
      <Action title="Tentar novamente" onPress={resource.reload} />
    </>
  ) : null;
}
export function Choose({ label, items, value, onChange }) {
  return (
    <Card>
      <Text style={s.label}>{label}</Text>
      {items.length ? (
        items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected: value === item.id }}
            onPress={() => onChange(item.id)}
            style={s.option}
          >
            <Text
              style={{
                color: value === item.id ? "#722F37" : "#333",
                fontWeight: value === item.id ? "700" : "400",
              }}
            >
              {value === item.id ? "● " : "○ "}
              {item.name}
            </Text>
          </Pressable>
        ))
      ) : (
        <Message>Nenhum cadastro disponível.</Message>
      )}
    </Card>
  );
}
export function Page({ title, navigation, children }) {
  const { session } = useAuth();
  const homeRoute = session?.role === "ADMIN" ? "Admin" : "Home";
  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigation.canGoBack()
              ? navigation.goBack()
              : navigation.navigate(session ? homeRoute : 'Login')
          }
        >
          <Text style={s.label}>‹ Voltar</Text>
        </Pressable>
        <Text style={s.title}>{title}</Text>
        {session && <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Profile", { homeRoute })}><Text style={s.label}>Perfil</Text></Pressable>}
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
      >
        {children}
      </ScrollView>
      {session && (
        <AppNavigation homeRoute={homeRoute} navigation={navigation} />
      )}
    </SafeAreaView>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8F5F0" },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#722F37" },
  content: { padding: 20, gap: 16, paddingBottom: 150 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E8DED2",
  },
  label: { color: "#722F37", fontWeight: "600", fontSize: 14 },
  field: { gap: 6, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#D9C2A6",
    padding: 13,
    borderRadius: 10,
    color: "#332522",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#722F37",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 4,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  message: { color: "#694B42", lineHeight: 22 },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
