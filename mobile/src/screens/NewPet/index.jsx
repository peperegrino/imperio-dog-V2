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

import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Choose, ResourceState, useResource } from '../../components/ConnectedUI';
import { colors } from '../../theme/colors';
import { styles } from './styles';

const dogBreeds = 'Akita,American Bully,Basset Hound,Beagle,Border Collie,Boxer,Bull Terrier,Bulldog Frances,Bulldog Ingles,Cane Corso,Chihuahua,Chow Chow,Cocker Spaniel,Collie,Dachshund,Dalmata,Dobermann,Dogo Argentino,Dogue Alemao,Fila Brasileiro,Golden Retriever,Husky Siberiano,Jack Russell Terrier,Labrador,Lhasa Apso,Lulu da Pomerania,Maltes,Mastiff,Pastor Alemao,Pastor Belga,Pastor Australiano,Pequines,Pinscher,Pitbull,Poodle,Pug,Rottweiler,Samoieda,Sao Bernardo,Schnauzer,Shar Pei,Shiba Inu,Shih Tzu,Spitz Alemao,Terra Nova,Weimaraner,Whippet,Yorkshire Terrier'.split(',');

const catBreeds = 'Abissinio,Angora,Azul Russo,Bengal,Birmanes,Bombaim,British Shorthair,Burmese,Chartreux,Cornish Rex,Devon Rex,Exotico,Himalaio,Maine Coon,Manx,Munchkin,Noruegues da Floresta,Ocicat,Oriental,Persa,Ragdoll,Savannah,Scottish Fold,Siames,Siberiano,Somali,Sphynx,Tonquines,Van Turco'.split(',');

