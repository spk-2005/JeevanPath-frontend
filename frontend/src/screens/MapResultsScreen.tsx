import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { api } from '@/utils/api';

const initialRegion = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type Resource = { _id: string; name: string; location?: { coordinates: [number, number] } };

export default function MapResultsScreen() {
  const [markers, setMarkers] = useState<{ id: string; title: string; coordinate: { latitude: number; longitude: number } }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res: Resource[] = (await api.get('/api/resources')).data;
        const ms = res
          .filter(r => r.location && Array.isArray(r.location.coordinates))
          .map(r => ({ id: r._id, title: r.name, coordinate: { latitude: r.location!.coordinates[1], longitude: r.location!.coordinates[0] } }));
        setMarkers(ms);
      } catch (e) {
        // ignore for now
      }
    })();
  }, []);
  return (
    <View style={styles.container}>
      <MapView style={styles.map} provider={PROVIDER_GOOGLE} initialRegion={initialRegion}>
        {markers.map(m => (
          <Marker key={m.id} coordinate={m.coordinate} title={m.title} />
        ))}
      </MapView>
      <View style={styles.footer}>
        <View style={{flexDirection:'row', justifyContent:'space-around'}}>
          <TouchableOpacity><Text>☰ List</Text></TouchableOpacity>
          <TouchableOpacity><Text>📍 Distance</Text></TouchableOpacity>
          <TouchableOpacity><Text>⭐ Rating</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  footer: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: 'white', padding: 12, borderRadius: 10, elevation: 2 }
});


