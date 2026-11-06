import { useEffect, useState } from 'react';
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
import Checkbox from '../../components/Checkbox';
import Input from '../../components/Input';
import LogoHeader from '../../components/LogoHeader';
import SecurityFooter from '../../components/SecurityFooter';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';
import { showAlert } from '../../utils/alert';
import { styles } from './styles';

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  useEffect(() => {
    if (route.params?.registrationComplete) {
      showAlert('Cadastro realizado', 'Sua conta foi criada. Entre com seu e-mail e senha.');
      navigation.setParams({ registrationComplete: false });
    }
  }, [navigation, route.params?.registrationComplete]);

  async function entrar() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email.trim(), senha);

    } catch (error) {
      const message = error instanceof ApiError && error.status === 401
        ? 'Confira o e-mail e a senha e tente novamente.'
        : error.message || 'Tente novamente mais tarde.';
      showAlert('Não foi possível entrar', message);
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
            <View style={styles.emailField}>
              <Input
                label="E-mail cadastrado"
                value={email}
                onChangeText={setEmail}
                placeholder="ex: mariana98@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.passwordField}>
              <Input
                label="Senha de acesso"
                value={senha}
                onChangeText={setSenha}
                placeholder="Digite sua senha"
                secureTextEntry={!mostrarSenha}
                onToggleSecure={() => setMostrarSenha((visible) => !visible)}
              />
            </View>
            <View style={styles.optionsRow}>
              <Checkbox checked={lembrar} onPress={() => setLembrar((value) => !value)} />
              <Text style={styles.rememberLabel}>Lembrar por 30 dias</Text>
              <View style={styles.optionsSpacer} />
              <Pressable
                accessibilityRole="link"
                onPress={() => console.log('Esqueci minha senha')}
                style={styles.forgotPasswordPressable}
              >
                <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
              </Pressable>
            </View>
            <View style={styles.submitButton}>
              <Button
                label={isSubmitting ? 'Entrando...' : 'Entrar no Resort'}
                onPress={entrar}
                disabled={isSubmitting}
              />
            </View>
            <Pressable
              accessibilityRole="link"
              onPress={() => navigation.navigate('Signup')}
              style={styles.signupRow}
            >
              <Text style={styles.signupCopy}>Ainda não tem uma conta? </Text>
              <Text style={styles.signupLink}>Cadastre-se</Text>
            </Pressable>
          </View>

          <View style={styles.footerSpacer} />
          <SecurityFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
