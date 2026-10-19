import { ActivityIndicator, View } from 'react-native';

import { styles } from './styles';

export default function FontLoading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={styles.indicator.color} />
    </View>
  );
}
