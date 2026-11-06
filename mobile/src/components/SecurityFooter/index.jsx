import { Text, View } from 'react-native';

import { styles } from './styles';

export default function SecurityFooter() {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.label}>Ambiente Criptografado &amp; Seguro</Text>
    </View>
  );
}
