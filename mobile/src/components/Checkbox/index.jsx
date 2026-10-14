import { Pressable } from 'react-native';

import CheckIcon from '../icons/CheckIcon';
import { styles } from './styles';

export default function Checkbox({ checked, onPress }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[styles.container, checked ? styles.checked : styles.unchecked]}
    >
      {checked && <CheckIcon size={16.6} color="#FFFFFF" />}
    </Pressable>
  );
}
