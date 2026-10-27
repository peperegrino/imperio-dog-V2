import ScreenPlaceholder from '../../components/ScreenPlaceholder';

export default function PetsScreen({ navigation, route }) {
  return (
    <ScreenPlaceholder
      activeRoute="Home"
      homeRoute={route.params?.homeRoute || 'Admin'}
      navigation={navigation}
      title="Pets"
    />
  );
}
