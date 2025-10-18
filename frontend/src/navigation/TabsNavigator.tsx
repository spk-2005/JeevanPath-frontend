import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import HomeScreen from '@/screens/HomeScreen';
import MapResultsScreen from '@/screens/MapResultsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import SavedScreen from '@/screens/SavedScreen';
import VoiceSearchPopup from '@/components/VoiceSearchPopup';

export type TabParamList = {
  Home: { searchQuery?: string; filterParams?: any } | undefined;
  Maps: { searchQuery?: string; filterParams?: any } | undefined;
  Saved: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();



export default function TabsNavigator() {
  const navigation = useNavigation<any>();
  const [voiceSearchVisible, setVoiceSearchVisible] = useState(false);

  const handleVoiceSearch = (text: string, language?: string) => {
    console.log('Voice search:', text, language);
    // Navigation and processing is handled inside the VoiceSearchPopup component
  };

  return (
    <>
      <Tab.Navigator 
        screenOptions={{ 
          headerShown: false, 
          tabBarActiveTintColor: '#2563eb', 
          tabBarStyle: { height: 68, paddingTop: 8, paddingBottom: 12 }, 
          tabBarLabelStyle: { fontSize: 12 } 
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            tabBarIcon: ({ color }) => <Ionicons name="home" size={25} color={color} />,
            tabBarLabel: 'Home'
          }} 
        />
        <Tab.Screen 
          name="Maps" 
          component={MapResultsScreen} 
          options={{ 
            tabBarIcon: ({ color }) => <Ionicons name="map" size={25} color={color} />,
            tabBarLabel: 'Maps'
          }} 
        />
        <Tab.Screen 
          name="Saved" 
          component={SavedScreen} 
          options={{ 
            tabBarIcon: ({ color }) => <Ionicons name="bookmark" size={25} color={color} />,
            tabBarLabel: 'Saved'
          }} 
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ 
            tabBarIcon: ({ color }) => <Ionicons name="settings" size={25} color={color} />,
            tabBarLabel: 'Settings'
          }} 
        />
      </Tab.Navigator>

      {/* Floating Voice Search Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 90, // Above the tab bar
          right: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#2563eb',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => setVoiceSearchVisible(true)}
      >
        <Ionicons name="mic" size={28} color="white" />
      </TouchableOpacity>

      {/* Voice Search Popup */}
      <VoiceSearchPopup 
        visible={voiceSearchVisible} 
        onClose={() => setVoiceSearchVisible(false)}
        onSearch={handleVoiceSearch}
      />
    </>
  );
}




