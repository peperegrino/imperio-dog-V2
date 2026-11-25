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

const addressFields = [
  ['phone', 'Telefone'], ['cpf', 'CPF'], ['zipCode', 'CEP'],
  ['streetName', 'Rua'], ['streetNumber', 'Número'], ['neighborhood', 'Bairro'],
  ['city', 'Cidade'], ['federalUnit', 'UF'],
];

function isValidCpf(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!/^\d{11}$/.test(digits) || /^([0-9])\1{10}$/.test(digits)) return false;

  const digitAt = (length) => {
    const sum = digits
      .slice(0, length)
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return digitAt(9) === Number(digits[9]) && digitAt(10) === Number(digits[10]);
}

export default function SignupScreen({ navigation }) {
  const [address, setAddress] = useState({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges = Boolean(name || email || password || confirmPassword || Object.values(address).some(Boolean));

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

    if (normalizedEmail.length > 200) {
      showAlert('E-mail inválido', 'Use no máximo 200 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Senhas diferentes', 'Confira se as duas senhas foram digitadas corretamente.');
      return;
    }

    if (password.length < 12 || password.length > 72) {
      showAlert('Senha inválida', 'A senha deve ter entre 12 e 72 caracteres.');
      return;
    }

    if (name.trim().length > 40) {
      showAlert('Nome inválido', 'Use no máximo 40 caracteres.');
      return;
    }

    const phoneDigits = String(address.phone || '').replace(/\D/g, '');
    if (![10, 11].includes(phoneDigits.length)) {
      showAlert('Telefone inválido', 'Informe um telefone com DDD.');
      return;
    }

    if (!isValidCpf(address.cpf)) {
      showAlert('CPF inválido', 'Informe um CPF válido.');
      return;
    }

    if (!/^\d{8}$/.test(String(address.zipCode || '').replace(/\D/g, ''))) {
      showAlert('CEP inválido', 'Informe um CEP com 8 dígitos.');
      return;
    }

    if (!address.streetName?.trim() || address.streetName.trim().length > 33
      || !/^\d{1,7}$/.test(String(address.streetNumber || '').trim())
      || !address.neighborhood?.trim() || address.neighborhood.trim().length > 100
      || !address.city?.trim() || address.city.trim().length > 40
      || !/^[A-Za-z]{2}$/.test(String(address.federalUnit || '').trim())) {
      showAlert('Endereço incompleto', 'Confira rua, número, bairro, cidade e UF.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: normalizedEmail,
        password,
        ...address,
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

            {addressFields.map(([key, label]) => (
              <View key={key} style={styles.field}>
                <Input label={label} value={address[key] || ''}
                  onChangeText={(value) => setAddress((previous) => ({ ...previous, [key]: value }))} />
              </View>
            ))}
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
