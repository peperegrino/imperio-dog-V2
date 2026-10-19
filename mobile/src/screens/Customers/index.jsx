import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import CustomerIcon from '../../components/CustomerIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { styles } from './styles';

const initialValues = {
  tutorName: '',
  email: '',
  phone: '',
  cpf: '',
  address: '',
  petName: '',
  breed: '',
};

const requiredFields = [
  { key: 'tutorName', label: 'Nome Completo', placeholder: 'ex: Mariana Oliveira', icon: 'person' },
  {
    key: 'email',
    label: 'E-mail Corporativo ou Pessoal',
    placeholder: 'ex: mariana@email.com',
    icon: 'email',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  {
    key: 'phone',
    label: 'Telefone / WhatsApp',
    placeholder: '(11) 99999-4321',
    icon: 'phone',
    keyboardType: 'phone-pad',
  },
  {
    key: 'cpf',
    label: 'CPF do Titular',
    placeholder: '000.000.000-00',
    icon: 'fingerprint',
    keyboardType: 'number-pad',
  },
  {
    key: 'address',
    label: 'Endereço',
    placeholder: 'ex: Rua Oscar Freire, 1000 - SP',
    icon: 'map',
  },
];

function ScreenIcon({ name, size = 18, color = colors.brown }) {
  if (name !== 'back') return <CustomerIcon name={name} size={size} />;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="m14.5 5-7 7 7 7M8 12h12"
        fill="none"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 3) return digits ? `(${digits}` : '';
  if (digits.length < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  const splitAt = digits.length > 10 ? 7 : 6;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, splitAt)}-${digits.slice(splitAt)}`;
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3}\.\d{3})(\d{1,2})$/, '$1-$2');
}

function isValidCpf(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^([0-9])\1{10}$/.test(digits)) return false;

  const checkDigit = (length) => {
    const sum = digits
      .slice(0, length)
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };

  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
}

function validate(values) {
  const errors = {};
  if (!values.tutorName.trim()) errors.tutorName = 'Informe o nome completo.';
  if (!values.email.trim()) errors.email = 'Informe o e-mail.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'Confira o formato do e-mail.';
  }

  const phoneDigits = values.phone.replace(/\D/g, '');
  if (!phoneDigits) errors.phone = 'Informe o telefone / WhatsApp.';
  else if (![10, 11].includes(phoneDigits.length) || phoneDigits.slice(0, 2) === '00') {
    errors.phone = 'Informe um telefone brasileiro com DDD.';
  }

  if (!values.cpf.replace(/\D/g, '')) errors.cpf = 'Informe o CPF do titular.';
  else if (!isValidCpf(values.cpf)) errors.cpf = 'Informe um CPF válido.';
  if (!values.petName.trim()) errors.petName = 'Informe o nome do pet.';
  if (!values.breed.trim()) errors.breed = 'Informe a raça.';
  return errors;
}

function FormField({ field, value, onChangeText, error, inputRef, onSubmitEditing, last }) {
  const label = `${field.label}${field.required ? ' *' : ''}`;
  return (
    <View style={[styles.field, last && styles.lastField]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputWrapError]}>
        {field.icon && <View style={styles.fieldIcon}><ScreenIcon name={field.icon} size={17} /></View>}
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          accessibilityHint={error || undefined}
          autoCapitalize={field.autoCapitalize || 'words'}
          autoCorrect={field.key === 'email' ? false : undefined}
          keyboardType={field.keyboardType || 'default'}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={field.placeholder}
          placeholderTextColor={colors.textGray}
          returnKeyType={last ? 'done' : 'next'}
          style={[styles.input, field.icon && styles.inputWithIcon]}
          value={value}
        />
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export default function CustomersScreen({ navigation }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitNotice, setSubmitNotice] = useState('');
  const inputRefs = useRef({});

  const isDirty = Object.values(values).some((value) => value.trim().length > 0);

  const updateField = (key, value) => {
    const formatted = key === 'phone' ? formatPhone(value) : key === 'cpf' ? formatCpf(value) : value;
    const nextValues = { ...values, [key]: formatted };
    setValues(nextValues);
    setSubmitNotice('');
    if (attemptedSubmit) setErrors(validate(nextValues));
  };

  const leaveScreen = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  const confirmLeave = () => {
    if (!isDirty) {
      leaveScreen();
      return;
    }

    Alert.alert('Descartar cadastro?', 'Os dados preenchidos serão perdidos.', [
      { text: 'Continuar preenchendo', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: leaveScreen },
    ]);
  };

  const handleSubmit = () => {
    const nextErrors = validate(values);
    setAttemptedSubmit(true);
    setErrors(nextErrors);
    setSubmitNotice('');

    const firstInvalid = [...requiredFields.filter((field) => field.key !== 'address'),
      { key: 'petName' }, { key: 'breed' }].find((field) => nextErrors[field.key]);
    if (firstInvalid) {
      inputRefs.current[firstInvalid.key]?.focus();
      return;
    }

    setSubmitNotice(
      'Dados validados neste dispositivo. O cadastro não foi enviado: a integração depende do contrato da API.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            onPress={confirmLeave}
            style={styles.headerButton}
            hitSlop={8}
          >
            <ScreenIcon name="back" size={21} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.headerTitle}>Painel Admin</Text>
          <View accessibilityLabel="Perfil" accessible style={styles.headerButton}>
            <ScreenIcon name="profile" size={20} color={colors.textMuted} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View accessibilityLabel="Progresso do cadastro" style={styles.progressTrack}>
            <View style={styles.progressFill} />
            <View style={styles.progressDot} />
          </View>

          <View style={[styles.card, styles.introCard]}>
            <Image
              accessibilityLabel="Logo Império Dog Resort"
              resizeMode="contain"
              source={require('../../assets/images/logo-imperio-dog.png')}
              style={styles.logo}
            />
            <Text style={styles.pageTitle}>Cadastrar Novo Cliente</Text>
            <Text style={styles.introDescription}>
              Adicione um tutor e seu pet ao sistema do resort. As credenciais de acesso serão enviadas por e-mail e WhatsApp.
            </Text>
          </View>

          <View style={[styles.card, styles.formCard]}>
            <View style={styles.cardHeading}>
              <View style={styles.headingIcon}><ScreenIcon name="person" size={18} /></View>
              <Text style={styles.cardTitle}>Dados do Tutor</Text>
              <View style={styles.titularBadge}><Text style={styles.titularText}>Titular</Text></View>
            </View>
            <View style={styles.divider} />
            {requiredFields.map((field, index) => (
              <FormField
                key={field.key}
                field={{ ...field, required: field.key !== 'address' }}
                value={values[field.key]}
                onChangeText={(value) => updateField(field.key, value)}
                error={errors[field.key]}
                inputRef={(ref) => { inputRefs.current[field.key] = ref; }}
                onSubmitEditing={() => {
                  const nextField = requiredFields[index + 1];
                  if (nextField) inputRefs.current[nextField.key]?.focus();
                  else inputRefs.current.petName?.focus();
                }}
                last={index === requiredFields.length - 1}
              />
            ))}
          </View>

          <View style={[styles.card, styles.formCard, styles.petCard]}>
            <View style={styles.cardHeading}>
              <View style={styles.headingIcon}><ScreenIcon name="dog" size={19} /></View>
              <Text style={styles.cardTitle}>Dados do Pet</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.petProfile}>
              <View style={styles.petIllustration}><ScreenIcon name="rabbit" size={38} /></View>
              <View style={styles.petProfileText}>
                <Text style={styles.petProfileTitle}>Perfil do Pet</Text>
                <Text style={styles.petProfileDescription}>Adaptaremos a estadia às preferências dele.</Text>
              </View>
            </View>
            <FormField
              field={{ key: 'petName', label: 'Nome do Pet', placeholder: 'ex: Thor', icon: 'pet', required: true }}
              value={values.petName}
              onChangeText={(value) => updateField('petName', value)}
              error={errors.petName}
              inputRef={(ref) => { inputRefs.current.petName = ref; }}
              onSubmitEditing={() => inputRefs.current.breed?.focus()}
            />
            <FormField
              field={{ key: 'breed', label: 'Raça', placeholder: 'ex: Golden Retriever', icon: 'pet', required: true }}
              value={values.breed}
              onChangeText={(value) => updateField('breed', value)}
              error={errors.breed}
              inputRef={(ref) => { inputRefs.current.breed = ref; }}
              onSubmitEditing={handleSubmit}
              last
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed]}
          >
            <Text style={styles.submitLabel}>Cadastrar Cliente</Text>
            <ScreenIcon name="send" size={17} color={colors.white} />
          </Pressable>
          {submitNotice ? (
            <Text accessibilityLiveRegion="polite" style={styles.submitNotice}>{submitNotice}</Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={confirmLeave}
            style={styles.cancelButton}
            hitSlop={8}
          >
            <Text style={styles.cancelLabel}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
