import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import HomeScreen from '@/screens/HomeScreen';
import MapResultsScreen from '@/screens/MapResultsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import VoiceChatScreen from '@/screens/VoiceChatScreen';

export type TabParamList = {
  Home: undefined;
  Maps: undefined;
  Voice: undefined;
  Saved: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Placeholder screen for Saved tab
function SavedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Ionicons name="bookmark" size={64} color="#2563eb" />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16, color: '#1f2937' }}>Saved Resources</Text>
      <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 8 }}>
        Your bookmarked clinics, pharmacies, and blood banks will appear here.
      </Text>
    </View>
  );
}

// Custom Voice Button Component
function VoiceTabButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Ionicons name="mic" size={28} color="white" />
    </TouchableOpacity>
  );
}

export default function TabsNavigator() {
  const navigation = useNavigation<any>();

  return (
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
        component={VoiceChatScreen} 
        options={{ 
          tabBarIcon: ({ color, focused }) => (
            <VoiceTabButton onPress={() => navigation.navigate('Voice')} />
          ),
          tabBarLabel: 'Voice',
          tabBarButton: () => (
            <VoiceTabButton onPress={() => navigation.navigate('Voice')} />
          )
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
  );
}




