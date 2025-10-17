import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
// import { registerDevice } from '../utils/api';
import { saveLoginState } from '../utils/auth';

export default function OtpScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phone, randomOTP, deviceInfo, isNewDevice } = route.params;
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!code || code.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      // Compare entered OTP with the random OTP or accept fixed code '1234' for testing
      if (code === randomOTP || code === '1234') {
        // OTP verification successful
        console.log('OTP verified successfully');
        
        // Skip server-side device registration in local-only mode
        
        // Save login state for automatic login
        if (deviceInfo) {
          await saveLoginState(phone, deviceInfo.deviceId);
        }
        
        navigation.replace('Main');
      } else {
        // OTP verification failed
        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect. Please try again.');
      }
    } catch (e) {
      console.error('Error verifying OTP:', e);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('verify_otp') as string}</Text>
      <Text style={styles.subtitle}>{(t('otp_subtitle', { phone }) as string)}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter 4-digit OTP"
        keyboardType="number-pad"
        maxLength={4}
        value={code}
        onChangeText={setCode}
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        disabled={loading}
        onPress={handleVerifyOTP}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>{t('verify_otp') as string}</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, textAlign: 'center', fontSize: 18, letterSpacing: 8 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#93c5fd', opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { textAlign: 'center', color: '#2563eb', marginTop: 10 }
});


