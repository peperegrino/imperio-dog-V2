import { useRef, useState } from "react";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import {
  Page,
  Card,
  Field,
  Action,
  Choose,
  Message,
  ResourceState,
  useResource,
  money,
  date,
  statusLabel,
  s,
} from "../../components/ConnectedUI";

const customerFields = [
  ["name", "Nome completo"],
  ["email", "E-mail"],
  ["password", "Senha (12 a 72 caracteres)"],
  ["phone", "Telefone"],
  ["cpf", "CPF"],
  ["zipCode", "CEP"],
  ["streetName", "Rua"],
  ["streetNumber", "Número"],
  ["neighborhood", "Bairro"],
  ["city", "Cidade"],
  ["federalUnit", "UF"],
];
function Fields({ fields, values, setValues }) {
  return fields.map(([key, label]) => (
    <Field
      key={key}
      label={label}
      value={values[key]}
      onChangeText={(value) => setValues((v) => ({ ...v, [key]: value }))}
      secret={key === "password"}
      autoCapitalize={
        ["email", "password"].includes(key) ? "none" : "sentences"
      }
    />
  ));
}
function useSubmit() {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false);
  return {
    busy,
    message,
    setMessage,
    async run(work) {
      if (lock.current) return;
      lock.current = true;
      setBusy(true);
      setMessage("");
      try {
        await work();
      } catch (e) {
        setMessage(e.message);
      } finally {
        lock.current = false;
        setBusy(false);
      }
    },
  };
}

export function CustomerForm({ navigation, signup = false }) {
  const [values, setValues] = useState({}),
    submit = useSubmit();
  const save = () =>
    submit.run(async () => {
      if (!signup && values.petName?.trim()) {
        await api.post('/admin/customers/with-pet', {customer:values,pet:{name:values.petName,species:'Cachorro',breed:values.petBreed||''}});
      } else await api.post(signup ? "/auth/register" : "/admin/customers", values);
      if (signup) navigation.reset({index:0,routes:[{name:'Login',params:{registrationComplete:true}}]});
      else {
        setValues({});
        submit.setMessage(
          "Cadastro salvo. Consulte os pets ou cadastre outro tutor.",
        );
      }
    });
  return (
    <Page
      title={signup ? "Criar conta" : "Cadastrar cliente"}
      navigation={navigation}
    >
      <Card>
        <Fields fields={customerFields} values={values} setValues={setValues} />
        {!signup && <Fields fields={ [['petName','Nome do pet (opcional)'],['petBreed','Raça do pet']] } values={values} setValues={setValues}/>}
        <Message>
          Os dados de endereço e CPF são necessários para emissão de boletos. A
          conta criada é de tutor.
        </Message>
        <Action
          title={submit.busy ? "Salvando…" : "Cadastrar"}
          onPress={save}
          disabled={submit.busy}
        />
        <Message>{submit.message}</Message>
      </Card>
      {!signup && (
        <Action
          title="Ver clientes e cadastrar pet"
          onPress={() => navigation.navigate("NewPet")}
        />
      )}
    </Page>
  );
}

