import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Input from '../../components/Input';
import LogoHeader from '../../components/LogoHeader';
import { api } from '../../services/api';
import { showAlert, showConfirm } from '../../utils/alert';
import { styles } from './styles';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges = Boolean(name || email || password || confirmPassword);

  async function discardSignup() {
    if (hasChanges && !(await showConfirm(
      'Descartar cadastro?',
      'Os dados preenchidos serão perdidos.',
    ))) {
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Login');
    }
  }

  async function createAccount() {
    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim();
    if (!name.trim() || !normalizedEmail || !password || !confirmPassword) {
      showAlert('Confira seus dados', 'Preencha todos os campos para continuar.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showAlert('E-mail inválido', 'Digite um endereço de e-mail válido.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Senhas diferentes', 'Confira se as duas senhas foram digitadas corretamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: normalizedEmail,
        password,
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login', params: { registrationComplete: true } }],
      });
    } catch (error) {
      showAlert('Não foi possível criar a conta', error.message || 'Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View pointerEvents="none" style={styles.headerOverlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LogoHeader />

          <View style={styles.formCard}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.description}>Preencha seus dados para começar.</Text>

            <View style={styles.field}>
              <Input
                label="Nome completo"
                value={name}
                onChangeText={setName}
                placeholder="Digite seu nome"
                autoCapitalize="words"
              />
            </View>
            <View style={styles.field}>
              <Input
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="ex: mariana@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.field}>
              <Input
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Crie uma senha"
                secureTextEntry={!showPassword}
                onToggleSecure={() => setShowPassword((visible) => !visible)}
              />
            </View>
            <View style={styles.field}>
              <Input
                label="Confirmar senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Digite a senha novamente"
                secureTextEntry={!showConfirmPassword}
                onToggleSecure={() => setShowConfirmPassword((visible) => !visible)}
              />
            </View>

            <View style={styles.submitButton}>
              <Button
                label={isSubmitting ? 'Criando conta...' : 'Criar conta'}
                onPress={createAccount}
                disabled={isSubmitting}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={discardSignup}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelLabel}>Voltar para o login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
