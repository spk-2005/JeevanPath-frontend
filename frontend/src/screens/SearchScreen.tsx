import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { api } from '@/utils/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'clinic' | 'pharmacy' | 'blood'>('clinic');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await api.get('/api/resources', { params: { q: query, type: category } });
        setResults(res.data);
      } catch (e) {}
    }, 300);
    return () => clearTimeout(t);
  }, [query, category]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Search resources"
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <View style={styles.rowGap}>
        <TouchableOpacity style={[styles.pill, category==='clinic' && styles.pillActive]} onPress={() => setCategory('clinic')}>
          <Text style={[styles.pillText, category==='clinic' && styles.pillTextActive]}>Clinics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.pill, category==='pharmacy' && styles.pillActive]} onPress={() => setCategory('pharmacy')}>
          <Text style={[styles.pillText, category==='pharmacy' && styles.pillTextActive]}>Pharmacies</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.pill, category==='blood' && styles.pillActive]} onPress={() => setCategory('blood')}>
          <Text style={[styles.pillText, category==='blood' && styles.pillTextActive]}>Blood Banks</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Voice search available on AI screen.</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}> 
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSub}>{item.type} • {item.address}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 8 },
  rowGap: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#e2e8f0' },
  pillActive: { backgroundColor: '#2563eb' },
  pillText: { color: '#0f172a' },
  pillTextActive: { color: '#fff' },
  hint: { marginTop: 8, opacity: 0.7 }
  ,item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  itemTitle: { fontWeight: '600' },
  itemSub: { opacity: 0.7 }
});