export function Pets({ navigation }) {
  const { session } = useAuth();
  const admin = session?.role === "ADMIN";
  const resource = useResource(admin ? "/admin/pets" : "/account/pets");
  return (
    <Page title="Pets cadastrados" navigation={navigation}>
      <ResourceState resource={resource} />
      {!resource.loading && !resource.error && !resource.data?.length && (
        <Message>Nenhum pet cadastrado.</Message>
      )}
      {resource.data?.map((p) => (
        <Card key={p.id}>
          <Text style={s.title}>{p.name}</Text>
          <Text>
            {p.species} · {p.breed}
          </Text>
          <Text>
            {p.sex || ""} {p.weight ? `· ${p.weight} kg` : ""}
          </Text>
          <Text>Nascimento: {date(p.birthDate)}</Text>
          <Text>{p.notes}</Text>
        </Card>
      ))}
      <Action
        title="Cadastrar pet"
        onPress={() => navigation.navigate("NewPet")}
      />
    </Page>
  );
}
export function NewPet({ navigation }) {
  const { session } = useAuth();
  const admin = session?.role === "ADMIN";
  const customers = useResource(admin ? "/admin/customers" : "/account/me");
  const [values, setValues] = useState({ species: "Cachorro" }),
    [customerId, setCustomerId] = useState(null);
  const submit = useSubmit();
  return (
    <Page title="Novo pet" navigation={navigation}>
      {admin && (
        <>
          <ResourceState resource={customers} />
          <Choose
            label="Tutor responsável"
            items={customers.data || []}
            value={customerId}
            onChange={setCustomerId}
          />
        </>
      )}
      <Card>
        <Fields
          fields={[
            ["name", "Nome do pet"],
            ["species", "Espécie"],
            ["breed", "Raça"],
            ["sex", "Sexo"],
            ["birthDate", "Nascimento (AAAA-MM-DD)"],
            ["weight", "Peso em kg"],
            ["notes", "Observações"],
          ]}
          values={values}
          setValues={setValues}
        />
        <Action
          title={submit.busy ? "Salvando…" : "Salvar pet"}
          disabled={submit.busy}
          onPress={() =>
            submit.run(async () => {
              if (admin && !customerId) throw Error("Selecione o tutor.");
              await api.post(admin ? "/admin/pets" : "/account/pets", {
                ...values,
                customerId,
                birthDate: values.birthDate || null,
                weight: values.weight
                  ? Number(values.weight.replace(",", "."))
                  : null,
              });
              navigation.replace("Pets");
            })
          }
        />
        <Message>{submit.message}</Message>
      </Card>
    </Page>
  );
}
export function Services({ navigation }) {
  const resource = useResource("/admin/services"),
    [values, setValues] = useState({}),
    [editing, setEditing] = useState(null);
  const submit = useSubmit();
  return (
    <Page title="Serviços e preços" navigation={navigation}>
      <ResourceState resource={resource} />
      <Message>
        Cadastre cada modalidade ou porte como um serviço com seu preço.
      </Message>
      {resource.data?.map((service) => (
        <Card key={service.id}>
          <Text style={s.title}>{service.name}</Text>
          <Text>{service.description}</Text>
          <Text>{money(service.price)}</Text>
          <Action
            title="Editar"
            onPress={() => {
              setEditing(service.id);
              setValues({ ...service, price: String(service.price) });
            }}
          />
          <Action
            title="Excluir"
            disabled={submit.busy}
            onPress={() =>
              submit.run(async () => {
                await api.delete(`/admin/services/${service.id}`);
                await resource.reload();
              })
            }
          />
        </Card>
      ))}
      <Card>
        <Text style={s.title}>
          {editing ? "Editar serviço" : "Novo serviço"}
        </Text>
        <Fields
          fields={[
            ["name", "Nome"],
            ["description", "Descrição"],
            ["price", "Preço em reais"],
          ]}
          values={values}
          setValues={setValues}
        />
        <Action
          title="Salvar serviço"
          disabled={submit.busy}
          onPress={() =>
            submit.run(async () => {
              const payload = {
                ...values,
                price: Number(String(values.price || "").replace(",", ".")),
              };
              if (editing) await api.put(`/admin/services/${editing}`, payload);
              else await api.post("/admin/services", payload);
              setValues({});
              setEditing(null);
              await resource.reload();
            })
          }
        />
        {editing && (
          <Action
            title="Cancelar edição"
            onPress={() => {
              setEditing(null);
              setValues({});
            }}
          />
        )}
        <Message>{submit.message}</Message>
      </Card>
    </Page>
  );
}
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const ATTEMPT = "@imperio-dog/charge-attempt";
export function Management({ navigation }) {
  const account = useResource("/account/me");
  const attemptKey = `${ATTEMPT}:${account.data?.id}`;
  const customers = useResource("/admin/customers"),
    pets = useResource("/admin/pets"),
    services = useResource("/admin/services");
  const [customerId, setCustomerId] = useState(null),
    [petId, setPetId] = useState(null),
    [quantities, setQuantities] = useState({}),
    [serviceDate, setServiceDate] = useState(today()),
    [dueDate, setDueDate] = useState(today()),
    [reconcileId, setReconcileId] = useState(""),
    [bankSlipId, setBankSlipId] = useState("");
  const submit = useSubmit();
  const total = (services.data || []).reduce(
    (sum, item) => sum + Number(item.price) * Number(quantities[item.id] || 0),
    0,
  );
  return (
    <Page title="Nova cobrança" navigation={navigation}>
      {[customers, pets, services].map((r, i) => (
        <ResourceState key={i} resource={r} />
      ))}
      <Choose
        label="Cliente"
        items={customers.data || []}
        value={customerId}
        onChange={(id) => {
          setCustomerId(id);
          setPetId(null);
        }}
      />
      <Choose
        label="Pet"
        items={(pets.data || []).filter((p) => p.customerId === customerId)}
        value={petId}
        onChange={setPetId}
      />
      <Card>
        <Text style={s.title}>Serviços</Text>
        {services.data?.map((item) => (
          <Field
            key={item.id}
            label={`${item.name} · ${money(item.price)} · quantidade`}
            keyboardType="number-pad"
            value={quantities[item.id] || ""}
            onChangeText={(q) => setQuantities((v) => ({ ...v, [item.id]: q }))}
          />
        ))}
        <Field
          label="Data do serviço (AAAA-MM-DD)"
          value={serviceDate}
          onChangeText={setServiceDate}
        />
        <Field
          label="Vencimento (AAAA-MM-DD)"
          value={dueDate}
          onChangeText={setDueDate}
        />
        <Text style={s.title}>Total: {money(total)}</Text>
        <Action
          title={submit.busy ? "Emitindo…" : "Emitir boleto"}
          disabled={submit.busy}
          onPress={() =>
            submit.run(async () => {
              if (Object.values(quantities).some(value => value !== '' && (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 100))) {
                throw Error('Informe quantidades inteiras entre 0 e 100; zero remove o serviço.');
              }
              const items = (services.data || [])
                .filter((i) => Number(quantities[i.id]) > 0)
                .map((i) => ({
                  serviceId: i.id,
                  quantity: Number(quantities[i.id]),
                }));
              if (!account.data)
                throw Error("Aguarde o carregamento da conta.");
              if (
                items.some(
                  (item) =>
                    !Number.isInteger(item.quantity) || item.quantity > 100,
                )
              )
                throw Error("Informe quantidades inteiras entre 1 e 100.");
              if (!customerId || !petId || !items.length)
                throw Error("Selecione cliente, pet e serviços.");
              const payload = {
                customerId,
                petId,
                items,
                serviceDate,
                dueDate,
              };
              let attempt = JSON.parse(
                (await AsyncStorage.getItem(attemptKey)) || "null",
              );
              if (
                attempt &&
                JSON.stringify(attempt.payload) !== JSON.stringify(payload)
              )
                throw Error(
                  "Existe uma emissão pendente. Recupere a tentativa anterior ou confira o histórico antes de iniciar outra.",
                );
              if (!attempt) {
                attempt = {
                  key: `charge-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
                  payload,
                };
                await AsyncStorage.setItem(attemptKey, JSON.stringify(attempt));
              }
              try {
                const charge = await api.post("/admin/charges", payload, {
                  headers: { "Idempotency-Key": attempt.key },
                });
                await AsyncStorage.removeItem(attemptKey);
                navigation.navigate("Pagamento", { chargeId: charge.id });
              } catch (error) {
                if ([400, 404, 422].includes(error.status))
                  await AsyncStorage.removeItem(attemptKey);
                else {
                  const id = error.message.match(/charge=(\d+)/)?.[1];
                  if (id)
                    await AsyncStorage.setItem(
                      attemptKey,
                      JSON.stringify({ ...attempt, chargeId: Number(id) }),
                    );
                }
                throw error;
              }
            })
          }
        />
        <Action
          title="Recuperar formulário da tentativa pendente"
          onPress={() =>
            submit.run(async () => {
              const attempt = JSON.parse(
                (await AsyncStorage.getItem(attemptKey)) || "null",
              );
              if (!attempt) throw Error("Nenhuma tentativa pendente.");
              const p = attempt.payload;
              setCustomerId(p.customerId);
              setPetId(p.petId);
              setServiceDate(p.serviceDate);
              setDueDate(p.dueDate);
              setQuantities(
                Object.fromEntries(
                  p.items.map((i) => [i.serviceId, String(i.quantity)]),
                ),
              );
            })
          }
        />
        <Message>{submit.message}</Message>
      </Card>
      <Card>
        <Text style={s.title}>Conciliar emissão existente</Text>
        <Message>
          Use o ID da cobrança no histórico e o ID do boleto confirmado no
          banco. Esta ação não emite outro boleto.
        </Message>
        <Field
          label="ID da cobrança"
          value={reconcileId}
          onChangeText={setReconcileId}
        />
        <Field
          label="ID do boleto C6"
          value={bankSlipId}
          onChangeText={setBankSlipId}
        />
        <Action
          title="Conciliar"
          disabled={submit.busy}
          onPress={() =>
            submit.run(async () => {
              const charge = await api.post(
                `/admin/charges/${Number(reconcileId)}/reconcile?bankSlipId=${encodeURIComponent(bankSlipId)}`,
                {},
              );
              const pending = JSON.parse(
                (await AsyncStorage.getItem(attemptKey)) || "null",
              );
              if (pending?.chargeId === charge.id)
                await AsyncStorage.removeItem(attemptKey);
              navigation.navigate("Pagamento", { chargeId: charge.id });
            })
          }
        />
        <Action
          title="Ver histórico de cobranças"
          onPress={() => navigation.navigate("History")}
        />
      </Card>
    </Page>
  );
}

export function ChargeList({ navigation, history = false }) {
  const { session } = useAuth();
  const admin = session?.role === "ADMIN";
  const resource = useResource(
    admin ? "/admin/charges" : "/charges/my-charges",
  );
  const [filter, setFilter] = useState("ALL");
  return (
    <Page title={history ? "Histórico" : "Cobranças"} navigation={navigation}>
      <ResourceState resource={resource} />
      <Choose
        label="Filtrar"
        items={[
          { id: "ALL", name: "Todas" },
          ...Object.entries(statusLabel).map(([id, name]) => ({ id, name })),
        ]}
        value={filter}
        onChange={setFilter}
      />
      {resource.data
        ?.filter((c) => filter === "ALL" || c.status === filter)
        .map((c) => (
          <Card key={c.id}>
            <Text style={s.title}>
              #{c.id} · {c.serviceName}
            </Text>
            <Text>
              {c.customerName} · {c.petName}
            </Text>
            <Text>
              {statusLabel[c.status]} · {money(c.amount)}
            </Text>
            <Text>Vencimento: {date(c.dueDate)}</Text>
            {c.paymentDate && <Text>Pagamento: {date(c.paymentDate)}</Text>}
            {c.issuanceState && c.issuanceState !== "ISSUED" && (
              <Message>
                {c.issuanceState === "UNKNOWN"
                  ? "Emissão requer conciliação"
                  : "Emissão em andamento ou requer conferência"}{" "}
                · Referência: {c.externalReferenceId}
              </Message>
            )}
            <Action
              title="Ver detalhes"
              onPress={() =>
                navigation.navigate("Pagamento", { chargeId: c.id })
              }
            />
          </Card>
        ))}
      {!resource.loading && !resource.error && !resource.data?.length && (
        <Message>Nenhuma cobrança cadastrada.</Message>
      )}
      {admin && (
        <Action
          title="Nova cobrança"
          onPress={() => navigation.navigate("Charges")}
        />
      )}
    </Page>
  );
}
export function Dashboard({ navigation }) {
  const { session, signOut } = useAuth();
  const admin = session?.role === "ADMIN";
  const charges = useResource(admin ? "/admin/charges" : "/charges/my-charges"),
    profile = useResource("/account/me");
  return (
    <Page
      title={admin ? "Painel da equipe" : "Painel do tutor"}
      navigation={navigation}
    >
      <ResourceState resource={charges} />
      <ResourceState resource={profile} />
      <Text style={s.title}>Olá, {profile.data?.name || ""}</Text>
      {Object.entries(statusLabel).map(([status, label]) => {
        const items = (charges.data || []).filter((c) => c.status === status);
        return (
          <Card key={status}>
            <Text>
              {label} · {items.length} cobranças
            </Text>
            <Text style={s.title}>
              {money(items.reduce((sum, c) => sum + Number(c.amount), 0))}
            </Text>
          </Card>
        );
      })}
      <Action
        title="Cobranças"
        onPress={() => navigation.navigate("Charges")}
      />
      <Action
        title="Histórico"
        onPress={() => navigation.navigate("History")}
      />
      <Action title="Meus pets" onPress={() => navigation.navigate("Pets")} />
      {admin && (
        <>
          <Action
            title="Cadastrar cliente"
            onPress={() => navigation.navigate("Customers")}
          />
          <Action
            title="Serviços e preços"
            onPress={() => navigation.navigate("Services")}
          />
        </>
      )}
      <Action title="Sair" onPress={signOut} />
    </Page>
  );
}
export function Profile({ navigation }) {
  const resource = useResource("/account/me");
  const [values, setValues] = useState(null);
  const submit = useSubmit();
  return (
    <Page title="Meu perfil" navigation={navigation}>
      <ResourceState resource={resource} />
      {resource.data && (
        <Card>
          <Text style={s.title}>{resource.data.name}</Text>
          <Text>{resource.data.email}</Text>
          <Text>CPF: {resource.data.cpf}</Text>
          <Field
            label="Nome"
            value={values?.name ?? resource.data.name}
            onChangeText={(name) =>
              setValues((v) => ({ ...resource.data, ...v, name }))
            }
          />
          <Field
            label="Telefone"
            value={values?.phone ?? resource.data.phone}
            onChangeText={(phone) =>
              setValues((v) => ({ ...resource.data, ...v, phone }))
            }
          />
          <Action
            title="Salvar perfil"
            disabled={submit.busy}
            onPress={() =>
              submit.run(async () => {
                await api.put("/account/me", values || resource.data);
                await resource.reload();
                submit.setMessage("Perfil atualizado.");
              })
            }
          />
          <Message>{submit.message}</Message>
        </Card>
      )}
    </Page>
  );
}
