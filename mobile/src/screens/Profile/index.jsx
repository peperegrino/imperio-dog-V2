import ScreenPlaceholder from '../../components/ScreenPlaceholder';

export default function ProfileScreen({ navigation, route }) {
  return (
    <ScreenPlaceholder
      activeRoute="Profile"
      homeRoute={route.params?.homeRoute || 'Home'}
      navigation={navigation}
      title="Perfil"
    />
  );
}
