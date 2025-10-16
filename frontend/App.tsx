import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { useColorScheme, View, Text, ActivityIndicator } from 'react-native';
import './src/i18n';
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';

export default function App() {
  const scheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium,
    Poppins_600SemiBold, Poppins_700Bold,
    JetBrainsMono_500Medium
  });

  useEffect(() => {
    // Simple initialization delay
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    // Clean up the timer
    return () => clearTimeout(timer);
  }, []);

  if (!isReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}


