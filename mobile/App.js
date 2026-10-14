import { useFonts } from 'expo-font';

import FontLoading from './src/components/FontLoading';
import Navigation from './src/navigation';

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_500Medium: require(
      '@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf',
    ),
    PlusJakartaSans_600SemiBold: require(
      '@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf',
    ),
    PlusJakartaSans_700Bold: require(
      '@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf',
    ),
  });

  if (!fontsLoaded) {
    return <FontLoading />;
  }

  return <Navigation />;
}
