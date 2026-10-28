import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { styles } from './styles';

export default function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  leadingIcon,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.content}>
          {leadingIcon}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
