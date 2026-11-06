import { Image, Text, View } from 'react-native';

import { styles } from './styles';

const logo = require('../../assets/images/logo-imperio-dog.png');

export default function LogoHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logoCard}>
        <Image resizeMode="contain" source={logo} style={styles.logo} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Império dog resort vip</Text>
        <Text style={styles.title}>Acesse seu refúgio</Text>
        <Text style={styles.subtitle}>
          Acompanhe a rotina, mimos e a estadia
          {'\n'}
          5 estrelas do seu pet em tempo real.
        </Text>
      </View>
    </View>
  );
}
