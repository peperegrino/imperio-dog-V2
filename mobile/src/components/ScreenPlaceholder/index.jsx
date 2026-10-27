import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import AppNavigation, { ProfileButton } from '../AppNavigation';
import { styles } from './styles';

export default function ScreenPlaceholder({
  title,
  activeRoute,
  homeRoute = 'Home',
  navigation,
  links = [],
}) {
  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <ProfileButton
          onPress={() => navigation.navigate('Profile', { homeRoute })}
          size={32}
          iconSize={16}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.message}>Tela em criação.</Text>
        {links.map((link) => (
          <Pressable
            accessibilityRole="button"
            key={link.route}
            onPress={() => navigation.navigate(link.route, { homeRoute })}
            style={styles.link}
          >
            <Text style={styles.linkText}>{link.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <AppNavigation
        activeRoute={activeRoute}
        homeRoute={homeRoute}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}
