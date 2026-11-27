
import { ActivityIndicator, Image, Text, View } from 'react-native';

const logo = require('../../assets/images/logo-imperio-dog.png');

export default function FontLoading() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Image source={logo} resizeMode="contain" style={{ width: 160, height: 160 }} />
      <Text style={{ color: '#722F37', fontSize: 22, fontWeight: '700', marginTop: 24 }}>
        Império Dog Resort
      </Text>
      <ActivityIndicator size="small" color="#722F37" style={{ marginTop: 32 }} />
      <Text style={{ color: '#B58B63', fontSize: 12, marginTop: 14 }}>
        Carregando...
      </Text>
    </View>
  );
}
