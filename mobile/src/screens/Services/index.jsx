import ScreenPlaceholder from '../../components/ScreenPlaceholder';

export default function ServicesScreen({ navigation, route }) {
  return (
    <ScreenPlaceholder
      activeRoute="Home"
      homeRoute={route.params?.homeRoute || 'Admin'}
      navigation={navigation}
      title="Serviços"
    />
  );
}
