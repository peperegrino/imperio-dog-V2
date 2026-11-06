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
          style={[styles.input, onToggleSecure && styles.inputWithIcon]}
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
    </View>
  );
}
