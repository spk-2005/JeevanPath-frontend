import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSavedResources, removeSavedResource, SavedResource } from '@/utils/saved';
import { useAppColors } from '@/theme/ThemeProvider';

export default function SavedScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const [items, setItems] = useState<SavedResource[]>([]);

  async function load() {
    const list = await getSavedResources();
    setItems(list);
  }

  useEffect(() => {
    const unsubscribe = () => {};
    load();
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark" size={64} color={colors.primary} />
          <Text style={[styles.emptyTitle,{color:colors.textPrimary}]}>No saved resources</Text>
          <Text style={[styles.emptySub,{color:colors.textSecondary}]}>Tap “Save” on clinics and pharmacies to see them here.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingTop: 48, paddingHorizontal: 16, paddingBottom: 48 }}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 4, marginBottom: 12 }}>
              <Text style={{ fontWeight:'800', fontSize:18, color: colors.textPrimary }}>Saved Resources</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, {borderColor: colors.border, backgroundColor: colors.card}]}> 
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <View style={{flex:1}}>
                  <Text style={[styles.title,{color:colors.textPrimary}]}>{item.name}</Text>
                  {!!item.address && <Text style={[styles.addr,{color:colors.textSecondary}]}>{item.address}</Text>}
                </View>
                <TouchableOpacity
                  style={[styles.unsaveBtn,{borderColor: colors.border}]}
                  onPress={async ()=>{ await removeSavedResource(item.id); setItems(list => list.filter(x => x.id !== item.id)); }}
                >
                  <Text style={{color:'#dc2626'}}>Remove</Text>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection:'row', gap:12, marginTop:10}}>
                <TouchableOpacity style={[styles.action,{borderColor: colors.border}]}
                  onPress={() => {
                    const mapsUrl = item.coords ? `https://www.google.com/maps/dir/?api=1&destination=${item.coords.lat},${item.coords.lng}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address || item.name)}`;
                    Linking.openURL(mapsUrl);
                  }}
                >
                  <Text style={{color:colors.textPrimary}}>🧭 Directions</Text>
                </TouchableOpacity>
                {!!item.phone && (
                  <TouchableOpacity style={[styles.actionFilled,{backgroundColor: colors.primary}]}
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                  >
                    <Text style={{color:'#fff'}}>📞 Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex:1, backgroundColor: colors.background },
  empty: { flex:1, alignItems:'center', justifyContent:'center', padding: 24 },
  emptyTitle: { marginTop: 12, fontWeight:'800', fontSize: 20 },
  emptySub: { marginTop: 6 },
  card: { borderWidth:1, borderRadius:12, padding:12, marginBottom:12 },
  title: { fontWeight:'800', fontSize: 16 },
  addr: { marginTop: 4, fontSize: 12 },
  action: { flex:1, height: 40, borderWidth:1, borderRadius:10, alignItems:'center', justifyContent:'center' },
  actionFilled: { flex:1, height: 40, borderRadius:10, alignItems:'center', justifyContent:'center' },
  unsaveBtn: { paddingVertical:6, paddingHorizontal:10, borderWidth:1, borderRadius:8 }
});


