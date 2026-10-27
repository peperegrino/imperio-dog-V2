import ScreenPlaceholder from '../../components/ScreenPlaceholder';

export default function HistoryScreen({ navigation, route }) {
  return (
    <ScreenPlaceholder
      activeRoute="History"
      homeRoute={route.params?.homeRoute || 'Home'}
      navigation={navigation}
      title="Histórico"
    />
  );
}
