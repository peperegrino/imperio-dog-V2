import StandardBackIcon from '../../components/StandardBackIcon';
import { useState } from 'react';
import { api } from '../../services/api';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppNavigation, { ProfileButton } from '../../components/AppNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Message, ResourceState, date, useResource } from '../../components/ConnectedUI';
import ProfilePhoto from '../../components/ProfilePhoto';
import { colors } from '../../theme/colors';
import { styles } from './styles';

export default function PetsScreen({ navigation }) {
  const { session } = useAuth();
  const admin = session.role === 'ADMIN';
  const homeRoute = admin ? 'Admin' : 'Home';
  const [selectedPet, setSelectedPet] = useState(null);
const [deleting, setDeleting] = useState(false);
const [deleteError, setDeleteError] = useState('');

const removePet = async () => {
  if (!selectedPet || deleting) return;

  setDeleting(true);
  setDeleteError('');

  try {
    await api.delete(`/account/pets/${selectedPet.id}`);
    setSelectedPet(null);
    navigation.replace('Pets');
  } catch (error) {
    setDeleteError(
      error.status === 409
        ? 'Este pet possui histórico de cobranças e não pode ser removido.'
        : error.message
    );
  } finally {
    setDeleting(false);
  }
};
  const resource = useResource(admin ? '/admin/pets' : '/account/pets');

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(homeRoute, { homeRoute });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={goBack}
          style={styles.backButton}
        >
          <StandardBackIcon />
        </Pressable>
        <Text style={styles.headerTitle}>{admin ? 'Pets' : 'Meus Pets'}</Text>
        <ProfileButton
          onPress={() => navigation.navigate('Profile', { homeRoute })}
          size={32}
          iconSize={16}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>CUIDADO E ACOMPANHAMENTO</Text>
          <Text style={styles.title}>Pets cadastrados</Text>
          <Text style={styles.description}>
            Acompanhe os dados dos pets vinculados ao responsável.
          </Text>
        </View>

        <ResourceState resource={resource} />
        {resource.data?.map((pet) => (
          <Card key={pet.id}>
            <ProfilePhoto
              path={`/account/pets/${pet.id}/photo`}
              label={`Foto de ${pet.name}`}
              size={58}
              fallback={<View style={styles.pawBadge}><Text style={styles.paw}>{pet.name?.[0]}</Text></View>}
            />
            <Text style={styles.emptyTitle}>{pet.name}</Text>
            <Text>{[pet.species, pet.breed, pet.sex].filter(Boolean).join(' · ')}</Text>
            {pet.weight != null && <Text>{pet.weight} kg</Text>}
            <Text>Nascimento: {date(pet.birthDate)}</Text>
            {pet.notes && <Text>{pet.notes}</Text>}
            {!admin && (
  <Pressable
    accessibilityRole="button"
    onPress={() => navigation.navigate('NewPet', { homeRoute, pet })}
    style={[styles.addButton, { marginTop: 12 }]}
  >
    <Text style={styles.addButtonText}>
      Editar pet
    </Text>
  </Pressable>
)}
{!admin && (
  <Pressable
    accessibilityRole="button"
    onPress={() => {
      setDeleteError('');
      setSelectedPet(pet);
    }}
    style={{
      padding: 12,
      marginTop: 14,
      marginBottom: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#722F37',
      borderRadius: 10,
    }}
  >
    <Text style={{ color: '#722F37', fontWeight: '600' }}>
      Remover pet
    </Text>
  </Pressable>
)}

{selectedPet?.id === pet.id && (
  <View style={{ padding: 12, marginTop: 12 }}>
    <Text style={{ fontWeight: '600' }}>
      Deseja realmente remover {pet.name}?
    </Text>

    <Text>Esta ação não poderá ser desfeita.</Text>

    {deleteError ? (
      <Text style={{ color: '#B91C1C', marginTop: 8 }}>
        {deleteError}
      </Text>
    ) : null}

    <Pressable
      disabled={deleting}
      onPress={removePet}
      style={[styles.addButton, { marginTop: 12 }]}
    >
      <Text style={styles.addButtonText}>
        {deleting ? 'Removendo...' : 'Confirmar exclusão'}
      </Text>
    </Pressable>

    <Pressable
      disabled={deleting}
      onPress={() => setSelectedPet(null)}
      style={{ padding: 12, alignItems: 'center' }}
    >
      <Text>Cancelar</Text>
    </Pressable>
  </View>
)}
          </Card>
        ))}
        <View style={[styles.emptyCard, { marginTop: 24 }]}>
          <View style={styles.pawBadge}>
            <Text style={styles.paw}>✦</Text>
          </View>
          {!resource.loading && !resource.error && !resource.data?.length && (
            <Message>Nenhum pet cadastrado.</Message>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('NewPet', { homeRoute })}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Text style={styles.addButtonText}>Adicionar Pet</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AppNavigation
        activeRoute="Home"
        homeRoute={homeRoute}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}
