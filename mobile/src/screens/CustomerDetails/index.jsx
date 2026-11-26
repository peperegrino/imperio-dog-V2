import { useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { Action, Card, date, Field, Message, money, Page, ResourceState, statusLabel, useResource } from '../../components/ConnectedUI';
import { api } from '../../services/api';
import { styles } from './styles';

export default function CustomerDetailsScreen({ navigation, route }) {
  const customerId = route.params?.customerId;
  const customers = useResource('/admin/customers');
  const pets = useResource('/admin/pets');
  const charges = useResource('/admin/charges');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const customer = Array.isArray(customers.data)
    ? customers.data.find((item) => String(item.id) === String(customerId))
    : null;
  const customerPets = (Array.isArray(pets.data) ? pets.data : [])
    .filter((pet) => String(pet.customerId) === String(customerId));
  const customerCharges = (Array.isArray(charges.data) ? charges.data : [])
    .filter((charge) => String(charge.customerId) === String(customerId));
  const loading = customers.loading || pets.loading || charges.loading;

  const [petError, setPetError] = useState('');
  const [removing, setRemoving] = useState(false);


  async function deletePet(pet) {
    if (removing) return;
    setRemoving(true);
    setPetError('');
    try {
      await api.delete('/admin/pets/' + pet.id);
      await pets.reload();
    } catch (error) {
      setPetError(error.message || 'Nao foi possivel remover o pet.');
    } finally {
      setRemoving(false);
    }
  }

  function confirmDelete(pet) {
    const message = 'Deseja remover ' + pet.name + '?';
    if (Platform.OS === 'web') {
      if (window.confirm(message)) deletePet(pet);
    } else {
      Alert.alert('Remover pet', message, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => deletePet(pet) }
      ]);
    }
  }

  function startEditing() {
    if (!customer) return;
    setDraft({ name: customer.name || '', phone: customer.phone || '' });
    setSaveError('');
    setSaveMessage('');
    setEditing(true);
  }

  async function saveCustomer() {
    if (saving) return;
    if (!draft.name.trim()) {
      setSaveError('Informe o nome do cliente.');
      return;
    }
    if (draft.name.trim().length > 40 || draft.phone.trim().length > 30) {
      setSaveError('Confira os limites de caracteres do nome e do telefone.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveMessage('');
    try {
      await api.put(`/admin/customers/${customerId}`, {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
      });
      setEditing(false);
      setSaveMessage('Cadastro atualizado.');
      await customers.reload();
    } catch (error) {
      setSaveError(error.message || 'Não foi possível atualizar o cadastro.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page title="Detalhes do cliente" navigation={navigation}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>GESTÃO DE CLIENTES</Text>
        <Text style={styles.title}>{customer?.name || 'Cliente'}</Text>
        <Text style={styles.subtitle}>Dados disponíveis no cadastro, pets e cobranças.</Text>
      </View>

      <ResourceState resource={customers} />
      <ResourceState resource={pets} />
      <ResourceState resource={charges} />

      {!loading && !customers.error && !customer ? (
        <Card><Message>Não foi possível localizar este cliente nos dados carregados.</Message></Card>
      ) : null}

      {customer ? (
        <Card>
          <Text style={styles.sectionTitle}>Dados pessoais</Text>
          {editing ? (
            <>
              <Field
                label="Nome"
                value={draft.name}
                onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
                maxLength={40}
              />
              <Field
                label="Telefone"
                value={draft.phone}
                onChangeText={(phone) => setDraft((current) => ({ ...current, phone }))}
                keyboardType="phone-pad"
                maxLength={30}
              />
              <Detail label="E-mail de acesso" value={customer.email} />
              <Detail label="CPF" value={customer.cpf || 'Não informado'} last />
              <Message>O e-mail de acesso e o CPF não podem ser alterados por este formulário.</Message>
              {saveError ? <Message>{saveError}</Message> : null}
              <Action
                title={saving ? 'Salvando...' : 'Salvar alterações'}
                onPress={saveCustomer}
                disabled={saving}
              />
              <Action
                title="Cancelar edição"
                onPress={() => {
                  setEditing(false);
                  setSaveError('');
                }}
                disabled={saving}
              />
            </>
          ) : (
            <>
              <Detail label="Nome" value={customer.name} />
              <Detail label="E-mail" value={customer.email} />
              <Detail label="Telefone" value={customer.phone || 'Não informado'} />
              <Detail label="CPF" value={customer.cpf || 'Não informado'} last />
              {saveMessage ? <Message>{saveMessage}</Message> : null}
              <Action title="Editar cadastro" onPress={startEditing} />
            </>
          )}
        </Card>
      ) : null}

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Pets</Text>
        <Text style={styles.count}>{customerPets.length}</Text>
      </View>
      {!pets.loading && !pets.error && customerPets.length === 0 ? (
        <Card><Message>Nenhum pet associado a este cliente nos dados disponíveis.</Message></Card>
      ) : null}
      {petError ? <Message>{petError}</Message> : null}
      {customerPets.map((pet) => (
        <Card key={pet.id}>
          <Text style={styles.itemTitle}>{pet.name || 'Pet sem nome'}</Text>
          <Detail label="Espécie" value={pet.species || 'Não informada'} />
          <Detail label="Raça" value={pet.breed || 'Não informada'} />
          {pet.sex ? <Detail label="Sexo" value={pet.sex} /> : null}
          {pet.birthDate ? <Detail label="Nascimento" value={date(pet.birthDate)} /> : null}
          {pet.weight != null ? <Detail label="Peso" value={`${pet.weight} kg`} /> : null}
          {pet.notes ? <Text style={styles.notes}>{pet.notes}</Text> : null}
          <Action title="Editar pet" onPress={() => navigation.navigate('NewPet', { pet })} />
          <Action title="Remover pet" disabled={removing} onPress={() => confirmDelete(pet)} />
        </Card>
      ))}

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Cobranças</Text>
        <Text style={styles.count}>{customerCharges.length}</Text>
      </View>
      {!charges.loading && !charges.error && customerCharges.length === 0 ? (
        <Card><Message>Nenhuma cobrança associada a este cliente.</Message></Card>
      ) : null}
      {customerCharges.map((charge) => (
        <Card key={charge.id}>
          <View style={styles.chargeHeader}>
            <View style={styles.chargeCopy}>
              <Text style={styles.itemTitle}>{charge.serviceName || `Cobrança #${charge.id}`}</Text>
              <Text style={styles.muted}>#{charge.id}{charge.petName ? ` · ${charge.petName}` : ''}</Text>
            </View>
            <Text style={styles.amount}>{money(charge.amount)}</Text>
          </View>
          <Detail label="Status" value={statusLabel[charge.status] || charge.status || 'Não informado'} />
          <Detail label="Vencimento" value={date(charge.dueDate)} last />
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Pagamento', { chargeId: charge.id })} style={styles.linkButton}>
            <Text style={styles.linkText}>Ver cobrança</Text>
          </Pressable>
        </Card>
      ))}

      <Action title="Voltar para clientes" onPress={() => navigation.navigate('CustomersList')} />
    </Page>
  );
}

function Detail({ label, value, last = false }) {
  return <View style={[styles.detailRow, last && styles.detailRowLast]}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || 'Não informado'}</Text></View>;
}
