import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { api } from '../../services/api';
import { showConfirm } from '../../utils/alert';
import CustomerIcon from '../../components/CustomerIcons';
import { colors } from '../../theme/colors';

import { styles } from './styles';

const initialValues = {
  tutorName: '',
  email: '',
  phone: '',
  cpf: '',
  streetName: '', streetNumber: '', neighborhood: '', city: '', federalUnit: '', zipCode: '', password: '',
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
  ...[
    ['streetName', 'Rua'], ['streetNumber', 'Número'], ['neighborhood', 'Bairro'],
    ['city', 'Cidade'], ['federalUnit', 'UF'], ['zipCode', 'CEP'], ['password', 'Senha inicial'],
  ].map(([key, label]) => ({ key, label, placeholder: label, icon: key === 'password' ? 'person' : 'map' })),
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
  else if (values.tutorName.trim().length > 40) errors.tutorName = 'Use no máximo 40 caracteres.';
  if (!values.email.trim()) errors.email = 'Informe o e-mail.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'Confira o formato do e-mail.';
  } else if (values.email.trim().length > 200) {
    errors.email = 'Use no máximo 200 caracteres no e-mail.';
  }

  const phoneDigits = values.phone.replace(/\D/g, '');
  if (!phoneDigits) errors.phone = 'Informe o telefone / WhatsApp.';
  else if (![10, 11].includes(phoneDigits.length) || phoneDigits.slice(0, 2) === '00') {
    errors.phone = 'Informe um telefone brasileiro com DDD.';
  }

  if (!values.cpf.replace(/\D/g, '')) errors.cpf = 'Informe o CPF do titular.';
  else if (!isValidCpf(values.cpf)) errors.cpf = 'Informe um CPF válido.';
  if (values.password.length < 12) errors.password = 'A senha inicial deve ter pelo menos 12 caracteres.';
  else if (values.password.length > 72) errors.password = 'Use no máximo 72 caracteres na senha.';
  const zipCode = values.zipCode.replace(/\D/g, '');
  if (zipCode.length !== 8) errors.zipCode = 'Informe um CEP com 8 dígitos.';
  if (!values.streetName.trim()) errors.streetName = 'Informe a rua.';
  else if (values.streetName.trim().length > 33) errors.streetName = 'Use no máximo 33 caracteres.';
  if (!/^\d{1,7}$/.test(values.streetNumber.trim())) errors.streetNumber = 'Informe um número de 1 a 7 dígitos.';
  if (!values.neighborhood.trim()) errors.neighborhood = 'Informe o bairro.';
  else if (values.neighborhood.trim().length > 100) errors.neighborhood = 'Use no máximo 100 caracteres.';
  if (!values.city.trim()) errors.city = 'Informe a cidade.';
  else if (values.city.trim().length > 40) errors.city = 'Use no máximo 40 caracteres.';
  if (!/^[A-Za-z]{2}$/.test(values.federalUnit.trim())) errors.federalUnit = 'Informe a UF com duas letras.';
  const hasPet = Boolean(values.petName.trim() || values.breed.trim());
  if (hasPet && !values.petName.trim()) errors.petName = 'Informe o nome do pet.';
  if (hasPet && !values.breed.trim()) errors.breed = 'Informe a raça.';
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
          secureTextEntry={field.key === 'password'}
          autoCapitalize={field.key === 'password' ? 'none' : field.autoCapitalize || 'words'}
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

export default function CustomersScreen({ navigation, route }) {
  const homeRoute = route.params?.homeRoute || 'Admin';
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [saving, setSaving] = useState(false);
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
    else navigation.navigate(homeRoute, { homeRoute });
  };

  const confirmLeave = async () => {
    if (!isDirty || await showConfirm('Descartar cadastro?', 'Os dados preenchidos serão perdidos.')) {
      leaveScreen();
    }
  };

  const handleSubmit = async () => {
    if (saving) return;
    const nextErrors = validate(values);
    setAttemptedSubmit(true);
    setErrors(nextErrors);
    setSubmitNotice('');

    const hasPet = Boolean(values.petName.trim() || values.breed.trim());
    const fieldsToValidate = hasPet
      ? [...requiredFields, { key: 'petName' }, { key: 'breed' }]
      : requiredFields;
    const firstInvalid = fieldsToValidate.find((field) => nextErrors[field.key]);
    if (firstInvalid) {
      inputRefs.current[firstInvalid.key]?.focus();
      return;
    }

    const { tutorName, petName, breed, ...details } = values;
    const customer = { ...details, name: tutorName.trim() };
    setSaving(true);
    try {
      if (petName.trim()) {
        await api.post('/admin/customers/with-pet', {
          customer, pet: { name: petName.trim(), breed: breed.trim(), species: 'Cachorro' },
        });
      } else {
        await api.post('/admin/customers', customer);
      }
      setValues(initialValues);
      setAttemptedSubmit(false);
      setSubmitNotice(petName.trim() ? 'Cliente e pet cadastrados.' : 'Cliente cadastrado.');
    } catch (error) {
      setSubmitNotice(error.message);
    } finally {
      setSaving(false);
    }
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
          <Pressable
            accessibilityLabel="Abrir perfil"
            accessibilityRole="button"
            onPress={() => navigation.navigate('Profile', { homeRoute })}
            style={styles.headerButton}
          >
            <ScreenIcon name="profile" size={20} color={colors.textMuted} />
          </Pressable>
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
              Cadastre um tutor. Os dados do pet podem ser adicionados agora ou depois.
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
                field={field}
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
            <Text style={styles.petProfileDescription}>Opcional. Preencha os dois campos para cadastrar um pet junto com o tutor.</Text>
            <View style={styles.petProfile}>
              <View style={styles.petIllustration}><ScreenIcon name="rabbit" size={38} /></View>
              <View style={styles.petProfileText}>
                <Text style={styles.petProfileTitle}>Perfil do Pet</Text>
                <Text style={styles.petProfileDescription}>Adaptaremos a estadia às preferências dele.</Text>
              </View>
            </View>
            <FormField
              field={{ key: 'petName', label: 'Nome do Pet', placeholder: 'ex: Thor', icon: 'pet' }}
              value={values.petName}
              onChangeText={(value) => updateField('petName', value)}
              error={errors.petName}
              inputRef={(ref) => { inputRefs.current.petName = ref; }}
              onSubmitEditing={() => inputRefs.current.breed?.focus()}
            />
            <FormField
              field={{ key: 'breed', label: 'Raça', placeholder: 'ex: Golden Retriever', icon: 'pet' }}
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
            disabled={saving}
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed]}
          >
            <Text style={styles.submitLabel}>{saving ? 'Salvando cadastro...' : 'Cadastrar Cliente'}</Text>
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
