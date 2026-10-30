import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { styles } from './styles';

const INITIAL_SERVICES = [
  {
    id: 'bath',
    name: 'Banho Terapêutico',
    category: 'Estética & Spa',
    description: 'Higiene completa com água termorregulada, produtos hipoalergênicos e secagem acústica assistida.',
    rule: 'Variação por porte do animal',
    icon: 'bath',
    layout: 'grid',
    rates: [
      { label: 'Pequeno', amount: '70,00' },
      { label: 'Médio', amount: '90,00' },
      { label: 'Grande', amount: '120,00' },
    ],
  },
  {
    id: 'grooming',
    name: 'Tosa Especializada',
    category: 'Estética & Spa',
    description: 'Modelagem da raça, tosa higiênica e corte na tesoura conforme orientação cinófila e padrão estético.',
    rule: 'Variação por porte e modalidade',
    icon: 'scissors',
    layout: 'grid',
    rates: [
      { label: 'Pequeno', amount: '80,00' },
      { label: 'Médio', amount: '100,00' },
      { label: 'Grande', amount: '130,00' },
    ],
  },
  {
    id: 'boarding',
    name: 'Hospedagem Imperial',
    category: 'Hospedagem',
    description: 'Estadia climatizada 24h, monitoramento por câmeras, alimentação assistida e passeios diários em parque verde.',
    rule: 'Modelo de diária ou período prolongado',
    icon: 'bed',
    layout: 'rows',
    rates: [
      { label: 'Diária Padrão', amount: '150,00', unit: '/ dia' },
      { label: 'Diária Master VIP', amount: '210,00', unit: '/ dia' },
      { label: 'Pacote Semanal', amount: '950,00', unit: '/ sem' },
    ],
  },
  {
    id: 'daycare',
    name: 'Day Care / Creche',
    category: 'Day Care',
    description: 'Socialização equilibrada, estimulação cognitiva e atividades recreativas com monitores cinotécnicos.',
    rule: 'Cobrança flexível por turno ou mensalidade',
    icon: 'sun',
    layout: 'rows',
    rates: [
      { label: 'Meio Período', amount: '65,00', unit: '/ turno' },
      { label: 'Diária Completa', amount: '110,00', unit: '/ dia' },
      { label: 'Mensalidade Recorrente', amount: '780,00', unit: '/ mês' },
    ],
  },
  {
    id: 'spa',
    name: 'Spa Canino & Bem-Estar',
    category: 'Estética & Spa',
    description: 'Banho relaxante de ofurô, massagem suave e cuidados especiais de bem-estar para aliviar o estresse do seu cão.',
    rule: 'Sessão avulsa ou pacote de bem-estar',
    icon: 'leaf',
    layout: 'rows',
    rates: [
      { label: 'Sessão Única Especial', amount: '140,00' },
      { label: 'Pacote Bem-Estar (4 Sessões)', amount: '480,00' },
    ],
  },
  {
    id: 'transport',
    name: 'Transporte (Leva & Traz)',
    category: 'Transporte',
    description: 'Transporte privativo climatizado com caixas seguras individualizadas, motoristas especializados e pontualidade garantida para o seu pet.',
    rule: 'Cobrança por raio/zona ou trajeto',
    icon: 'car',
    layout: 'grid',
    rates: [
      { label: 'Raio até 10km', amount: '45,00' },
      { label: 'Raio até 20km', amount: '75,00' },
    ],
  },
];

const CATEGORIES = ['Estética & Spa', 'Hospedagem', 'Day Care', 'Transporte'];

