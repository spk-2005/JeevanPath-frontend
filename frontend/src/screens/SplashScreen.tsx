import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { isLoggedIn } from '../utils/auth';

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  
  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
          // User is logged in, go directly to main screen
          navigation.replace('Main');
        } else {
          // User is not logged in, go to login screen
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error checking login state:', error);
        // On error, go to login screen
        navigation.replace('Login');
      }
    };

    // Add a small delay for splash screen effect
    const timer = setTimeout(checkAutoLogin, 1200);
    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>JeevanPath</Text>
      <Text style={styles.tagline}>Multilingual Health Resource Finder</Text>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 28, fontWeight: '700' },
  tagline: { fontSize: 14, opacity: 0.7 }
});






