import { Platform } from 'react-native';

export const colors = {
  background: '#FAF8F5',
  surface: '#FFFFFF',
  wine: '#722F37',
  text: '#1A1C1C',
  muted: '#534343',
  beige: '#FAF5EE',
  brown: '#8A6237',
  border: 'rgba(216,193,194,0.3)',
  warningBorder: '#E8D8C5',
  barcodeBorder: '#E8E8E8',
  headerBg: 'rgba(249,249,249,0.8)',
  white: '#FFFFFF',
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

const shadow = (offsetY, blur, opacity, elevation) =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur / 2,
    },
    default: {
      elevation,
      shadowColor: '#000',
    },
  });

export const shadows = {
  card: shadow(8, 15, 0.06, 3),
  small: shadow(1, 1, 0.05, 1),
  button: shadow(4, 6, 0.1, 3),
  header: shadow(1, 8, 0.04, 2),
};
