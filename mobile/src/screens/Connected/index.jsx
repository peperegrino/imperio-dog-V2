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
