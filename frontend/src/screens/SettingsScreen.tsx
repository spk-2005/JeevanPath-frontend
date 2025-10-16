import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import i18n from '@/i18n';

export default function SettingsScreen() {
  const [dark, setDark] = useState(false);
  const [offline, setOffline] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi' | 'te'>(i18n.language as any || 'en');
  const changeLang = (code: 'en' | 'hi' | 'te') => {
    setLang(code);
    i18n.changeLanguage(code);
  };
  return (
    <View style={styles.container}>
      <View style={styles.row}><Text style={styles.label}>Language</Text><Text>{lang.toUpperCase()} 🌐</Text></View>
      <View style={{ flexDirection:'row', gap:8 }}>
        <TouchableOpacity onPress={() => changeLang('en')} style={[styles.pill, lang==='en' && styles.pillActive]}><Text style={[styles.pillText, lang==='en' && styles.pillTextActive]}>English</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => changeLang('hi')} style={[styles.pill, lang==='hi' && styles.pillActive]}><Text style={[styles.pillText, lang==='hi' && styles.pillTextActive]}>हिन्दी</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => changeLang('te')} style={[styles.pill, lang==='te' && styles.pillActive]}><Text style={[styles.pillText, lang==='te' && styles.pillTextActive]}>తెలుగు</Text></TouchableOpacity>
      </View>
      <View style={styles.row}><Text style={styles.label}>Dark Mode</Text><Switch value={dark} onValueChange={setDark} /></View>
      <View style={styles.row}><Text style={styles.label}>Offline Cache</Text><Switch value={offline} onValueChange={setOffline} /></View>
      <Text style={{opacity:0.7}}>About: JeevanPath helps find clinics, pharmacies, and blood banks.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { fontWeight: '600' }
  ,pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#e2e8f0' }
  ,pillActive: { backgroundColor: '#2563eb' }
  ,pillText: { color: '#0f172a' }
  ,pillTextActive: { color: '#fff' }
});






