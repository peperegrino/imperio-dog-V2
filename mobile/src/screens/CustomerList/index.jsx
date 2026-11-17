import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  Action,
  Card,
  Message,
  Page,
  ResourceState,
  useResource,
} from '../../components/ConnectedUI';
import { styles } from './styles';

export default function CustomersListScreen({ navigation }) {
  const resource = useResource('/admin/customers');
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const customers = Array.isArray(resource.data) ? resource.data : [];

  return (
    <Page title="Clientes cadastrados" navigation={navigation}>
      <View style={styles.heading}>
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.description}>
          Consulte os clientes cadastrados no sistema.
        </Text>
      </View>

      <ResourceState resource={resource} />

      {!resource.loading && !resource.error && (
        <Text accessibilityLiveRegion="polite" style={styles.count}>
          Total de clientes cadastrados: {customers.length}
        </Text>
      )}

      {!resource.loading && !resource.error && customers.length === 0 && (
        <Card>
          <Message>Nenhum cliente cadastrado.</Message>
        </Card>
      )}

      {customers.map((customer) => {
        const expanded = expandedCustomerId === customer.id;
        return (
          <Card key={customer.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() =>
                setExpandedCustomerId(expanded ? null : customer.id)
              }
              style={styles.customerButton}
            >
              <View style={styles.customerCopy}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerEmail}>{customer.email}</Text>
              </View>
              <Text style={styles.expandLabel}>
                {expanded ? 'Recolher' : 'Detalhes'}
              </Text>
            </Pressable>

            {expanded && (
              <View style={styles.details}>
                <Text style={styles.detail}>
                  Telefone: {customer.phone || 'Não informado'}
                </Text>
                <Text style={styles.detail}>
                  CPF: {customer.cpf || 'Não informado'}
                </Text>
              </View>
            )}
          </Card>
        );
      })}

      <Action
        title="Cadastrar novo cliente"
        onPress={() =>
          navigation.navigate('Customers', { homeRoute: 'Admin' })
        }
      />
    </Page>
  );
}
