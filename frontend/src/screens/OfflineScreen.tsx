import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function OfflineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline Mode</Text>
      <Text>Showing cached results and recent searches. Check your connection.</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  button: { backgroundColor: '#10b981', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' }
});






