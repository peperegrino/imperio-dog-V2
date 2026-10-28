import { Pressable, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  chargesIconXml,
  historyIconXml,
  homeIconXml,
  profileHeaderIconXml,
  profileIconXml,
} from './icons';
import { styles } from './styles';

const inactiveColor = '#6E5B58';

const items = [
  { key: 'Home', label: 'Início', icon: homeIconXml, size: [16, 18] },
  { key: 'Charges', label: 'Faturas', icon: chargesIconXml, size: [18, 20] },
  { key: 'History', label: 'Histórico', icon: historyIconXml, size: [18, 18] },
  { key: 'Profile', label: 'Perfil', icon: profileIconXml, size: [16, 16] },
];

export function ProfileButton({
  onPress,
  size = 32,
  iconSize = 16,
  backgroundColor = colors.primary,
}) {
  return (
    <Pressable
      accessibilityLabel="Abrir perfil"
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.profileButton,
        { width: size, height: size, borderRadius: size / 2 },
        { backgroundColor },
      ]}
    >
      <SvgXml
        height={iconSize}
        width={iconSize}
        xml={profileHeaderIconXml}
      />
    </Pressable>
  );
}

export default function AppNavigation({
  navigation,
  activeRoute,
  homeRoute = 'Home',
}) {
  return (
    <View style={styles.blur}>
      <View style={styles.container}>
        {items.map((item) => {
          const isActive = activeRoute === item.key;
          const xml = item.icon.replace(
            /fill="#[A-Fa-f0-9]+"/,
            `fill="${isActive ? colors.primary : inactiveColor}"`,
          );
          const route = item.key === 'Home' ? homeRoute : item.key;

          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              key={item.key}
              onPress={() => navigation.navigate(route, { homeRoute })}
              style={styles.item}
            >
              <SvgXml height={item.size[1]} width={item.size[0]} xml={xml} />
              <Text
                style={[
                  styles.label,
                  isActive ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
