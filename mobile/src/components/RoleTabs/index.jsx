import { Pressable, Text, View } from 'react-native';

import { styles } from './styles';

const roles = [
  { key: 'tutor', label: 'Tutor & Família' },
  { key: 'equipe', label: 'Equipe & Gestão' },
];

export default function RoleTabs({ activeRole, onChange }) {
  return (
    <View style={styles.container}>
      {roles.map((role) => {
        const active = activeRole === role.key;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={role.key}
            onPress={() => onChange(role.key)}
            style={[
              styles.tab,
              role.key === 'equipe' && styles.teamTab,
              active ? styles.activeTab : styles.inactiveTab,
            ]}
          >
            <Text
              style={[
                styles.label,
                active ? styles.activeLabel : styles.inactiveLabel,
              ]}
            >
              {role.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
