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

const profileAvatarSvg = `<svg width="106" height="107" viewBox="0 0 106 107" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="profileAvatarGradient" x1="5" y1="2" x2="101" y2="98" gradientUnits="userSpaceOnUse"><stop stop-color="#722F37"/><stop offset="1" stop-color="#4A1F25"/></linearGradient></defs>
  <rect x="6" y="3" width="94" height="94" rx="47" fill="url(#profileAvatarGradient)"/><rect x="6" y="3" width="94" height="94" rx="47" stroke="white" stroke-width="2"/><rect x="5" y="2" width="96" height="96" rx="48" fill="none" stroke="#D9C2A6" stroke-width="2"/>
  <path d="M33.4642 60V42.12H36.5842L43.2862 51.216H41.7922L48.3442 42.12H51.4642V60H48.1942V45.846L49.4662 46.158L42.6562 55.2H42.2722L35.6482 46.158L36.7342 45.846V60H33.4642ZM63.7162 60.288C62.3962 60.288 61.1692 60.057 60.0352 59.595C58.9012 59.133 57.9112 58.484 57.0652 57.648C56.2192 56.812 55.5582 55.833 55.0822 54.711C54.6062 53.589 54.3682 52.368 54.3682 51.048C54.3682 49.728 54.6032 48.507 55.0732 47.385C55.5432 46.263 56.2012 45.287 57.0472 44.457C57.8932 43.627 58.8832 42.982 60.0172 42.522C61.1512 42.062 62.3842 41.832 63.7162 41.832C65.0482 41.832 66.2812 42.063 67.4152 42.525C68.5492 42.987 69.5392 43.633 70.3852 44.463C71.2312 45.293 71.8892 46.268 72.3592 47.388C72.8292 48.508 73.0642 49.728 73.0642 51.048C73.0642 52.368 72.8262 53.589 72.35 54.711C71.874 55.833 71.213 56.812 70.367 57.648C69.521 58.484 68.531 59.133 67.397 59.595C66.263 60.057 65.036 60.288 63.7162 60.288ZM63.7162 57.318C64.5882 57.318 65.3922 57.162 66.1282 56.85C66.8642 56.538 67.5082 56.101 68.06 55.539C68.612 54.977 69.0392 54.314 69.3412 53.55C69.6432 52.786 69.7942 51.952 69.7942 51.048C69.7942 50.148 69.6432 49.319 69.3412 48.561C69.0392 47.803 68.612 47.14 68.06 46.572C67.508 46.004 66.864 45.567 66.128 45.261C65.392 44.955 64.588 44.802 63.7162 44.802C62.844 44.802 62.04 44.955 61.304 45.261C60.568 45.567 59.924 46.004 59.372 46.572C58.82 47.14 58.393 47.803 58.091 48.561C57.789 49.319 57.638 50.148 57.638 51.048C57.638 51.952 57.789 52.786 58.091 53.55C58.393 54.314 58.82 54.977 59.372 55.539C59.924 56.101 60.569 56.538 61.307 56.85C62.045 57.162 62.848 57.318 63.7162 57.318Z" fill="white"/>
  <g><rect x="75" y="72" width="24" height="24" rx="12" fill="#2D5A43"/><rect x="76" y="73" width="22" height="22" rx="11" stroke="white" stroke-width="2"/><path d="M85.1582 89.6875L84.129 87.9542L82.179 87.5208L82.3686 85.5167L81.0415 84L82.3686 82.4833L82.179 80.4792L84.129 80.0458L85.1582 78.3125L86.9998 79.0979L88.8415 78.3125L89.8707 80.0458L91.8207 80.4792L91.6311 82.4833L92.9582 84L91.6311 85.5167L91.8207 87.5208L89.8707 87.9542L88.8415 89.6875L86.9998 88.9021L85.1582 89.6875M85.6186 88.3062L86.9998 87.7104L88.4082 88.3062L89.1665 87.0063L90.6561 86.6542L90.5207 85.1375L91.5228 84L90.5207 82.8354L90.6561 81.3187L89.1665 80.9938L88.3811 79.6938L86.9998 80.2896L85.5915 79.6938L84.8332 80.9938L83.3436 81.3187L83.479 82.8354L82.4769 84L83.479 85.1375L83.3436 86.6812L84.8332 87.0063L85.6186 88.3062M86.4311 85.9229L89.4915 82.8625L88.7332 82.0771L86.4311 84.3792L85.2665 83.2417L84.5082 84L86.4311 85.9229Z" fill="white"/></g>
</svg>`;

