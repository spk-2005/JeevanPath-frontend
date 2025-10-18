import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '@/screens/SplashScreen';
import LoginScreen from '@/screens/LoginScreen';
import OtpScreen from '@/screens/OtpScreen';
import TabsNavigator from './TabsNavigator';
import VoiceChatScreen from '@/screens/VoiceChatScreen';
import OfflineScreen from '@/screens/OfflineScreen';
import LocationPermissionScreen from '@/screens/LocationPermissionScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import EmergencyAlertsScreen from '@/screens/EmergencyAlertsScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  OTP: { phone: string } | undefined;
  LocationPermission: undefined;
  Main: undefined;
  VoiceChat: undefined;
  Offline: undefined;
  Profile: undefined;
  EmergencyAlerts: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OtpScreen} />
      <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
      <Stack.Screen name="Main" component={TabsNavigator} />
      <Stack.Screen name="VoiceChat" component={VoiceChatScreen} />
      <Stack.Screen name="Offline" component={OfflineScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EmergencyAlerts" component={EmergencyAlertsScreen} />
    </Stack.Navigator>
  );
}



