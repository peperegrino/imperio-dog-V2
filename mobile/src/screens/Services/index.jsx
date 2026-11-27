import StandardBackIcon from '../../components/StandardBackIcon';
import { useState } from 'react';
import {
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

import { api } from '../../services/api';
import { ResourceState, useResource } from '../../components/ConnectedUI';
import { showConfirm } from '../../utils/alert';
import { styles } from './styles';



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

export default function ServicesScreen({ navigation, route }) {
  const homeRoute = route.params?.homeRoute || 'Admin';
  const insets = useSafeAreaInsets();
  const resource = useResource('/admin/services');
  const services = (resource.data || []).map((service) => ({
    ...service, icon: 'categories', layout: 'rows',
    rates: [{ label: 'Preço', amount: String(service.price), unit: '' }],
  }));
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [price, setPrice] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const filteredServices = services.filter((service) =>
    [service.name, service.description].filter(Boolean).join(' ')
      .toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'))
  );

  const openEdit = (service) => {
    setEditingService(service);
    setFormName(service?.name || '');
    setFormDescription(service?.description || '');
    setPrice(service ? String(service.price) : '');
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setEditingService(null);
  };

  async function saveForm() {
    if (busy) return;
    const amount = Number(price.trim().replace(',', '.'));
    if (!formName.trim() || !price.trim() || !Number.isFinite(amount) || amount <= 0) {
      setSavedMessage('Informe o nome e um preço válido.');
      return;
    }
    const payload = { name: formName.trim(), description: formDescription.trim(), price: amount };
    setBusy(true);
    try {
      if (editingService) await api.put('/admin/services/' + editingService.id, payload);
      else await api.post('/admin/services', payload);
      await resource.reload();
      setSavedMessage('Serviço salvo.');
      closeForm();
    } catch (error) {
      setSavedMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteService() {
    if (busy || !editingService || !await showConfirm('Excluir serviço?', editingService.name)) return;
    setBusy(true);
    try {
      await api.delete('/admin/services/' + editingService.id);
      await resource.reload();
      setSavedMessage('Serviço excluído.');
      closeForm();
    } catch (error) {
      setSavedMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  const openAdd = () => openEdit(null);
  const handleBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
    else navigation?.navigate(homeRoute, { homeRoute });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={handleBack} style={styles.backButton}>
          <StandardBackIcon />
        </Pressable>
        <Text style={styles.headerTitle}>Serviços e preços</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Perfil do administrador"
            onPress={() => navigation?.navigate('Profile', { homeRoute })}
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
          </View>
          <Text style={styles.heroTitle}>Serviços e preços</Text>
          <Text style={styles.heroDescription}>Tabela central de tarifas, planos e parâmetros de faturamento do resort.</Text>
          <View style={styles.heroDivider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>ATIVOS</Text>
              <View style={styles.summaryValue}><Icon name="check" size={16} color="#2D5A43" /><Text style={styles.summaryNumber}>{services.length}</Text></View>
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
            accessibilityLabel="Buscar serviço pelo nome"
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar serviço pelo nome..."
            placeholderTextColor="#9B9290"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          <Text style={styles.savedMessage}>{services.length} serviços</Text>
        </ScrollView>

        <View style={styles.servicesList}>
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} onEdit={() => openEdit(service)} />
          ))}
          {!resource.loading && !resource.error && !filteredServices.length ? <Text style={styles.emptyState}>Nenhum serviço encontrado.</Text> : null}
        </View>

        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}><Icon name="shield" size={23} color={colors.brown} /></View>
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>Preços de Referência Customizáveis</Text>
            <Text style={styles.noticeText}>O preço cadastrado é usado no cálculo de novas cobranças.</Text>
          </View>
        </View>

        <ResourceState resource={resource} />
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
              <Text style={styles.fieldLabel}>Descrição</Text>
              <TextInput value={formDescription} onChangeText={setFormDescription} placeholder="Descrição do serviço" style={[styles.formInput, styles.descriptionInput]} multiline textAlignVertical="top" maxLength={220} />
              <Text style={styles.fieldLabel}>Valores e modalidades</Text>
                <TextInput accessibilityLabel="Preço em reais" value={price} onChangeText={setPrice}
                  keyboardType="decimal-pad" style={styles.formInput} placeholder="Preço em reais" />
                {savedMessage ? <Text accessibilityRole="alert">{savedMessage}</Text> : null}
                {editingService && (
                  <Pressable accessibilityRole="button" disabled={busy} onPress={deleteService}>
                    <Text>Excluir serviço</Text>
                  </Pressable>
                )}
              <Pressable accessibilityRole="button" disabled={busy} onPress={saveForm} style={styles.modalSaveButton}>
                <Text style={styles.modalSaveText}>{editingService?.id ? 'Salvar edição' : 'Adicionar serviço'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
