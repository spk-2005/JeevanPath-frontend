import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Modal, ScrollView, Switch, Linking, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useAppColors } from '@/theme/ThemeProvider';
import { getResources } from '@/utils/api';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const colors = useAppColors();
  const styles = createStyles(colors);
  const [query, setQuery] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [openNow, setOpenNow] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [services, setServices] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<string[]>([]);
  const [transportation, setTransportation] = useState<string[]>([]);
  const [wheelchair, setWheelchair] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let params: any = { q: query || undefined, type: selectedType ? selectedType.toLowerCase() : undefined, openNow: openNow || undefined, minRating, services, languages, insurance, transportation, wheelchair };
        if (radiusKm) {
          const { coords } = await Location.getCurrentPositionAsync({});
          params = { ...params, lat: coords.latitude, lng: coords.longitude, radiusMeters: radiusKm * 1000 };
        }
        const data = await getResources(params);
        setResources(
          (data || []).map((r: any) => ({
            id: r._id || String(Math.random()),
            name: r.name,
            type: r.type || 'Hospital',
            distance: '—',
            time: '—',
            rating: r.rating ? `${r.rating}` : '—',
            status: openNow ? 'Open' : '—',
            emergency: r.emergency || false,
            address: r.address || '—',
            phone: r.contact || undefined,
            coords: r.location && Array.isArray(r.location.coordinates) ? { lat: r.location.coordinates[1], lng: r.location.coordinates[0] } : undefined
          }))
        );
      } catch (err) {
        console.warn('Failed to load resources', err);
        setResources([]);
      }
    })();
  }, [query, selectedType, openNow, radiusKm, minRating, services, languages, insurance, transportation, wheelchair]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        navigation.replace('LocationPermission');
      }
    })();
  }, [navigation]);
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={[styles.brand,{color:colors.textPrimary}]}><Text style={[styles.heart,{color:colors.danger}]}>❤</Text> JeevanPath</Text>
        <View style={{flexDirection:'row', gap:16, alignItems:'center'}}>
          <Ionicons name="notifications-outline" size={26} color={colors.textPrimary} />
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.promo,{backgroundColor: colors.card}] }>
        <View style={{flex:1}}>
          <Text style={styles.promoTitle}>HealthPlus</Text>
          <Text style={styles.promoKicker}>Clinic · Promoted</Text>
          <Text style={styles.promoSub}>Same-day appointments available. Board-certified doctors.</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn}><Text style={{color:'#fff', fontWeight:'700'}}>Book Now</Text></TouchableOpacity>
      </View>

      <View style={[styles.rowPill,{borderColor:colors.border}]}><Text style={{color:colors.textPrimary}}>📍 {t('location_label') as string}</Text><Text style={[styles.link,{color:colors.accent}]}> {t('demo_city') as string}</Text></View>
      <View style={styles.searchRow}>
        <TextInput style={[styles.searchInput,{borderColor:colors.border, color:colors.textPrimary, backgroundColor: colors.card}]} placeholder={t('search_placeholder') as string} placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} />
        <TouchableOpacity style={[styles.searchBtn,{backgroundColor: colors.primary}]}><Text style={{color:'#fff', fontWeight:'700'}}>{t('search') as string}</Text></TouchableOpacity>
      </View>

      <View style={styles.filtersRow}>
        <TouchableOpacity style={styles.filterPill} onPress={() => setFiltersOpen(true)}>
          <Text>
            ⚙ {t('filters')}{useMemo(() => {
              let c = 0; if (selectedType) c++; if (openNow) c++; if (radiusKm) c++;
              return c ? ` (${c})` : '';
            }, [selectedType, openNow, radiusKm])}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterPill}><Text>☰ {t('list')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterPill}><Text>◯◯ {t('map')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterPill}><Text>➕ {t('more')}</Text></TouchableOpacity>
      </View>

      <Text style={[styles.resultsMeta,{color:colors.muted}]}>{resources.length} resources</Text>

      <FlatList
        data={resources}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={[styles.card,{backgroundColor: colors.card, borderColor: colors.border}] }>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              <View style={{flex:1}}>
                <Text style={[styles.itemTitle,{color:colors.textPrimary}]}>{item.name}</Text>
                <View style={{flexDirection:'row', gap:8, marginTop:4}}>
                  <View style={[styles.badgeMuted]}><Text style={[styles.badgeMutedText]}>{t('verified') as string}</Text></View>
                  {item.emergency && <View style={styles.badgeDanger}><Text style={styles.badgeDangerText}>{t('emergency_badge') as string}</Text></View>}
                </View>
              </View>
              <Text>🏥</Text>
            </View>

            <View style={[styles.metaRow, {marginTop:10}]}> 
              <Text>📏 {item.distance}</Text>
              <Text>· ⏱ {item.time}</Text>
              <Text>· ⭐ {item.rating} <Text style={{color: '#64748b'}}>(234 reviews)</Text></Text>
              <Text style={{color:'#16a34a'}}>○ Open</Text>
            </View>

              <Text style={[styles.address, {marginTop:10, color: colors.textSecondary}]}>{item.address}</Text>

            <View style={{marginTop:10}}>
              <View style={styles.badgeType}><Text style={styles.badgeTypeText}>{item.type}</Text></View>
            </View>

            <View style={{marginTop:10}}>
              <Text style={{fontWeight:'700', color: colors.textPrimary}}>{t('services') as string}:</Text>
              <View style={{flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:6}}>
                {['Emergency Care','Surgery','ICU','+2 more'].map(s => (
                  <View key={s} style={styles.servicePill}><Text style={styles.servicePillText}>{s}</Text></View>
                ))}
              </View>
            </View>

            <View style={{marginTop:10}}>
              <Text style={{fontWeight:'700', color: colors.textPrimary}}>{t('languages_spoken') as string}:</Text>
              <View style={{flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:6}}>
                {['English','Spanish','Hindi'].map(l => (
                  <View key={l} style={styles.langPill}><Text style={styles.langPillText}>{l}</Text></View>
                ))}
              </View>
            </View>

            <Text style={{color: colors.muted, marginTop:10}}>{t('twenty_four_seven') as string}</Text>

            <View style={{flexDirection:'row', gap:12, marginTop:12}}>
              <TouchableOpacity style={[styles.ctaBtn, {backgroundColor:colors.card, borderWidth:1, borderColor:colors.border}]} onPress={() => {
                const mapsUrl = item.coords ? `https://www.google.com/maps/dir/?api=1&destination=${item.coords.lat},${item.coords.lng}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address || item.name)}`;
                Linking.openURL(mapsUrl);
              }}>
                <Text style={{color:colors.textPrimary}}>🧭 {t('directions') as string}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ctaBtn, {backgroundColor:colors.primary}]} onPress={() => item.phone && Linking.openURL(`tel:${item.phone}`)}>
                <Text style={{color:'#fff'}}>📞 {t('call') as string}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={filtersOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={{fontWeight:'800'}}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setFiltersOpen(false)}><Text>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{marginTop:12}} contentContainerStyle={{paddingBottom:16}}>
              <Text style={styles.sectionTitle}>Quick Filters</Text>
              <View style={styles.rowBetween}><Text>Open Now</Text><Switch value={openNow} onValueChange={setOpenNow} /></View>

              <Text style={styles.sectionTitle}>Type</Text>
              <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                {['Hospital','Clinic','Pharmacy','Lab'].map(t => (
                  <TouchableOpacity key={t} onPress={() => setSelectedType(selectedType===t?undefined:t)} style={[styles.choicePill, selectedType===t && styles.choicePillSelected]}>
                    <Text style={[styles.choiceText, selectedType===t && styles.choiceTextSelected]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Search Radius</Text>
              <View style={{flexDirection:'row', gap:8}}>
                {[1,5,10,25].map(km => (
                  <TouchableOpacity key={km} onPress={() => setRadiusKm(radiusKm===km?undefined:km)} style={[styles.choicePill, radiusKm===km && styles.choicePillSelected]}>
                    <Text style={[styles.choiceText, radiusKm===km && styles.choiceTextSelected]}>{km} km</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Minimum Rating</Text>
              <View style={{flexDirection:'row', gap:8}}>
                {[undefined,3,4,5].map(r => (
                  <TouchableOpacity key={String(r)} onPress={() => setMinRating(r as any)} style={[styles.choicePill, minRating===r && styles.choicePillSelected]}>
                    <Text style={[styles.choiceText, minRating===r && styles.choiceTextSelected]}>{r?`${r}+`:'Any'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Services</Text>
              <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                {['Emergency Care','Preventive Care','Dental Care','Lab Tests','Surgery','ICU'].map(s => {
                  const on = services.includes(s);
                  return (
                    <TouchableOpacity key={s} onPress={() => setServices(on?services.filter(x=>x!==s):[...services,s])} style={[styles.choicePill, on && styles.choicePillSelected]}>
                      <Text style={[styles.choiceText, on && styles.choiceTextSelected]}>{s}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionTitle}>Transportation</Text>
              <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                {['Walking Distance','Public Transit','Car Accessible','Free Parking'].map(s => {
                  const val = s.toLowerCase().replace(/\s+/g,'_');
                  const on = transportation.includes(val);
                  return (
                    <TouchableOpacity key={s} onPress={() => setTransportation(on?transportation.filter(x=>x!==val):[...transportation,val])} style={[styles.choicePill, on && styles.choicePillSelected]}>
                      <Text style={[styles.choiceText, on && styles.choiceTextSelected]}>{s}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionTitle}>Insurance Accepted</Text>
              <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                {['Medicare','Medicaid','Aetna','Cigna','UnitedHealth','Kaiser Permanente'].map(i => {
                  const on = insurance.includes(i);
                  return (
                    <TouchableOpacity key={i} onPress={() => setInsurance(on?insurance.filter(x=>x!==i):[...insurance,i])} style={[styles.choicePill, on && styles.choicePillSelected]}>
                      <Text style={[styles.choiceText, on && styles.choiceTextSelected]}>{i}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionTitle}>Languages Spoken</Text>
              <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                {['English','Spanish','French','Chinese','Arabic','Hindi','Russian','Korean','Portuguese','Vietnamese','Tagalog'].map(l => {
                  const on = languages.includes(l);
                  return (
                    <TouchableOpacity key={l} onPress={() => setLanguages(on?languages.filter(x=>x!==l):[...languages,l])} style={[styles.choicePill, on && styles.choicePillSelected]}>
                      <Text style={[styles.choiceText, on && styles.choiceTextSelected]}>{l}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionTitle}>Accessibility</Text>
              <View style={styles.rowBetween}><Text>Wheelchair Accessible</Text><Switch value={wheelchair} onValueChange={setWheelchair} /></View>
            </ScrollView>
            <View style={{flexDirection:'row', justifyContent:'space-between', gap:8}}>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor:'#f1f5f9'}]} onPress={() => { setSelectedType(undefined); setOpenNow(false); setRadiusKm(undefined); setMinRating(undefined); setServices([]); setLanguages([]); setInsurance([]); setTransportation([]); setWheelchair(false); }}>
                <Text>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: colors.primary}]} onPress={() => { 
                // Switch app language based on first selected language
                const langMap: Record<string,string> = { English: 'en', Hindi: 'hi', Spanish: 'es', French: 'fr', Chinese: 'zh', Arabic: 'ar', Russian: 'ru', Korean: 'ko', Portuguese: 'pt', Vietnamese: 'vi', Tagalog: 'tl' };
                if (languages.length) {
                  const code = langMap[languages[0]] || 'en';
                  i18n.changeLanguage(code);
                }
                setFiltersOpen(false);
              }}>
                <Text style={{color:'#fff', fontWeight:'700'}}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  screen: { flex:1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 48, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  brand: { fontWeight:'800', fontSize:21, color: colors.textPrimary },
  heart: { color: colors.danger },
  promo: { marginHorizontal:16, backgroundColor:'#ecfdf5', borderRadius:12, padding:12, flexDirection:'row', alignItems:'center', gap:12 },
  promoTitle: { fontWeight:'800', color: colors.textPrimary },
  promoKicker: { color: colors.textSecondary, fontSize:12 },
  promoSub: { color: colors.textSecondary, marginTop:2, fontSize:12 },
  bookBtn: { backgroundColor: colors.primary, paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  rowPill: { marginTop:12, marginHorizontal:16, backgroundColor:'#fff', borderRadius:999, paddingVertical:10, paddingHorizontal:14, borderWidth:1, borderColor: colors.border, flexDirection:'row' },
  link: { color: colors.accent, fontWeight:'700' },
  searchRow: { flexDirection:'row', gap:8, marginTop:12, paddingHorizontal:16 },
  searchInput: { flex:1, backgroundColor:'#fff', borderRadius:12, paddingHorizontal:12, height:44, borderWidth:1, borderColor: colors.border },
  searchBtn: { backgroundColor: colors.primary, height:44, borderRadius:12, alignItems:'center', justifyContent:'center', paddingHorizontal:16 },
  filtersRow: { flexDirection:'row', gap:10, paddingHorizontal:16, marginTop:12 },
  filterPill: { backgroundColor:'#fff', borderWidth:1, borderColor: colors.border, borderRadius:12, paddingVertical:8, paddingHorizontal:12 },
  resultsMeta: { paddingHorizontal:16, marginTop:12, color: colors.muted },
  card: { backgroundColor:'#fff', marginHorizontal:16, marginTop:12, borderRadius:14, padding:12, elevation:1, borderWidth:1, borderColor: colors.border },
  itemTitle: { fontWeight:'800', color: colors.textPrimary },
  badgeMuted: { backgroundColor: '#eef2ff', paddingHorizontal:8, paddingVertical:4, borderRadius:6 },
  badgeMutedText: { color: '#334155', fontSize:12, fontWeight:'700' },
  badgeDanger: { backgroundColor: '#fee2e2', paddingHorizontal:8, paddingVertical:4, borderRadius:6 },
  badgeDangerText: { color: colors.danger, fontSize:12, fontWeight:'700' },
  metaRow: { flexDirection:'row', gap:8, marginTop:8, alignItems:'center', flexWrap:'wrap' },
  address: { marginTop:6, color: colors.textSecondary },
  badgeType: { alignSelf:'flex-start', backgroundColor:'#e2e8f0', paddingHorizontal:8, paddingVertical:4, borderRadius:6 },
  badgeTypeText: { fontSize:12, color:'#0f172a', fontWeight:'700' }
  ,modalBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.3)', justifyContent:'flex-end' }
  ,modalSheet: { backgroundColor:'#fff', padding:16, borderTopLeftRadius:16, borderTopRightRadius:16, maxHeight:'85%' }
  ,sectionTitle: { marginTop:12, marginBottom:8, fontWeight:'700', color: colors.textPrimary }
  ,rowBetween: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:8 }
  ,choicePill: { backgroundColor:'#f1f5f9', borderWidth:1, borderColor:'#e2e8f0', borderRadius:999, paddingVertical:8, paddingHorizontal:12 }
  ,choicePillSelected: { backgroundColor:'#e0e7ff', borderColor:'#6366f1' }
  ,choiceText: { color:'#0f172a', fontWeight:'600' }
  ,choiceTextSelected: { color:'#3730a3' }
  ,actionBtn: { flex:1, height:44, borderRadius:10, alignItems:'center', justifyContent:'center' }
  ,servicePill: { backgroundColor:'#eef2ff', paddingHorizontal:10, paddingVertical:6, borderRadius:8, borderWidth:1, borderColor:'#e2e8f0' }
  ,servicePillText: { color:'#334155', fontWeight:'700', fontSize:12 }
  ,langPill: { backgroundColor:'#e2e8f0', paddingHorizontal:10, paddingVertical:6, borderRadius:8 }
  ,langPillText: { color:'#0f172a', fontWeight:'700', fontSize:12 }
  ,ctaBtn: { flex:1, height:44, borderRadius:10, alignItems:'center', justifyContent:'center' }
});



