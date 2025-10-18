import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
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
          name="Voice"
          children={() => null}
          options={{ 
            tabBarIcon: ({ color, focused }) => (
              <TouchableOpacity
                onPress={() => setVoiceSearchVisible(true)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#2563eb',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Ionicons 
                  name={Constants?.appOwnership === 'expo' ? "chatbox" : "mic"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            ),
            tabBarLabel: Constants?.appOwnership === 'expo' ? 'Chat' : 'Voice'
          }} 
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setVoiceSearchVisible(true);
            },
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

      {/* Voice Assistant - Always use VoiceSearchPopup for now */}
      <VoiceSearchPopup 
        visible={voiceSearchVisible} 
        onClose={() => setVoiceSearchVisible(false)}
        onSearch={handleVoiceSearch}
      />
    </>
  );
}




