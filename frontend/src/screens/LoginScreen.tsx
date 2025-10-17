import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { checkDeviceRegistration } from '../utils/api';
import { getDeviceInfo } from '../utils/device';
import { saveLoginState, clearLoginState } from '../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber.startsWith('+')) {
      return '+91' + phoneNumber.replace(/\D/g, '');
    }
    return phoneNumber.replace(/\D/g, '');
  };

  const handleSendOTP = async () => {
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phone);
      const deviceInfo = await getDeviceInfo();
      
      // Check if device is already registered
      const deviceCheck = await checkDeviceRegistration(
        formattedPhone,
        deviceInfo.deviceId,
        deviceInfo.platform
      );

      if (deviceCheck.isRegistered && !deviceCheck.requiresOTP) {
        // Device is registered, skip OTP and go directly to main screen
        // Save login state for automatic login
        await saveLoginState(formattedPhone, deviceInfo.deviceId);
        Alert.alert(
          'Welcome Back!',
          `Welcome back to your ${deviceInfo.deviceName}`,
          [{ text: 'Continue', onPress: () => navigation.replace('Main') }]
        );
      } else {
        // Device not registered or new device, require OTP
        const randomOTP = Math.floor(1000 + Math.random() * 9000).toString();
        Alert.alert(
          'Verification Code',
          `Your 4-digit code is: ${randomOTP}`,
          [{ 
            text: 'Continue', 
            onPress: () => navigation.navigate('OTP', { 
              phone: formattedPhone, 
              randomOTP,
              deviceInfo,
              isNewDevice: !deviceCheck.isRegistered
            }) 
          }]
        );
      }
    } catch (e) {
      console.error('Error checking device registration:', e);
      Alert.alert('Error', 'Failed to check device registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearDeviceForTesting = async () => {
    try {
      await AsyncStorage.removeItem('deviceId');
      await clearLoginState();
      Alert.alert('Device Cleared', 'Device registration and login state cleared for testing. Next login will require OTP.');
    } catch (e) {
      Alert.alert('Error', 'Failed to clear device registration.');
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header badge */}
      <View style={styles.headerBadge}><Text style={styles.heart}>❤</Text></View>
      <Text style={styles.appTitle}>JeevanPath</Text>
      <Text style={styles.subtitle}>Find nearby medical resources in your language</Text>

      {/* Feature chips */}
      <View style={styles.chipsRow}>
        <View style={styles.chip}><Text style={styles.chipText}>⚙ AI Powered</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>🌐 60+ Languages</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>⏱ Real-time</Text></View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔒 Secure Login</Text>
        <Text style={styles.cardHint}>Enter your mobile number to get started</Text>

        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>📞</Text>
          <TextInput
            style={styles.input}
            placeholder="123-456-7890"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
          disabled={loading}
          onPress={handleSendOTP}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send Verification Code</Text>}
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.demoBtn} onPress={() => navigation.replace('Main')}>
          <View style={styles.demoBadge}><Text style={styles.demoBadgeText}>DEMO</Text></View>
          <Text style={styles.demoBtnText}>Try Demo Mode</Text>
        </TouchableOpacity>

        <Text style={styles.consent}>By continuing, you agree to our privacy policy. Your data is secured and used to provide personalized health resource recommendations.</Text>
        
        {/* Test button for clearing device registration */}
        <TouchableOpacity style={styles.testBtn} onPress={clearDeviceForTesting}>
          <Text style={styles.testBtnText}>🧪 Clear Device (Testing)</Text>
        </TouchableOpacity>
      </View>

      {/* Footer badges */}
      <View style={styles.footerRow}>
        <View style={styles.footerPill}><Text>🔎 All Recommendations</Text></View>
        <View style={styles.footerPill}><Text>🛡 Secure & Private</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, gap: 12, backgroundColor: '#f1f5f9', justifyContent: 'center' },
  headerBadge: { alignSelf: 'center', backgroundColor: '#fff', width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  heart: { fontSize: 28 },
  appTitle: { textAlign: 'center', fontSize: 24, fontWeight: '800' },
  subtitle: { textAlign: 'center', color: '#475569' },
  chipsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  chip: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, elevation: 1 },
  chipText: { color: '#0f172a', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, marginTop: 4, elevation: 2 },
  cardTitle: { fontWeight: '800', fontSize: 16 },
  cardHint: { color: '#64748b' },
  label: { fontWeight: '700', fontSize: 12, marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 10 },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, height: 44 },
  primaryBtn: { backgroundColor: '#0f172a', height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  orText: { textAlign: 'center', color: '#94a3b8' },
  demoBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, height: 44, justifyContent: 'center' },
  demoBadge: { backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  demoBadgeText: { fontSize: 12, fontWeight: '800' },
  demoBtnText: { fontWeight: '700' },
  consent: { fontSize: 12, color: '#64748b' },
  testBtn: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 8, padding: 8, alignItems: 'center', marginTop: 8 },
  testBtnText: { color: '#92400e', fontSize: 12, fontWeight: '600' },
  footerRow: { flexDirection: 'row', gap: 12, justifyContent: 'space-between', marginTop: 12 },
  footerPill: { flex: 1, backgroundColor: '#fff', paddingVertical: 12, borderRadius: 999, alignItems: 'center', elevation: 1 }
});