const icons = {
  back: '<path d="M14 5 7 12l7 7M8 12h12" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" fill="none" stroke="COLOR" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  user: '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0H4Z" fill="COLOR"/>',
  edit: '<path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4 4 16.5Zm14-14 3.5 3.5" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  shield: '<path d="m12 2 8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5l8-3Zm-3 9 2 2 4-4" fill="none" stroke="COLOR" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  vipAward: '<path d="M3.31042 6.825L3.82083 5.1625L2.47917 4.08333H4.14167L4.66667 2.45L5.19167 4.08333H6.85417L5.49792 5.1625L6.00833 6.825L4.66667 5.78958L3.31042 6.825V6.825M1.16667 12.25V7.74375C0.797222 7.33542 0.510417 6.86875 0.30625 6.34375C0.102083 5.81875 0 5.25972 0 4.66667C0 3.36389 0.452083 2.26042 1.35625 1.35625C2.26042 0.452083 3.36389 0 4.66667 0C5.96944 0 7.07292 0.452083 7.97708 1.35625C8.88125 2.26042 9.33333 3.36389 9.33333 4.66667C9.33333 5.25972 9.23125 5.81875 9.02708 6.34375C8.82292 6.86875 8.53611 7.33542 8.16667 7.74375V12.25L4.66667 11.0833L1.16667 12.25V12.25M4.66667 8.16667C5.63889 8.16667 6.46528 7.82639 7.14583 7.14583C7.82639 6.46528 8.16667 5.63889 8.16667 4.66667C8.16667 3.69444 7.82639 2.86806 7.14583 2.1875C6.46528 1.50694 5.63889 1.16667 4.66667 1.16667C3.69444 1.16667 2.86806 1.50694 2.1875 2.1875C1.50694 2.86806 1.16667 3.69444 1.16667 4.66667C1.16667 5.63889 1.50694 6.46528 2.1875 7.14583C2.86806 7.82639 3.69444 8.16667 4.66667 8.16667V8.16667M2.33333 10.5146L4.66667 9.91667L7 10.5146V8.70625C6.65972 8.90069 6.29271 9.05382 5.89896 9.16562C5.50521 9.27743 5.09444 9.33333 4.66667 9.33333C4.23889 9.33333 3.82812 9.27743 3.43438 9.16562C3.04063 9.05382 2.67361 8.90069 2.33333 8.70625V10.5146V10.5146M4.66667 9.61042V9.61042" fill="COLOR"/>',
  vipMedal: '<path d="M3.31042 6.825L3.82083 5.1625L2.47917 4.08333H4.14167L4.66667 2.45L5.19167 4.08333H6.85417L5.49792 5.1625L6.00833 6.825L4.66667 5.78958L3.31042 6.825V6.825M1.16667 12.25V7.74375C.797222 7.33542.510417 6.86875.30625 6.34375.102083 5.81875 0 5.25972 0 4.66667 0 3.36389.452083 2.26042 1.35625 1.35625 2.26042.452083 3.36389 0 4.66667 0 5.96944 0 7.07292.452083 7.97708 1.35625 8.88125 2.26042 9.33333 3.36389 9.33333 4.66667 9.33333 5.25972 9.23125 5.81875 9.02708 6.34375 8.82292 6.86875 8.53611 7.33542 8.16667 7.74375V12.25L4.66667 11.0833 1.16667 12.25V12.25M4.66667 8.16667C5.63889 8.16667 6.46528 7.82639 7.14583 7.14583 7.82639 6.46528 8.16667 5.63889 8.16667 4.66667 8.16667 3.69444 7.82639 2.86806 7.14583 2.1875 6.46528 1.50694 5.63889 1.16667 4.66667 1.16667 3.69444 1.16667 2.86806 1.50694 2.1875 2.1875 1.50694 2.86806 1.16667 3.69444 1.16667 4.66667 1.16667 5.63889 1.50694 6.46528 2.1875 7.14583 2.86806 7.82639 3.69444 8.16667 4.66667 8.16667M2.33333 10.5146L4.66667 9.91667 7 10.5146V8.70625C6.65972 8.90069 6.29271 9.05382 5.89896 9.16562 5.50521 9.27743 5.09444 9.33333 4.66667 9.33333 4.23889 9.33333 3.82812 9.27743 3.43438 9.16562 3.04063 9.05382 2.67361 8.90069 2.33333 8.70625V10.5146V10.5146M4.66667 9.61042V9.61042" fill="COLOR"/>',
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
  const isVipMedal = name === 'vipMedal';
  const isVipAward = name === 'vipAward';
  const width = isThorIcon ? size * 0.8 : size;
  const height = isVipAward ? size * 1.3 : isVipMedal ? size * 1.3 : size;
  const viewBox = isThorIcon ? '0 0 16 20' : isVipAward || isVipMedal ? '0 0 10 13' : '0 0 24 24';
  const xml = `<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${icons[name].replaceAll('COLOR', color)}</svg>`;
  return <SvgXml width={width} height={height} xml={xml} />;
}

function ProfileAvatar() {
  return (
    <View style={styles.avatarGraphic}>
      <SvgXml height={107} width={106} xml={profileAvatarSvg} />
    </View>
  );
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
              <ProfileIcon name="vipAward" size={11} color="#B58C63" />
              <Text style={styles.vipText}>VIP</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Alterar foto de perfil" onPress={() => showUnavailable('Foto de perfil')} style={styles.smallEditButton}>
              <ProfileIcon name="edit" size={13} />
            </Pressable>
          </View>
          <View style={styles.identityCenter}>
            <ProfileAvatar />
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