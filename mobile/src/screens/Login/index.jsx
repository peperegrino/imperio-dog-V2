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
import Checkbox from '../../components/Checkbox';
import Input from '../../components/Input';
import LogoHeader from '../../components/LogoHeader';
import RoleTabs from '../../components/RoleTabs';
import SecurityFooter from '../../components/SecurityFooter';
import { styles } from './styles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [perfilAtivo, setPerfilAtivo] = useState('tutor');

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
                onPress={() => console.log('Entrar no Resort', { email, perfilAtivo })}
              />
            </View>
            <View style={styles.signupRow}>
              <Text style={styles.signupCopy}>Primeira vez por aqui? </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => console.log('Criar conta do Tutor')}
              >
                <Text style={styles.signupLink}>Criar conta do Tutor</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footerSpacer} />
          <SecurityFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
