import { Pressable, Text, TextInput, View } from 'react-native';

import EyeIcon from '../icons/EyeIcon';
import EyeOffIcon from '../icons/EyeOffIcon';
import { styles } from './styles';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  secureTextEntry = false,
  onToggleSecure,
  error,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          secureTextEntry={secureTextEntry}
          style={[styles.input, onToggleSecure && styles.inputWithIcon, error && { borderWidth: 1, borderColor: '#A63D40' }]}
          value={value}
        />
        {onToggleSecure && (
          <Pressable
            accessibilityLabel={secureTextEntry ? 'Mostrar senha' : 'Ocultar senha'}
            accessibilityRole="button"
            onPress={onToggleSecure}
            style={styles.iconButton}
          >
            {secureTextEntry ? (
              <EyeIcon size={22} color="#534343" />
            ) : (
              <EyeOffIcon size={22} color="#534343" />
            )}
          </Pressable>
        )}
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={{ color: '#A63D40', fontSize: 12, marginTop: 6 }}>{error}</Text> : null}
    </View>
  );
}
