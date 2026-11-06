import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import Button from '../../components/Button';
import ServiceItemCard from '../../components/ServiceItemCard';
import AppNavigation, { ProfileButton } from '../../components/AppNavigation';
import { colors } from '../../theme/colors';
import { initialDueDate, initialServices, client, pet } from './managementData';
import { bellXml } from '../Home/svgIcons';
import {
  addXml,
  calendarClockXml,
  calendarEditXml,
  calendarXml,
  checklistXml,
  identificationXml,
  infoXml,
  receiptXml,
  serviceXml,
  swapXml,
} from './managementIcons';
import { styles } from './managementStyles';

const quickDeadlines = [3, 7, 15];

function Icon({ xml, size = 15, color = colors.primary }) {
  const coloredXml = xml.replace(
    /fill="(?:#[A-Fa-f0-9]+|currentColor)"/g,
    `fill="${color}"`,
  );
  return <SvgXml height={size} width={size} xml={coloredXml} />;
}

function formatCurrency(cents) {
  return `R$ ${(cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function parseDate(value) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
}

function dateAfterDays(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function SectionTitle({ icon, title, trailing }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleMain}>
        <Icon xml={icon} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {trailing}
    </View>
  );
}

function ManagementHeader({ navigation }) {
  return (
    <BlurView intensity={18} tint="light" style={styles.headerBlur}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          onPress={() =>
            navigation.canGoBack()
              ? navigation.goBack()
              : navigation.navigate('Admin')
          }
          style={styles.headerSideButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Cobrança</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Notificações"
            accessibilityRole="button"
            onPress={() =>
              Alert.alert('Notificações', 'Você não tem notificações novas.')
            }
            style={styles.notificationButton}
          >
            <Icon
              color="#332522"
              size={18}
              xml={bellXml}
            />
            <View style={styles.notificationDot} />
          </Pressable>
          <ProfileButton
            backgroundColor="#561922"
            onPress={() =>
              navigation.navigate('Profile', { homeRoute: 'Admin' })
            }
            size={32}
            iconSize={12}
          />
        </View>
      </View>
    </BlurView>
  );
}

function CustomerCard({ onChangeTutor, onChangePet }) {
  return (
    <View style={styles.customerCard}>
      <View style={styles.customerRow}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerInitials}>{client.initials}</Text>
        </View>
        <View style={styles.customerDetails}>
          <View style={styles.customerNameRow}>
            <Text style={styles.customerName}>{client.name}</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Ativo</Text>
            </View>
          </View>
          <Text style={styles.customerCpf}>{client.cpf}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onChangeTutor}
          style={styles.outlineButton}
        >
          <Text style={styles.outlineButtonText}>Alterar</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.petCard}>
        <View style={styles.petAvatar}>
          <Text style={styles.petEmoji}>🐶</Text>
        </View>
        <View style={styles.petDetails}>
          <Text style={styles.petName}>{pet.name}</Text>
          <View style={styles.breedChip}>
            <Text style={styles.breedChipText}>{pet.breed}</Text>
          </View>
          <View style={styles.petMetaRow}>
            <Text style={styles.petMeta}>{pet.size}</Text>
            <Text style={styles.petSeparator}>•</Text>
            <Text style={styles.petSuite}>{pet.suite}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onChangePet}
          style={styles.swapButton}
        >
          <Icon size={13} xml={swapXml} />
          <Text style={styles.swapButtonText}>Trocar pet</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DueDateCard({ dueDate, quickDeadline, onQuickDeadline, onOpenDate }) {
  return (
    <View style={styles.whiteCard}>
      <View style={styles.dueDateHeading}>
        <SectionTitle
          icon={calendarClockXml}
          title="VENCIMENTO DO BOLETO"
          trailing={
            <View style={styles.beigeChip}>
              <Text style={styles.beigeChipText}>5 dias úteis</Text>
            </View>
          }
        />
      </View>

      <View style={styles.datePanel}>
        <View style={styles.datePanelHeading}>
          <Text style={styles.fieldLabel}>DATA SELECIONADA</Text>
          <Text style={styles.dateHint}>Clique para alterar</Text>
        </View>
        <Pressable
          accessibilityLabel={`Alterar vencimento, ${formatDate(dueDate)}`}
          accessibilityRole="button"
          onPress={onOpenDate}
          style={styles.dateButton}
        >
          <View style={styles.dateIconBox}>
            <Icon size={15} xml={calendarXml} />
          </View>
          <Text style={styles.dateValue}>{formatDate(dueDate)}</Text>
          <Icon color="#A3A3A3" xml={calendarEditXml} />
        </Pressable>

        <Text style={styles.quickDeadlineLabel}>PRAZOS RÁPIDOS SUGERIDOS</Text>
        <View style={styles.quickDeadlineRow}>
          {quickDeadlines.map((days) => {
            const selected = quickDeadline === days;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={days}
                onPress={() => onQuickDeadline(days)}
                style={[
                  styles.quickDeadlineButton,
                  selected && styles.quickDeadlineButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.quickDeadlineText,
                    selected && styles.quickDeadlineTextActive,
                  ]}
                >
                  +{days} dias
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Text style={styles.dueDateHelp}>
        Prazo sugerido para compensação bancária prévia ao check-in no resort.
      </Text>
    </View>
  );
}

function SummaryCard({ services, dueDate, totalCents }) {
  return (
    <View style={styles.whiteCard}>
      <SectionTitle
        icon={checklistXml}
        title="RESUMO DA COBRANÇA"
        trailing={
          <View style={styles.itemCountPill}>
            <Text style={styles.itemCountText}>
              {services.length} {services.length === 1 ? 'Item' : 'Itens'}
            </Text>
          </View>
        }
      />
      <View style={styles.summaryLines}>
        {services.map((service) => (
          <View key={service.id} style={styles.summaryLine}>
            <Text numberOfLines={2} style={styles.summaryLabel}>
              {service.name} ({service.quantity}x)
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(service.unitCents * service.quantity)}
            </Text>
          </View>
        ))}
        <View style={styles.summaryLine}>
          <Text style={styles.summaryLabel}>Vencimento Definido</Text>
          <Text style={styles.summaryValue}>{formatDate(dueDate)}</Text>
        </View>
        <View style={styles.summaryLine}>
          <Text style={styles.summaryLabel}>Forma de Cobrança</Text>
          <Text style={styles.summaryValue}>Boleto</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.totalRow}>
        <View style={styles.totalCaption}>
          <Text style={styles.totalLabel}>VALOR TOTAL</Text>
          <Text style={styles.totalHint}>
            Sem juros ou encargos adicionais
          </Text>
        </View>
        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.totalAmount}>
          {formatCurrency(totalCents)}
        </Text>
      </View>
    </View>
  );
}

export default function ManagementChargesScreen({ navigation }) {
  const [services, setServices] = useState(initialServices);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [quickDeadline, setQuickDeadline] = useState(3);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(formatDate(initialDueDate));
  const [dateError, setDateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalCents = useMemo(
    () =>
      services.reduce(
        (total, service) => total + service.unitCents * service.quantity,
        0,
      ),
    [services],
  );

  function showUnavailableFlow(flowName) {
    Alert.alert(
      flowName,
      'O seletor será conectado quando a integração de cadastros estiver disponível.',
    );
  }

  function updateService(serviceId, updates) {
    setServices((currentServices) =>
      currentServices.map((service) =>
        service.id === serviceId ? { ...service, ...updates } : service,
      ),
    );
  }

  function chooseQuickDeadline(days) {
    setDueDate(dateAfterDays(days));
    setQuickDeadline(days);
  }

  function saveManualDate() {
    const parsedDate = parseDate(draftDate);
    if (!parsedDate) {
      setDateError('Informe uma data válida no formato dd/mm/aaaa.');
      return;
    }

    setDueDate(parsedDate);
    setQuickDeadline(null);
    setDateError('');
    setDateModalOpen(false);
  }

  function submitCharge() {
    if (services.length === 0 || totalCents <= 0 || !dueDate) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Emissão indisponível',
        'A integração com o serviço de boletos ainda não está configurada.',
      );
    }, 500);
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'top', 'bottom']}
      style={styles.screen}
    >
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <ManagementHeader navigation={navigation} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.pageTitle}>Serviços e Valores</Text>
          <Text style={styles.pageSubtitle}>
            Cadastre os serviços e emita o boleto bancário registrado para o
            tutor.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionTitle
            icon={identificationXml}
            title="DADOS DO CLIENTE"
            trailing={<Text style={styles.registrationStatus}>Registro ativo</Text>}
          />
          <CustomerCard
            onChangePet={() => showUnavailableFlow('Trocar pet')}
            onChangeTutor={() => showUnavailableFlow('Alterar tutor')}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.serviceSectionHeader}>
            <View style={styles.serviceSectionCopy}>
              <SectionTitle icon={serviceXml} title="SERVIÇOS DA COBRANÇA" />
              <Text style={styles.sectionSubtitle}>
                Valores e itens personalizáveis
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => showUnavailableFlow('Adicionar serviço')}
              style={styles.addButton}
            >
              <Icon size={9} xml={addXml} />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </Pressable>
          </View>
          {services.length ? (
            <View style={styles.serviceList}>
              {services.map((service) => (
                <ServiceItemCard
                  key={service.id}
                  onChangePrice={(unitCents, unitPriceText) =>
                    updateService(service.id, { unitCents, unitPriceText })
                  }
                  onChangeQuantity={(quantity) =>
                    updateService(service.id, { quantity })
                  }
                  onRemove={() =>
                    setServices((current) =>
                      current.filter((item) => item.id !== service.id),
                    )
                  }
                  service={service}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyServices}>
              <Text style={styles.emptyServicesText}>
                Nenhum serviço adicionado à cobrança.
              </Text>
            </View>
          )}
        </View>

        <DueDateCard
          dueDate={dueDate}
          onOpenDate={() => {
            setDraftDate(formatDate(dueDate));
            setDateError('');
            setDateModalOpen(true);
          }}
          onQuickDeadline={chooseQuickDeadline}
          quickDeadline={quickDeadline}
        />

        <SummaryCard
          dueDate={dueDate}
          services={services}
          totalCents={totalCents}
        />

        <View style={styles.finalActions}>
          <Button
            disabled={services.length === 0 || totalCents <= 0 || !dueDate}
            label="Gerar Cobrança e Emitir Boleto"
            leadingIcon={<Icon color="#FFFFFF" size={15} xml={receiptXml} />}
            loading={isSubmitting}
            onPress={submitCharge}
          />
          <View style={styles.reviewNote}>
            <Icon size={13} xml={infoXml} />
            <Text style={styles.reviewNoteText}>
              Revise os dados antes de registrar o boleto bancário.
            </Text>
          </View>
          <View style={styles.securityNote}>
            <View style={styles.securityDot} />
            <Text style={styles.securityText}>
              Ambiente Criptografado &amp; Seguro
            </Text>
          </View>
        </View>
        <View style={styles.bottomSpace} />
      </ScrollView>

      <AppNavigation
        activeRoute="Charges"
        homeRoute="Admin"
        navigation={navigation}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setDateModalOpen(false)}
        transparent
        visible={dateModalOpen}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.dateModal}>
            <Text style={styles.modalTitle}>Alterar vencimento</Text>
            <Text style={styles.modalSubtitle}>
              Digite a data desejada no formato dd/mm/aaaa.
            </Text>
            <TextInput
              accessibilityLabel="Data de vencimento"
              autoFocus
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(value) => {
                setDraftDate(value);
                setDateError('');
              }}
              placeholder="dd/mm/aaaa"
              placeholderTextColor="#A3A3A3"
              style={styles.dateInput}
              value={draftDate}
            />
            {dateError ? (
              <Text accessibilityRole="alert" style={styles.dateError}>
                {dateError}
              </Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDateModalOpen(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={saveManualDate}
                style={styles.modalSaveButton}
              >
                <Text style={styles.modalSaveText}>Salvar data</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
