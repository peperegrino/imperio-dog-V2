import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppNavigation, { ProfileButton } from '../../components/AppNavigation';
import { colors } from '../../theme/colors';
import { styles } from './styles';

export default function PetsScreen({ navigation, route }) {
  const homeRoute = route.params?.homeRoute || 'Admin';

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

        <View style={styles.emptyCard}>
          <View style={styles.pawBadge}>
            <Text style={styles.paw}>✦</Text>
          </View>
          <Text style={styles.emptyTitle}>Lista de pets indisponível</Text>
          <Text style={styles.emptyDescription}>
            Ainda não existe uma integração com a API para carregar pets cadastrados. Você pode preencher os dados de um novo pet; o envio será habilitado quando o backend disponibilizar o endpoint.
          </Text>
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
