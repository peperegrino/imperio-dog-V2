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
