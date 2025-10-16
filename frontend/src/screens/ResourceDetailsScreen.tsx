import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ResourceDetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resource Name</Text>
      <Text>Type • Address • Contact</Text>
      <Text>Open 9:00 - 18:00 • Rating 4.5</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.cta}><Text style={styles.ctaText}>Call</Text></TouchableOpacity>
        <TouchableOpacity style={styles.cta}><Text style={styles.ctaText}>Directions</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cta: { flex: 1, backgroundColor: '#0ea5e9', padding: 12, borderRadius: 10, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '700' }
});





