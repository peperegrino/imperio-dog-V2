import { useState } from 'react';
import {
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

import { colors } from '../../theme/colors';
import { styles } from './styles';

const initialValues = {
  name: '',
  species: '',
  breed: '',
  sex: '',
  birthDate: '',
  weight: '',
  tutor: '',
  notes: '',
};

const fields = [
  { key: 'name', label: 'Nome do pet', placeholder: 'Ex.: Luna' },
  { key: 'breed', label: 'Raça', placeholder: 'Informe a raça' },
  { key: 'birthDate', label: 'Data de nascimento', placeholder: 'DD/MM/AAAA', keyboardType: 'numeric' },
  { key: 'weight', label: 'Peso (kg)', placeholder: 'Ex.: 8,5', keyboardType: 'decimal-pad' },
  { key: 'tutor', label: 'Tutor responsável', placeholder: 'Nome do tutor' },
];

function isValidBirthDate(value) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    && date <= new Date();
}

function validate(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = 'Informe o nome do pet.';
  if (!values.species) errors.species = 'Selecione a espécie.';
  if (!values.breed.trim()) errors.breed = 'Informe a raça.';
  if (!values.sex) errors.sex = 'Selecione o sexo.';
  if (!values.birthDate.trim()) errors.birthDate = 'Informe a data de nascimento.';
  else if (!isValidBirthDate(values.birthDate.trim())) {
    errors.birthDate = 'Use uma data válida no formato DD/MM/AAAA, sem data futura.';
  }

  const weight = Number(values.weight.replace(',', '.'));
  if (!values.weight.trim()) errors.weight = 'Informe o peso em quilogramas.';
  else if (!Number.isFinite(weight) || weight <= 0) errors.weight = 'Informe um peso maior que zero.';

  if (!values.tutor.trim()) errors.tutor = 'Informe o tutor responsável.';
  return errors;
}

function FormField({
  field,
  value,
  onChangeText,
  error,
  multiline = false,
  required = true,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {field.label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        accessibilityLabel={field.label}
        accessibilityHint={error || undefined}
        autoCapitalize={field.key === 'birthDate' || field.key === 'weight' ? 'none' : 'words'}
        keyboardType={field.keyboardType || 'default'}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={field.placeholder}
        placeholderTextColor={colors.textGray}
        style={[styles.input, multiline && styles.multilineInput, error && styles.inputError]}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
      />
      {error ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function ChoiceField({ label, options, value, onChange, error }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}<Text style={styles.required}> *</Text></Text>
      <View style={styles.choiceRow}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={option}
              onPress={() => onChange(option)}
              style={[styles.choice, selected && styles.choiceSelected]}
            >
              <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function NewPetScreen({ navigation }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const updateField = (key, value) => {
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);
    setSubmissionMessage('');
    if (attemptedSubmit) setErrors(validate(nextValues));
  };

  const cancel = () => navigation.goBack();

  const submit = () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setAttemptedSubmit(true);

    if (Object.keys(nextErrors).length) {
      setSubmissionMessage('');
      return;
    }

    setSubmissionMessage(
      'Os dados foram validados neste dispositivo, mas não foram cadastrados. O aplicativo ainda não possui uma API de pets para salvar o registro.',
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={cancel}
            style={styles.headerBack}
          >
            <Text style={styles.backMark}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Novo Pet</Text>
          <View style={styles.headerSide} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>IMPÉRIO DOG RESORT</Text>
            <Text style={styles.title}>Cadastrar Pet</Text>
            <Text style={styles.description}>
              Preencha as informações para preparar o cadastro do novo companheiro.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionMark}><Text style={styles.sectionMarkText}>01</Text></View>
              <View>
                <Text style={styles.sectionTitle}>Informações do pet</Text>
                <Text style={styles.sectionSubtitle}>Dados básicos e identificação</Text>
              </View>
            </View>

            <FormField
              field={fields[0]}
              onChangeText={(value) => updateField('name', value)}
              value={values.name}
              error={errors.name}
            />
            <ChoiceField
              error={errors.species}
              label="Espécie"
              onChange={(value) => updateField('species', value)}
              options={['Cachorro', 'Gato']}
              value={values.species}
            />
            <FormField
              field={fields[1]}
              onChangeText={(value) => updateField('breed', value)}
              value={values.breed}
              error={errors.breed}
            />
            <ChoiceField
              error={errors.sex}
              label="Sexo"
              onChange={(value) => updateField('sex', value)}
              options={['Macho', 'Fêmea']}
              value={values.sex}
            />
            {fields.slice(2, 4).map((field) => (
              <FormField
                field={field}
                key={field.key}
                onChangeText={(value) => updateField(field.key, value)}
                value={values[field.key]}
                error={errors[field.key]}
              />
            ))}

            <View style={styles.sectionDivider} />
            <View style={styles.sectionHeading}>
              <View style={styles.sectionMark}><Text style={styles.sectionMarkText}>02</Text></View>
              <View>
                <Text style={styles.sectionTitle}>Responsável e observações</Text>
                <Text style={styles.sectionSubtitle}>Vínculo e cuidados especiais</Text>
              </View>
            </View>

            <FormField
              field={fields[4]}
              onChangeText={(value) => updateField('tutor', value)}
              value={values.tutor}
              error={errors.tutor}
            />
            <Text style={styles.fieldHint}>
              A lista de clientes não está disponível no app; informe o tutor manualmente.
            </Text>
            <FormField
              field={{ key: 'notes', label: 'Observações', placeholder: 'Alergias, cuidados ou informações importantes (opcional)' }}
              multiline
              onChangeText={(value) => updateField('notes', value)}
              required={false}
              value={values.notes}
            />
          </View>

          <View style={styles.apiNotice}>
            <Text style={styles.apiNoticeTitle}>Sobre o cadastro</Text>
            <Text style={styles.apiNoticeText}>
              O app ainda não tem integração com endpoint para criar ou listar pets nem com uma fonte de clientes. Os dados não serão enviados ou salvos até essas integrações existirem.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={submit}
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
          >
            <Text style={styles.submitButtonText}>Cadastrar Pet</Text>
          </Pressable>
          {submissionMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.submissionMessage}>
              Cadastro não enviado. {submissionMessage}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={cancel}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
