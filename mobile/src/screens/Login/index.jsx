import { useState } from 'react';
import {
  Alert,
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
import RoleTabs from '../../components/RoleTabs';
import SecurityFooter from '../../components/SecurityFooter';
import { styles } from './styles';

const EMAIL_PADRAO = 'admin@imperiodog.com';
const SENHA_PADRAO = '123456';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(EMAIL_PADRAO);
  const [senha, setSenha] = useState(SENHA_PADRAO);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [perfilAtivo, setPerfilAtivo] = useState('tutor');

  function entrar() {
    const emailValido = email.trim().toLowerCase() === EMAIL_PADRAO;

    if (!emailValido || senha !== SENHA_PADRAO) {
      Alert.alert('Não foi possível entrar', 'Confira o e-mail e a senha e tente novamente.');
      return;
    }

    navigation.replace(perfilAtivo === 'tutor' ? 'Home' : 'Admin');
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
            <RoleTabs activeRole={perfilAtivo} onChange={setPerfilAtivo} />
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
                label="Entrar no Resort"
                onPress={entrar}
              />
            </View>
          </View>

          <View style={styles.footerSpacer} />
          <SecurityFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
