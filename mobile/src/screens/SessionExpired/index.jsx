import { useState } from 'react';
import { Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { styles } from './styles';

export default function SessionExpiredScreen() {
  const { signOut } = useAuth();
  const [error, setError] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  async function returnToLogin() {
    setError('');
    setIsClearing(true);
    try {
      await signOut();
    } catch {
      setError('Não foi possível limpar a sessão. Tente novamente.');
      setIsClearing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FAF8F5" barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.iconWrap}><Text style={styles.icon}>⌑</Text></View>
        <Text style={styles.eyebrow}>SEGURANÇA DA CONTA</Text>
        <Text style={styles.title}>Sua sessão expirou</Text>
        <Text style={styles.description}>Para proteger os dados da sua conta e dos seus pets, entre novamente para continuar.</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Seus dados continuam protegidos</Text>
          <Text style={styles.infoText}>Nenhum dado salvo nesta conta foi removido. Faça login para retomar o acesso.</Text>
        </View>
        {!!error && <Text accessibilityRole="alert" style={styles.description}>{error}</Text>}
        <Pressable accessibilityRole="button" disabled={isClearing} onPress={returnToLogin} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Entrar novamente  ›</Text>
        </Pressable>
        <Text style={styles.footer}>Ambiente protegido • Império Dog Resort</Text>
      </View>
    </SafeAreaView>
  );
}
