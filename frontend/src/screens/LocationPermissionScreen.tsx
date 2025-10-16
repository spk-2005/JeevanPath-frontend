import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

export default function LocationPermissionScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        navigation.replace('Main');
      } else {
        Alert.alert('Permission needed', 'Location access helps us find nearby resources. You can proceed with demo.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to request location permission');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.brand}><Text style={styles.heart}>❤</Text> JeevanPath</Text>
        <Text style={styles.desc}>Find nearby medical resources in your language</Text>

        <Text style={styles.pin}>📍</Text>
        <Text style={styles.desc}>Find nearby medical resources in your language</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Enable Location Access</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.replace('Main')}>
          <Text>🏙  Skip & Use NYC Demo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f5f9', padding: 16, justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 14, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12 },
  brand: { textAlign: 'center', fontWeight: '800', fontSize: 18 },
  heart: { color: '#ef4444' },
  desc: { textAlign: 'center', color: '#64748b' },
  pin: { textAlign: 'center', fontSize: 28 },
  primaryBtn: { backgroundColor: '#0f172a', height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }
});





