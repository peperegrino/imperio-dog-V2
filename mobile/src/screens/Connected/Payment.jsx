import { useState } from "react";
import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import PagamentoScreen from "../Pagamento/PagamentoScreen";
import { useAuth } from "../../contexts/AuthContext";
import { showAlert } from "../../utils/alert";
import { api } from "../../services/api";
import {
  Page,
  Action,
  Message,
  Card,
  ResourceState,
  useResource,
  money,
  date,
  statusLabel,
} from "../../components/ConnectedUI";

export default function Payment({ navigation, route }) {
  const { session } = useAuth();
  const homeRoute = session.role === "ADMIN" ? "Admin" : "Home";
  const chargesRoute = session.role === "ADMIN" ? "CustomerCharges" : "Charges";
  const id = route.params?.chargeId;
  const hasChargeId = /^[1-9]\d*$/.test(String(id ?? ""));
  const resource = useResource(hasChargeId ? `/charges/${id}` : null);
  const backToCharges = () => navigation.navigate(chargesRoute, { homeRoute });
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const c = resource.data;
  async function pdf() {
    setBusy(true);
    setMessage("");
    try {
      const blob = await api.get(`/charges/${id}/boleto`, {
        responseType: "blob",
      });
      if (Platform.OS === "web") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `boleto-${id}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      } else {
        const file = new File(Paths.cache, `boleto-${id}.pdf`);
        file.write(new Uint8Array(await blob.arrayBuffer()));
        if (await Sharing.isAvailableAsync())
          await Sharing.shareAsync(file.uri, { mimeType: "application/pdf" });
        else
          throw Error(
            "Compartilhamento de PDF indisponível neste dispositivo.",
          );
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!c) {
    return (
      <Page title="Detalhes da cobrança" navigation={navigation}>
        <ResourceState resource={resource} />
        {!hasChargeId && <Message>Selecione uma cobrança na lista para ver seus detalhes.</Message>}
        <Action title="Voltar às cobranças" onPress={backToCharges} />
        <Message>{message}</Message>
      </Page>
    );
  }

  if (c.issuanceState === "SIMULATED") {
    return (
      <Page title="Boleto demonstrativo" navigation={navigation}>
        <Card>
          <Message>Simulação sem validade para pagamento.</Message>
          <Message>Tutor: {c.customerName}</Message>
          <Message>Pet: {c.petName}</Message>
          {c.items?.map((item) => (
            <Message key={item.serviceId}>{item.quantity} × {item.name}</Message>
          ))}
          <Message>Vencimento previsto: {date(c.dueDate)}</Message>
          <Message>Valor demonstrativo: {money(c.amount)}</Message>
        </Card>
        <Action title="Voltar às cobranças" onPress={backToCharges} />
      </Page>
    );
  }

  if (c.issuanceState !== "ISSUED") {
    return (
      <Page title="Detalhes da cobrança" navigation={navigation}>
        <Card>
          <Message>Boleto não confirmado</Message>
          <Message>Não há confirmação de emissão deste boleto. Nenhuma instrução de pagamento foi exibida.</Message>
          <Message>Tutor: {c.customerName || "—"}</Message>
          <Message>Pet: {c.petName || "—"}</Message>
          <Message>Status: {statusLabel[c.status] || c.status || "—"}</Message>
          <Message>Vencimento: {date(c.dueDate)}</Message>
          <Message>Valor: {money(c.amount)}</Message>
        </Card>
        <Action title="Voltar às cobranças" onPress={backToCharges} />
      </Page>
    );
  }

  return (
    <PagamentoScreen
      data={{
        ...c,
        status: statusLabel[c.status] || c.status,
        dueLabel: "Vencimento: " + date(c.dueDate),
        amount: money(c.amount),
        details: [
          ["Serviço:", c.serviceName],
          ["Tutor:", c.customerName],
          ["Pet:", c.petName],
          ["Data do serviço:", date(c.serviceDate)],
          ["Vencimento:", date(c.dueDate)],
          ...(c.paymentDate ? [["Pagamento:", date(c.paymentDate)]] : []),
        ],
      }}
      homeRoute={homeRoute}
      downloadBusy={busy}
      message={message}
      onCopy={async (value) => {
        try {
          await Clipboard.setStringAsync(value.replace(/\D/g, ""));
          showAlert("Código copiado", "");
        } catch (error) {
          showAlert("Não foi possível copiar", error.message);
        }
      }}
      onBack={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate(chargesRoute, { homeRoute })}
      onProfilePress={() => navigation.navigate("Profile")}
      onNavigate={(routeName) => navigation.navigate(routeName)}
      onViewFullBoleto={pdf}
      onBackToCharges={backToCharges}
    />
  );
}
