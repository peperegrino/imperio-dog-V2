import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppNavigation, { ProfileButton } from '../../components/AppNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Message, ResourceState, date, useResource } from '../../components/ConnectedUI';
import { colors } from '../../theme/colors';
import { styles } from './styles';

export default function PetsScreen({ navigation }) {
  const { session } = useAuth();
  const admin = session.role === 'ADMIN';
  const homeRoute = admin ? 'Admin' : 'Home';
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
          <Text style={styles.backMark}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Meus Pets</Text>
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
            <Text style={styles.emptyTitle}>{pet.name}</Text>
            <Text>{[pet.species, pet.breed, pet.sex].filter(Boolean).join(' · ')}</Text>
            {pet.weight != null && <Text>{pet.weight} kg</Text>}
            <Text>Nascimento: {date(pet.birthDate)}</Text>
            {pet.notes && <Text>{pet.notes}</Text>}
          </Card>
        ))}
        <View style={styles.emptyCard}>
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
