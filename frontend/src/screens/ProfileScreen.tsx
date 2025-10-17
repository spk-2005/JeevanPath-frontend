import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { setApiBaseUrlOverride } from '@/utils/api';
import i18n from '@/i18n';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [language, setLanguage] = useState('en');
  const [connectivity, setConnectivity] = useState<{ ok: boolean; baseURL: string; error?: string } | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('profile');
        if (stored) {
          const p = JSON.parse(stored);
          setName(p.name || '');
          setPhone(p.phone || '');
          setNotes(p.notes || '');
          setLanguage(p.language || 'en');
          
        }
        const savedApi = await AsyncStorage.getItem('apiBaseUrl');
        if (savedApi) setApiBaseUrl(savedApi);
      } catch {}
    })();
  }, []);

  const save = async () => {
    try {
      await AsyncStorage.setItem('profile', JSON.stringify({ name, phone, notes, language }));
      try { i18n.changeLanguage(language); } catch {}
      Alert.alert('Saved', 'Your details were saved');
    } catch {
      Alert.alert('Error', 'Could not save details');
    }
  };

  // Removed backend save per request

  const testConnectivity = async () => {
    const res = await pingApi();
    setConnectivity(res);
    if (!res.ok) Alert.alert('API Unreachable', `Base URL: ${res.baseURL}\nError: ${res.error || 'Unknown'}`);
  };
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.subtitle}>Basic details for faster booking and contact.</Text>
      
      <View style={styles.formRow}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+91..." keyboardType="phone-pad" />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, { height: 90 }]} value={notes} onChangeText={setNotes} placeholder="Allergies, conditions, etc." multiline />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Language</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['en','hi','te'].map(l => (
            <TouchableOpacity key={l} style={[styles.langBtn, language===l && styles.langBtnActive]} onPress={() => setLanguage(l)}>
              <Text style={[styles.langText, language===l && styles.langTextActive]}>{l.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.btn} onPress={save}>
        <Text style={styles.btnText}>Save Details</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  topBar: { position: 'absolute', top: 48, left: 16, right: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: '#0f172a', fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { marginTop: 8, color: '#475569', textAlign: 'center' },
  formRow: { width: '100%', marginTop: 14 },
  label: { fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  btn: { marginTop: 16, backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' }
});


