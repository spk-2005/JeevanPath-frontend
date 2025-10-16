import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  const [dark, setDark] = useState(false);
  const [offline, setOffline] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  return (
    <View style={styles.container}>
      <View style={styles.row}><Text style={styles.label}>Language</Text><Text>{lang.toUpperCase()} 🌐</Text></View>
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
});






