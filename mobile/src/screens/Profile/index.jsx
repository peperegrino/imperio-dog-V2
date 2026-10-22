import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { styles } from './styles';

const initialProfile = {
  name: 'Mariana Oliveira',
  email: 'mariana.oliveira@email.com',
  phone: '(11) 99999-4321',
  cpf: '***.492.188-**',
  address: 'Jardins, São Paulo - SP',
};

const icons = {
  back: '<path d="M14 5 7 12l7 7M8 12h12" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" fill="none" stroke="COLOR" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  user: '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0H4Z" fill="COLOR"/>',
  edit: '<path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4 4 16.5Zm14-14 3.5 3.5" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  shield: '<path d="m12 2 8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5l8-3Zm-3 9 2 2 4-4" fill="none" stroke="COLOR" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  paw: '<path d="M7 9C5.7 9 5 7.6 5 6s.8-3 2-3 2 1.4 2 3-.8 3-2 3Zm10 0c-1.2 0-2-1.4-2-3s.8-3 2-3 2 1.4 2 3-.7 3-2 3ZM4 14c-1.2 0-2-1.2-2-2.5S2.8 9 4 9s2 1.2 2 2.5S5.2 14 4 14Zm16 0c-1.2 0-2-1.2-2-2.5S18.8 9 20 9s2 1.2 2 2.5S21.2 14 20 14Zm-8 7c-3.2 0-6-1.3-6-3.6 0-1.7 2.1-3.2 3.5-4.4.8-.7 1.5-1 2.5-1s1.7.3 2.5 1c1.4 1.2 3.5 2.7 3.5 4.4 0 2.3-2.8 3.6-6 3.6Z" fill="COLOR"/>',
  dog: '<path d="M0.85 20V10.125H2.85V18H9.85V13.175L12.475 10.55C12.9583 10.0667 13.3333 9.525 13.6 8.925C13.8667 8.325 14 7.68333 14 7C14 6.33333 13.8625 5.7 13.5875 5.1C13.3125 4.5 12.9417 3.95833 12.475 3.475L11.85 2.825L8.675 6H4.675L3.6 7.075L2.175 5.675L3.85 4H7.85L11.85 0L13.9 2.05C14.5667 2.71667 15.0833 3.47083 15.45 4.3125C15.8167 5.15417 16 6.05 16 7C16 7.95 15.8167 8.84583 15.45 9.6875C15.0833 10.5292 14.5667 11.2833 13.9 11.95L11.85 14V20H0.85V20M5.775 15.325L0.575 10.125C0.391667 9.94167 0.25 9.725 0.15 9.475C0.05 9.225 0 8.96667 0 8.7C0 8.43333 0.05 8.17917 0.15 7.9375C0.25 7.69583 0.391667 7.48333 0.575 7.3L2.675 5.175L5.775 8.25C6.24167 8.71667 6.60417 9.25417 6.8625 9.8625C7.12083 10.4708 7.25 11.1083 7.25 11.775C7.25 12.4417 7.125 13.0792 6.875 13.6875C6.625 14.2958 6.25833 14.8417 5.775 15.325V15.325" fill="COLOR"/>',
  rabbit: '<path d="M8 9 6 2c-.3-1.2-2-1-2 .3L5 10a6 6 0 1 0 10 0l1-7.7c0-1.3-1.7-1.5-2-.3l-2 7M9 15h.1m5.8 0h.1M10 18c1.3.8 2.7.8 4 0" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round"/>',
  email: '<path d="M3 5h18v14H3V5Zm0 1 9 7 9-7" fill="none" stroke="COLOR" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  phone: '<path d="M7 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-2l-5-2-2 3a14 14 0 0 1-7-7l3-2-3-6Z" fill="none" stroke="COLOR" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  home: '<path d="m3 10 9-7 9 7v10h-6v-6H9v6H3V10Z" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linejoin="round"/>',
  receipt: '<path d="M6 2 8 4l2-2 2 2 2-2 2 2 2-2v20l-2-2-2 2-2-2-2 2-2-2-2 2V2Zm3 7h6m-6 4h6m-6 4h4" fill="none" stroke="COLOR" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  history: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8m0-5v5h5m4-1v5l3 2" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  lock: '<rect x="4" y="10" width="16" height="12" rx="2" fill="none" stroke="COLOR" stroke-width="1.7"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" fill="none" stroke="COLOR" stroke-width="1.7" stroke-linecap="round"/>',
  key: '<circle cx="8" cy="15" r="4" fill="none" stroke="COLOR" stroke-width="1.8"/><path d="m11 12 8-8 2 2-2 2 2 2-2 2-2-2-3 3" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linejoin="round"/>',
  settings: '<path d="M4 6h16M4 12h16M4 18h16M8 4v4m8 2v4m-5 2v4" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round"/>',
  clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="COLOR" stroke-width="1.8"/><path d="M12 7v5l3 2" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round"/>',
  document: '<path d="M6 2h9l4 4v16H6V2Zm9 0v5h4M9 12h7m-7 4h7" fill="none" stroke="COLOR" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>',
  logout: '<path d="M10 4H4v16h6m4-4 4-4-4-4m4 4H8" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  chevron: '<path d="m9 5 7 7-7 7" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="m5 12 4 4L19 6" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
};