function Icon({ name, size = 20, color = colors.primary }) {
  const common = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    back: <Path d="M15 18 9 12l6-6M9 12h12" {...common} />,
    bell: <><Path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" {...common} /><Path d="M10 21h4" {...common} /></>,
    profile: <><Circle cx="12" cy="8" r="3" {...common} /><Path d="M5 20c.6-3.3 2.8-5 7-5s6.4 1.7 7 5H5Z" {...common} /></>,
    medal: <><Circle cx="12" cy="9" r="7" {...common} /><Path d="m8 15-1 7 5-3 5 3-1-7M12 5.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5L11 7.5l1-2Z" {...common} /></>,
    check: <><Circle cx="12" cy="12" r="9" {...common} /><Path d="m8 12 2.5 2.5L16 9" {...common} /></>,
    categories: <><Path d="m12 3 4 7H8l4-7ZM5 14h5v6H5zM14 14h5v6h-5z" {...common} /></>,
    sliders: <><Path d="M4 6h16M4 12h16M4 18h16M8 4v4m8 2v4m-5 2v4" {...common} /></>,
    plus: <Path d="M12 5v14M5 12h14" {...common} />,
    search: <><Circle cx="10.8" cy="10.8" r="6.8" {...common} /><Path d="m16 16 5 5" {...common} /></>,
    bath: <><Path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3ZM6 12V7a3 3 0 0 1 5.8-1M8 17v.1M12 17v.1M16 17v.1" {...common} /></>,
    scissors: <><Circle cx="6" cy="6" r="2.5" {...common} /><Circle cx="6" cy="18" r="2.5" {...common} /><Path d="m8 8 12 12M8 16 20 4M13 11l3-3" {...common} /></>,
    bed: <><Path d="M3 19V5M3 15h18v4M3 10h6a4 4 0 0 1 4 4v1M13 11h8v4M6 10V7h3v3" {...common} /></>,
    sun: <><Circle cx="12" cy="12" r="4" {...common} /><Path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" {...common} /></>,
    leaf: <><Path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-7 8-16Z" {...common} /><Path d="M5 21c3-5 6-8 11-11" {...common} /></>,
    car: <><Path d="m5 11 2-5h10l2 5M3 11h18v7H3zM5 18v2m14-2v2M6 14h.1m11.8 0h.1" {...common} /></>,
    edit: <><Path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4 4 16.5Z" {...common} /><Path d="m14.8 5.7 3.5 3.5" {...common} /></>,
    shield: <><Path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" {...common} /><Path d="m8.5 12 2.2 2.2 4.8-5" {...common} /></>,
    save: <><Path d="M5 3h12l4 4v14H3V3h2ZM7 3v6h10V3M7 21v-8h10v8" {...common} /></>,
    sync: <><Path d="M20 7v5h-5M4 17v-5h5" {...common} /><Path d="M5.5 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.5-3" {...common} /></>,
    close: <Path d="m6 6 12 12M18 6 6 18" {...common} />,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      {paths[name] || paths.categories}
    </Svg>
  );
}

function Currency({ amount, unit }) {
  return (
    <View style={styles.currencyLine}>
      <Text style={styles.currencyPrefix}>R$</Text>
      <Text style={styles.amount}>{amount}</Text>
      {unit ? <Text style={styles.unit}>{unit}</Text> : null}
    </View>
  );
}

