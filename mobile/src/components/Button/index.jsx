import { Pressable, Text } from 'react-native';

import { styles } from './styles';

export default function Button({ label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
