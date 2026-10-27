import ScreenPlaceholder from '../../components/ScreenPlaceholder';

const managementLinks = [
  { label: 'Clientes', route: 'Customers' },
  { label: 'Pets', route: 'Pets' },
  { label: 'Serviços', route: 'Services' },
];

export default function AdminScreen({ navigation }) {
  return (
    <ScreenPlaceholder
      activeRoute="Home"
      homeRoute="Admin"
      links={managementLinks}
      navigation={navigation}
      title="Painel da Equipe"
    />
  );
}