function RateList({ service }) {
  if (!service.rates?.length) return null;

  if (service.layout === 'grid') {
    return (
      <View style={styles.rateGrid}>
        {service.rates.map((rate) => (
          <View key={rate.label} style={styles.gridRate}>
            <Text numberOfLines={1} style={styles.rateLabel}>{rate.label}</Text>
            <Currency amount={rate.amount} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.rateRows}>
      {service.rates.map((rate) => (
        <View key={rate.label} style={styles.rateRow}>
          <View style={styles.rateCopy}>
            <Text numberOfLines={1} style={styles.rateName}>{rate.label}</Text>
            {rate.detail ? <Text numberOfLines={1} style={styles.rateDetail}>{rate.detail}</Text> : null}
          </View>
          <Currency amount={rate.amount} unit={rate.unit} />
        </View>
      ))}
    </View>
  );
}

function ServiceCard({ service, onEdit }) {
  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeading}>
        <View style={styles.serviceIconBox}><Icon name={service.icon || 'categories'} size={22} /></View>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${service.name}`}
          onPress={onEdit}
          style={styles.editButton}
          hitSlop={6}
        >
          <Icon name="edit" size={16} />
        </Pressable>
      </View>
      {service.description ? <Text style={styles.serviceDescription}>{service.description}</Text> : null}
      {service.rule ? (
        <View style={styles.ruleTag}>
          <Icon name={service.icon === 'car' ? 'categories' : 'sliders'} size={13} color={colors.brown} />
          <Text style={styles.ruleText}>{service.rule}</Text>
        </View>
      ) : null}
      <RateList service={service} />
    </View>
  );
}

export default function ChargesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Estética & Spa');
  const [formRates, setFormRates] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const filteredServices = useMemo(() => services.filter((service) => {
    const matchesCategory = activeCategory === 'Todos' || service.category === activeCategory;
    const term = query.trim().toLocaleLowerCase('pt-BR');
    const matchesQuery = !term || `${service.name} ${service.category} ${service.description}`
      .toLocaleLowerCase('pt-BR')
      .includes(term);
    return matchesCategory && matchesQuery;
  }), [activeCategory, query, services]);

  const openEdit = (service) => {
    setEditingService(service);
    setFormName(service?.name || '');
    setFormDescription(service?.description || '');
    setFormCategory(service?.category || 'Estética & Spa');
    setFormRates(service?.rates?.map((rate) => ({ ...rate })) || []);
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setEditingService(null);
  };

  const saveForm = () => {
    if (!formName.trim()) {
      Alert.alert('Nome obrigatório', 'Informe o nome do serviço para continuar.');
      return;
    }

    const validRates = formRates
      .filter((rate) => rate.label.trim() && rate.amount.trim())
      .map((rate) => ({ ...rate, label: rate.label.trim(), amount: rate.amount.trim() }));

    if (editingService) {
      setServices((current) => current.map((service) => (
        service.id === editingService.id
          ? { ...service, name: formName.trim(), description: formDescription.trim(), rates: validRates }
          : service
      )));
    } else {
      setServices((current) => [...current, {
        id: `local-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        rule: '',
        icon: 'categories',
        layout: 'rows',
        rates: validRates,
      }]);
      setActiveCategory('Todos');
    }

    setSavedMessage('');
    closeForm();
  };

  const openAdd = () => openEdit(null);
  const handleBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
    else navigation?.navigate('Home');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={handleBack} style={styles.backButton}>
          <Icon name="back" size={23} color="#1A1C1C" />
        </Pressable>
        <Text style={styles.headerTitle}>Painel Admin</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificações"
            onPress={() => Alert.alert('Notificações', 'Nenhuma notificação nova.')}
            style={styles.notificationButton}
          >
            <Icon name="bell" size={22} color="#332522" />
            <View style={styles.notificationDot} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Perfil do administrador"
            onPress={() => navigation?.navigate('Profile')}
            style={styles.profileButton}
          >
            <Icon name="profile" size={20} color={colors.white} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 30 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopline}>
            <View style={styles.heroPill}>
              <Icon name="medal" size={14} color={colors.brown} />
              <Text style={styles.heroPillText}>SERVIÇOS E PREÇOS</Text>
            </View>
            <Text style={styles.managementYear}>Gestão{'\n'}2024</Text>
          </View>
          <Text style={styles.heroTitle}>Nova Cobrança</Text>
          <Text style={styles.heroDescription}>Tabela central de tarifas, planos e parâmetros de faturamento do resort.</Text>
          <View style={styles.heroDivider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>ATIVOS</Text>
              <View style={styles.summaryValue}><Icon name="check" size={16} color="#2D5A43" /><Text style={styles.summaryNumber}>{services.length}</Text></View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>CATEGORIAS</Text>
              <View style={styles.summaryValue}><Icon name="categories" size={16} color={colors.brown} /><Text style={styles.summaryNumber}>4</Text></View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>TARIFAÇÃO</Text>
              <View style={styles.summaryValue}><Icon name="sliders" size={16} /><Text style={styles.flexibleText}>Flexível</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.activeServicesPill}><View style={styles.activeDot} /><Text style={styles.activeServicesText}>{services.length} serviços em vigor</Text></View>
          <Pressable accessibilityRole="button" onPress={openAdd} style={styles.addButton}>
            <Icon name="plus" size={18} color={colors.white} /><Text style={styles.addButtonText}>Adicionar serviço</Text>
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#887E7B" />
          <TextInput
            accessibilityLabel="Buscar serviço pelo nome ou categoria"
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar serviço pelo nome ou categoria..."
            placeholderTextColor="#9B9290"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {['Todos', ...CATEGORIES].map((category) => {
            const selected = activeCategory === category;
            const label = category === 'Todos' ? `Todos (${services.length})` : category;
            return (
              <Pressable
                key={category}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setActiveCategory(category)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.servicesList}>
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} onEdit={() => openEdit(service)} />
          ))}
          {!filteredServices.length ? <Text style={styles.emptyState}>Nenhum serviço encontrado.</Text> : null}
        </View>

        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}><Icon name="shield" size={23} color={colors.brown} /></View>
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>Preços de Referência Customizáveis</Text>
            <Text style={styles.noticeText}>Os valores cadastrados acima funcionam como base de tabela. Na emissão de cobranças avulsas ou faturas de clientes, o administrador tem total liberdade para ajustar valores, aplicar descontos de cortesia ou adicionar serviços especiais.</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setSavedMessage('Alterações mantidas localmente nesta sessão. A persistência real depende da integração com o módulo de Faturamento.')}
          style={styles.saveButton}
        >
          <Icon name="save" size={17} color={colors.white} />
          <Text style={styles.saveButtonText}>Salvar alterações</Text>
        </Pressable>
        <View style={styles.syncRow}><Icon name="sync" size={11} color="#827876" /><Text style={styles.syncText}>Sincronizado com o módulo de Faturamento</Text></View>
        {savedMessage ? <Text accessibilityLiveRegion="polite" style={styles.savedMessage}>{savedMessage}</Text> : null}
      </ScrollView>

      <Modal visible={formVisible} transparent animationType="fade" onRequestClose={closeForm}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeading}>
                <Text style={styles.modalTitle}>{editingService?.id ? 'Editar serviço' : 'Adicionar serviço'}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={closeForm} style={styles.modalClose}>
                  <Icon name="close" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
              <Text style={styles.fieldLabel}>Nome do serviço</Text>
              <TextInput value={formName} onChangeText={setFormName} placeholder="Nome" style={styles.formInput} maxLength={60} />
              {!editingService?.id ? (
                <>
                  <Text style={styles.fieldLabel}>Categoria</Text>
                  <View style={styles.formCategories}>
                    {CATEGORIES.map((category) => (
                      <Pressable key={category} onPress={() => setFormCategory(category)} style={[styles.formCategory, formCategory === category && styles.formCategorySelected]}>
                        <Text style={[styles.formCategoryText, formCategory === category && styles.formCategoryTextSelected]}>{category}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}
              <Text style={styles.fieldLabel}>Descrição</Text>
              <TextInput value={formDescription} onChangeText={setFormDescription} placeholder="Descrição do serviço" style={[styles.formInput, styles.descriptionInput]} multiline textAlignVertical="top" maxLength={220} />
              <Text style={styles.fieldLabel}>Valores e modalidades</Text>
              <View style={styles.editRates}>
                {formRates.map((rate, index) => (
                  <View key={`${rate.label}-${index}`} style={styles.editRateRow}>
                    <TextInput
                      accessibilityLabel={`Modalidade ${index + 1}`}
                      value={rate.label}
                      onChangeText={(label) => setFormRates((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label } : item))}
                      placeholder="Modalidade"
                      style={[styles.formInput, styles.rateLabelInput]}
                      maxLength={42}
                    />
                    <TextInput
                      accessibilityLabel={`Preço ${index + 1}`}
                      value={rate.amount}
                      onChangeText={(amount) => setFormRates((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, amount } : item))}
                      placeholder="0,00"
                      keyboardType="decimal-pad"
                      style={[styles.formInput, styles.rateAmountInput]}
                      maxLength={12}
                    />
                    <TextInput
                      accessibilityLabel={`Unidade ${index + 1}`}
                      value={rate.unit || ''}
                      onChangeText={(unit) => setFormRates((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, unit } : item))}
                      placeholder="/ dia"
                      style={[styles.formInput, styles.rateUnitInput]}
                      maxLength={10}
                    />
                    <Pressable accessibilityRole="button" accessibilityLabel={`Remover valor ${rate.label}`} onPress={() => setFormRates((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={styles.removeRateButton}>
                      <Icon name="close" size={16} color={colors.primary} />
                    </Pressable>
                  </View>
                ))}
              </View>
              <Pressable accessibilityRole="button" onPress={() => setFormRates((current) => [...current, { label: '', amount: '', unit: '' }])} style={styles.addRateButton}>
                <Icon name="plus" size={15} color={colors.primary} />
                <Text style={styles.addRateText}>Adicionar modalidade/preço</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={saveForm} style={styles.modalSaveButton}>
                <Text style={styles.modalSaveText}>{editingService?.id ? 'Salvar edição local' : 'Adicionar localmente'}</Text>
              </Pressable>
              <Text style={styles.modalDisclaimer}>As alterações ficam nesta sessão e não são enviadas a um servidor.</Text>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}