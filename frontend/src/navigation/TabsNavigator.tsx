import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '@/screens/HomeScreen';
import SearchScreen from '@/screens/SearchScreen';
import MapResultsScreen from '@/screens/MapResultsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Map: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2563eb', tabBarStyle: { height: 68, paddingTop: 8, paddingBottom: 12 }, tabBarLabelStyle: { fontSize: 12 } }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={25} color={color} /> }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="search" size={25} color={color} /> }} />
      <Tab.Screen name="Map" component={MapResultsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="map" size={25} color={color} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="settings" size={25} color={color} /> }} />
    </Tab.Navigator>
  );
}




