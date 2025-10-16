import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function VoiceChatScreen() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const toggle = () => {
    setListening(v => !v);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Voice / Chat</Text>
      <View style={[styles.waveform, listening && styles.waveActive]} />
      <TouchableOpacity style={styles.mic} onPress={toggle}>
        <Text style={styles.micText}>{listening ? 'Stop' : 'Speak'} 🎙</Text>
      </TouchableOpacity>
      <Text style={styles.block}>You: {transcript || '...'}</Text>
      <Text style={styles.block}>AI: {response || '...'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  waveform: { height: 80, backgroundColor: '#e2e8f0', borderRadius: 12 },
  waveActive: { backgroundColor: '#93c5fd' },
  mic: { backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center' },
  micText: { color: '#fff', fontWeight: '700' },
  block: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10 }
});