function BreedSelector({ species, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const options = ['Sem raca definida (SRD)', ...(species === 'Gato' ? catBreeds : dogBreeds), 'Outra raca'];
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const matches = options.filter(item => normalize(item).includes(normalize(query)));

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>Raça</Text>
      <Pressable
        accessibilityRole="button"
        disabled={!species}
        onPress={() => { setQuery(''); setOpen(!open); }}
        style={[styles.input, error && styles.inputError, { justifyContent: 'center' }]}
      >
        <Text style={{ color: '#332522' }}>
          {value || (species ? 'Selecionar raça' : 'Selecione a espécie primeiro')}
        </Text>
      </Pressable>
      {open && species && (
        <View style={{ marginTop: 8 }}>
          <TextInput style={styles.input}
            placeholder="Buscar raça..."
            value={query}
            onChangeText={setQuery}
          />
          {matches.map(item => (
            <Pressable key={item}
              onPress={() => { onChange(item); setOpen(false); }}
              style={{ padding: 14, borderBottomWidth: 1, borderColor: '#E8DED5' }}>
              <Text style={{ color: '#722F37' }}>{item}</Text>
            </Pressable>
          ))}
          {!matches.length && <Text style={{ padding: 12 }}>Nenhuma raça encontrada.</Text>}
        </View>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const initialValues = {
  name: '',
  species: '',
  breed: '',
  sex: '',
  birthDate: '',
  weight: '',
  notes: '',
};

const fields = [
  { key: 'name', label: 'Nome do pet', placeholder: 'Ex.: Luna' },
  { key: 'breed', label: 'Raça', placeholder: 'Informe a raça' },
  { key: 'birthDate', label: 'Data de nascimento', placeholder: 'DD/MM/AAAA', keyboardType: 'numeric' },
  { key: 'weight', label: 'Peso (kg)', placeholder: 'Ex.: 8,5', keyboardType: 'decimal-pad' },
];

function isValidBirthDate(value) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  const minimum = new Date();
  minimum.setFullYear(minimum.getFullYear() - 30);
  minimum.setHours(0, 0, 0, 0);

  return date >= minimum && date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    && date <= new Date();
}

function validate(values, editing = false, pet = null) {
  const errors = {};

  if (!values.name.trim()) errors.name = 'Informe o nome do pet.';
  if (!editing && !values.species) errors.species = 'Selecione a espécie.';
  if ((!editing || values.species !== (pet?.species || '')) && !values.breed.trim()) errors.breed = 'Informe a raça.';
  if (!editing && !values.sex) errors.sex = 'Selecione o sexo.';
  if (!editing && !values.birthDate.trim()) errors.birthDate = 'Informe a data de nascimento.';
  else if ((!editing || values.birthDate !== (pet?.birthDate?.split('-').reverse().join('/') || '')) && values.birthDate.trim() && !isValidBirthDate(values.birthDate.trim())) {
    errors.birthDate = 'Informe uma data valida, sem ultrapassar 30 anos.';
  }

  if (values.weight.trim() && (!editing || values.weight !== String(pet?.weight ?? '') || values.species !== (pet?.species || ''))) {
    const weight = Number(values.weight.replace(',', '.'));
    const maximum = values.species === 'Gato' ? 25 : 150;
    if (!Number.isFinite(weight) || weight < 0.05 || weight > maximum) {
      errors.weight = 'Informe um peso entre 0,05 e ' + maximum + ' kg.';
    }
  } else if (!editing) {
    errors.weight = 'Informe o peso em quilogramas.';
  }

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
        maxLength={field.key === 'birthDate' ? 10 : undefined}
        onChangeText={(text) => {
          if (field.key !== 'birthDate') {
            onChangeText(text);
            return;
          }

          const digits = text.replace(/[^0-9]/g, '').slice(0, 8);
          let formatted = digits.slice(0, 2);

          if (digits.length > 2) formatted += '/' + digits.slice(2, 4);
          if (digits.length > 4) formatted += '/' + digits.slice(4, 8);

          if (text.length > value.length && (digits.length === 2 || digits.length === 4)) {
            formatted += '/';
          }

          onChangeText(formatted);
        }}
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

function ChoiceField({ label, options, value, onChange, error, required = true }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
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

export default function NewPetScreen({ navigation, route }) {
  const pet = route?.params?.pet;
  const editing = Boolean(pet?.id);
  const { session } = useAuth();
  const admin = session.role === 'ADMIN';
  const customers = useResource(admin ? '/admin/customers' : '/account/me');
  const [customerId, setCustomerId] = useState(pet?.customerId ?? null);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(
  pet ? {
    name: pet.name || '',
    species: pet.species || '',
    breed: pet.breed || '',
    sex: pet.sex || '',
    birthDate: pet.birthDate
      ? pet.birthDate.split('-').reverse().join('/')
      : '',
    weight: String(pet.weight ?? ''),
    notes: pet.notes || '',
  } : initialValues
);
  const [errors, setErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const updateField = (key, value) => {
    const nextValues = { ...values, [key]: value, ...(key === 'species' && value !== values.species ? { breed: '' } : {}) };
    setValues(nextValues);
    setSubmissionMessage('');
    if (attemptedSubmit) setErrors(validate(nextValues, editing, pet));
  };

  const cancel = () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Pets');

  const submit = async () => {
    if (saving) return;
    const nextErrors = validate(values, editing, pet);
    setErrors(nextErrors);
    setAttemptedSubmit(true);

    if (Object.keys(nextErrors).length) {
      setSubmissionMessage('');
      return;
    }

    if (admin && !customerId) {
      setSubmissionMessage('Selecione o tutor responsável.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
  ...values,
  customerId,
  birthDate: values.birthDate.trim() ? values.birthDate.trim().split('/').reverse().join('-') : null,
  weight: values.weight.trim() ? Number(values.weight.replace(',', '.')) : null,
};

if (editing) {
  const changed = {};
  const originalBirthDate = pet.birthDate ? pet.birthDate.split('-').reverse().join('/') : '';
  const originalWeight = pet.weight == null ? '' : String(pet.weight);
  if (values.name !== (pet.name || '')) changed.name = values.name.trim();
  if (values.species !== (pet.species || '')) changed.species = values.species;
  if (values.breed !== (pet.breed || '')) changed.breed = values.breed;
  if (values.sex !== (pet.sex || '')) changed.sex = values.sex;
  if (values.birthDate !== originalBirthDate) changed.birthDate = payload.birthDate;
  if (values.weight !== originalWeight) changed.weight = payload.weight;
  if (values.notes !== (pet.notes || '')) changed.notes = values.notes;
  await api.put((admin ? '/admin/pets/' : '/account/pets/') + pet.id, changed);
} else {
  await api.post(admin ? '/admin/pets' : '/account/pets', payload);
}
      if (editing && admin && navigation.canGoBack()) navigation.goBack();
      else navigation.replace('Pets');
    } catch (error) {
      setSubmissionMessage(error.message);
    } finally {
      setSaving(false);
    }
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
            <Text style={styles.backMark}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
  {editing ? 'Editar Pet' : 'Novo Pet'}
</Text>
          <View style={styles.headerSide} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>IMPÉRIO DOG RESORT</Text>
            <Text style={styles.title}>
  {editing ? 'Editar informações' : 'Cadastrar Pet'}
</Text>
            <Text style={styles.description}>
              {editing
                ? 'Atualize os dados do seu pet. Altere somente as informações desejadas.'
                : 'Preencha as informações para preparar o cadastro do novo companheiro.'}
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
              required={!editing}
              value={values.species}
            />
            <BreedSelector
    species={values.species}
    value={values.breed}
    onChange={(value) => updateField('breed', value)}
    error={errors.breed}
  />
            <ChoiceField
              error={errors.sex}
              label="Sexo"
              onChange={(value) => updateField('sex', value)}
              options={['Macho', 'Fêmea']}
              required={!editing}
              value={values.sex}
            />
            {fields.slice(2, 4).map((field) => (
              <FormField
                field={field}
                key={field.key}
                onChangeText={(value) => updateField(field.key, value)}
                value={values[field.key]}
                error={errors[field.key]}
                required={!editing}
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

            {admin && !editing && (
              <>
                <ResourceState resource={customers} />
                <Choose label="Tutor responsável" items={customers.data || []}
                  value={customerId} onChange={setCustomerId} />
              </>
            )}
            <FormField
              field={{ key: 'notes', label: 'Observações', placeholder: 'Alergias, cuidados ou informações importantes (opcional)' }}
              multiline
              onChangeText={(value) => updateField('notes', value)}
              required={false}
              value={values.notes}
            />
          </View>


          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={submit}
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
          >
            <Text style={styles.submitButtonText}>
              {saving ? 'Salvando…' : editing ? 'Salvar alterações' : 'Cadastrar Pet'}
            </Text>
          </Pressable>
          {submissionMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.submissionMessage}>
              {editing ? 'Alteração não salva.' : 'Cadastro não enviado.'} {submissionMessage}
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