function ProfileIcon({ name, size = 18, color = colors.primary }) {
  const isThorIcon = name === 'dog';
  const width = isThorIcon ? size * 0.8 : size;
  const viewBox = isThorIcon ? '0 0 16 20' : '0 0 24 24';
  const xml = `<svg width="${width}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${icons[name].replaceAll('COLOR', color)}</svg>`;
  return <SvgXml width={width} height={size} xml={xml} />;
}

function SectionTitle({ icon, children, trailing, headingStyle }) {
  return (
    <View style={[styles.sectionHeading, headingStyle]}>
      <ProfileIcon name={icon} size={15} />
      <Text style={styles.sectionTitle}>{children}</Text>
      {trailing}
    </View>
  );
}

function PetCard({ name, breed, size, icon, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${breed}, ${size}`}
      onPress={onPress}
      style={({ pressed }) => [styles.petCard, pressed && styles.pressed]}
    >
      <View style={styles.petIconBox}><ProfileIcon name={icon} size={20} /></View>
      <View style={styles.petText}>
        <Text style={styles.petName}>{name}</Text>
        <Text style={styles.petDetail}>{breed}</Text>
        <Text style={styles.petDetail}>{size}</Text>
      </View>
      <ProfileIcon name="chevron" size={14} color="#B58C63" />
    </Pressable>
  );
}

function ProfileField({ label, value, icon, editing, onChangeText, last = false }) {
  return (
    <View style={[styles.profileField, last && styles.profileFieldLast]}>
      <View style={styles.profileFieldText}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {editing ? (
          <TextInput
            accessibilityLabel={label}
            autoCapitalize={label === 'E-MAIL DE CONTATO' ? 'none' : 'words'}
            keyboardType={label === 'E-MAIL DE CONTATO' ? 'email-address' : 'default'}
            onChangeText={onChangeText}
            style={styles.fieldInput}
            value={value}
          />
        ) : <Text style={styles.fieldValue}>{value}</Text>}
      </View>
      <ProfileIcon name={icon} size={15} color={icon === 'shield' ? '#2D5A43' : '#B58C63'} />
    </View>
  );
}

function PreferenceRow({ icon, title, subtitle, onPress, last = false, children }) {
  return (
    <Pressable
      accessibilityRole={children ? 'switch' : 'button'}
      onPress={onPress}
      style={({ pressed }) => [styles.preferenceRow, last && styles.lastPreferenceRow, pressed && styles.pressed]}
    >
      <View style={styles.preferenceIcon}><ProfileIcon name={icon} size={16} /></View>
      <View style={styles.preferenceText}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        {subtitle ? <Text style={styles.preferenceSubtitle}>{subtitle}</Text> : null}
      </View>
      {children || <ProfileIcon name="chevron" size={13} color="#B58C63" />}
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const showUnavailable = (feature) => Alert.alert(feature, 'Essa opção ainda não está disponível no aplicativo.');
  const navigateToPets = () => navigation.navigate('Pets');

  const handleLogout = () => Alert.alert('Sair da conta?', 'Você poderá entrar novamente pela tela de acesso.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Sair', style: 'destructive', onPress: () => navigation.navigate('Login') },
  ]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.goBack()} style={styles.headerBack}>
          <ProfileIcon name="back" size={20} color="#1A1C1C" />
        </Pressable>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Notificações" onPress={() => showUnavailable('Notificações')} style={styles.headerAction}>
            <ProfileIcon name="bell" size={18} color="#332522" />
            <View style={styles.notificationDot} />
          </Pressable>
          <View style={styles.headerAvatar}><ProfileIcon name="user" size={15} color={colors.white} /></View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageIntro}>
          <Text style={styles.pageTitle}>Meu Perfil</Text>
          <Text style={styles.pageDescription}>Gerencie suas informações e preferências.</Text>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.identityCardTop}>
            <View style={styles.vipBadge}>
              <ProfileIcon name="shield" size={11} color="#B58C63" />
              <Text style={styles.vipText}>VIP</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Alterar foto de perfil" onPress={() => showUnavailable('Foto de perfil')} style={styles.smallEditButton}>
              <ProfileIcon name="edit" size={13} />
            </Pressable>
          </View>
          <View style={styles.identityCenter}>
            <View style={styles.initialsAvatar}><Text style={styles.initials}>MO</Text></View>
            <View style={styles.verifiedBadge}><ProfileIcon name="check" size={11} color={colors.white} /></View>
            <Text style={styles.identityName}>{profile.name}</Text>
            <Text style={styles.memberSince}><Text style={styles.memberBullet}>• </Text>Membro VIP desde Março/2026</Text>
          </View>
          <View style={styles.identityDivider} />
          <View style={styles.contactPill}>
            <ProfileIcon name="email" size={14} color="#B58C63" />
            <Text style={styles.contactValue}>{profile.email}</Text>
          </View>
          <View style={styles.contactPill}>
            <ProfileIcon name="phone" size={14} color="#B58C63" />
            <Text style={styles.contactValue}>{profile.phone}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle icon="paw" headingStyle={styles.petsHeading}>MEUS PETS</SectionTitle>
          <PetCard name="Thor" breed="Golden Retriever" size="Grande (32kg)" icon="dog" onPress={navigateToPets} />
          <PetCard name="Maya" breed="Cavalier King Charles" size="Pequeno (8kg)" icon="rabbit" onPress={navigateToPets} />
          <Pressable accessibilityRole="button" onPress={navigateToPets} style={({ pressed }) => [styles.addPetButton, pressed && styles.pressed]}>
            <ProfileIcon name="plus" size={14} />
            <Text style={styles.addPetText}>Adicionar novo pet</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <SectionTitle
            icon="user"
            trailing={<View style={styles.protectedLabel}><ProfileIcon name="lock" size={11} color="#2D5A43" /><Text style={styles.protectedText}>Protegido</Text></View>}
          >DADOS PESSOAIS &amp; CADASTRO</SectionTitle>
          <View style={styles.detailsCard}>
            <ProfileField label="NOME COMPLETO" value={profile.name} icon="user" editing={editing} onChangeText={(value) => setProfile({ ...profile, name: value })} />
            <ProfileField label="E-MAIL DE CONTATO" value={profile.email} icon="email" editing={editing} onChangeText={(value) => setProfile({ ...profile, email: value })} />
            <ProfileField label="TELEFONE / WHATSAPP" value={profile.phone} icon="phone" editing={editing} onChangeText={(value) => setProfile({ ...profile, phone: value })} />
            <ProfileField label="CPF" value={profile.cpf} icon="shield" editing={editing} onChangeText={(value) => setProfile({ ...profile, cpf: value })} />
            <ProfileField label="ENDEREÇO RESIDENCIAL" value={profile.address} icon="home" editing={editing} onChangeText={(value) => setProfile({ ...profile, address: value })} last />
          </View>
          <Pressable accessibilityRole="button" onPress={() => setEditing(!editing)} style={({ pressed }) => [styles.editDataButton, pressed && styles.pressed]}>
            <ProfileIcon name={editing ? 'check' : 'edit'} size={15} />
            <Text style={styles.editDataText}>{editing ? 'Salvar dados' : 'Editar dados'}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <SectionTitle icon="lock">SEGURANÇA</SectionTitle>
          <PreferenceRow icon="key" title="Alterar senha" onPress={() => showUnavailable('Alterar senha')} />
        </View>

        <View style={styles.section}>
          <SectionTitle icon="settings">CONFIGURAÇÕES &amp; PREFERÊNCIAS</SectionTitle>
          <View style={styles.preferencesCard}>
            <PreferenceRow icon="receipt" title="Dados para emissão de Boletos" subtitle="Boleto bancário registrado CIP (Único método)" onPress={() => showUnavailable('Dados para emissão de boletos')} />
            <PreferenceRow icon="clock" title="Segurança e senha" subtitle="Autenticação biométrica ativa" onPress={() => showUnavailable('Segurança e senha')} />
            <PreferenceRow
              icon="bell"
              title="Notificações e lembretes"
              subtitle="Alertas de hospedagem e cobrança"
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <Switch
                accessibilityLabel="Notificações e lembretes"
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#D8CFCA', true: colors.primary }}
                thumbColor={colors.white}
                value={notificationsEnabled}
              />
            </PreferenceRow>
            <PreferenceRow icon="document" title="Termos de uso e privacidade" onPress={() => showUnavailable('Termos de uso e privacidade')} last />
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={handleLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
          <ProfileIcon name="logout" size={15} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
        <View style={styles.footer}>
          <View style={styles.footerTitleRow}>
            <ProfileIcon name="shield" size={12} color="#534343" />
            <Text style={styles.footerTitle}>Ambiente seguro • Dados protegidos</Text>
          </View>
          <Text style={styles.footerDescription}>Império Dog Resort • Atendimento exclusivo</Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Home')} style={styles.tabItem}>
          <ProfileIcon name="home" size={18} color="#6E5B58" />
          <Text style={styles.tabLabel}>Início</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Charges')} style={styles.tabItem}>
          <ProfileIcon name="receipt" size={18} color="#6E5B58" />
          <Text style={styles.tabLabel}>Faturas</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => showUnavailable('Histórico')} style={styles.tabItem}>
          <ProfileIcon name="history" size={18} color="#6E5B58" />
          <Text style={styles.tabLabel}>Histórico</Text>
        </Pressable>
        <View accessibilityRole="tab" accessibilityState={{ selected: true }} style={styles.tabItem}>
          <ProfileIcon name="user" size={18} />
          <Text style={styles.activeTabLabel}>Perfil</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}