import { useState } from "react";
import { Platform, Text } from "react-native";
import * as Clipboard from "expo-clipboard";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { api } from "../../services/api";
import {
  Page,
  Card,
  Action,
  Message,
  ResourceState,
  useResource,
  money,
  date,
  statusLabel,
  s,
} from "../../components/ConnectedUI";

export default function Payment({ navigation, route }) {
  const id = route.params?.chargeId;
  const resource = useResource(`/charges/${id}`);
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
  return (
    <Page title="Detalhes da cobrança" navigation={navigation}>
      <ResourceState resource={resource} />
      {c && (
        <Card>
          <Text style={s.title}>
            #{c.id} · {statusLabel[c.status]}
          </Text>
          <Text style={s.title}>{money(c.amount)}</Text>
          <Text>Serviço: {c.serviceName}</Text>
          <Text>Tutor: {c.customerName}</Text>
          <Text>Pet: {c.petName}</Text>
          <Text>Serviço realizado: {date(c.serviceDate)}</Text>
          <Text>Vencimento: {date(c.dueDate)}</Text>
          {c.paymentDate && <Text>Pagamento: {date(c.paymentDate)}</Text>}
          {!c.ticketUrl && (
            <Message>
              Boleto indisponível. A emissão pode precisar de conciliação pela
              equipe.
            </Message>
          )}
          {c.digitableLine && (
            <>
              <Text selectable>{c.digitableLine}</Text>
              <Action
                title="Copiar linha digitável"
                onPress={async () => {
                  try {
                    await Clipboard.setStringAsync(
                      c.digitableLine.replace(/\D/g, ""),
                    );
                    setMessage("Linha digitável copiada.");
                  } catch (e) {
                    setMessage(e.message);
                  }
                }}
              />
            </>
          )}
          {c.barcode && <Text selectable>Código: {c.barcode}</Text>}
          <Action
            title={busy ? "Baixando…" : "Baixar boleto PDF"}
            onPress={pdf}
            disabled={busy || !c.ticketUrl}
          />
          <Action title="Atualizar status" onPress={resource.reload} />
          <Message>{message}</Message>
        </Card>
      )}
    </Page>
  );
}
