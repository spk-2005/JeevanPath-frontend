import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Modal, ScrollView, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useAppColors } from '@/theme/ThemeProvider';
import { getResources } from '@/utils/api';
import { toggleSaved, isResourceSaved } from '@/utils/saved';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t, i18n } = useTranslation();
  const colors = useAppColors();
  const styles = createStyles(colors);
  const [query, setQuery] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [openNow, setOpenNow] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [services, setServices] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<string[]>([]);
  const [transportation, setTransportation] = useState<string[]>([]);
  const [wheelchair, setWheelchair] = useState(false);
  const [nearbyMe, setNearbyMe] = useState(true);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [currentLocation, setCurrentLocation] = useState('JNTUH Campus, Hyderabad');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  // Set default location to JNTUH for testing
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>({ lat: 17.5449, lng: 78.5718 });
  const [searchQuery, setSearchQuery] = useState('');

  // Handle voice search parameters from navigation
  useEffect(() => {
    if (route.params?.searchQuery || route.params?.filterParams) {
      const { searchQuery: voiceQuery, filterParams } = route.params;
      
      console.log('Voice search params received:', { voiceQuery, filterParams });
      
      // Apply filters from voice command
      if (filterParams) {
        // Set search query only if explicitly provided in filterParams
        if (filterParams.hasOwnProperty('searchQuery')) {
          // Use the searchQuery from filterParams (could be empty string for sorting commands)
          setQuery(filterParams.searchQuery || '');
          setSearchQuery(filterParams.searchQuery || '');
        } else if (voiceQuery && !filterParams.sortBy && !filterParams.showAll) {
          // Only use voiceQuery for non-sorting, non-showAll commands
          setQuery(voiceQuery);
          setSearchQuery(voiceQuery);
        } else if (filterParams.sortBy || filterParams.showAll) {
          // For sorting or showAll commands, clear the search query
          setQuery('');
          setSearchQuery('');
        }
        if (filterParams.type) {
          setSelectedType(filterParams.type);
        }
        if (filterParams.minRating) {
          setMinRating(filterParams.minRating);
        }
        if (filterParams.openNow) {
          setOpenNow(filterParams.openNow);
        }
        if (filterParams.emergency) {
          // Handle emergency - could set special filters or show emergency resources
          setOpenNow(true); // Emergency usually needs open facilities
        }
        if (filterParams.near) {
          setNearbyMe(true);
        }
        // Handle sorting parameters from voice command
        if (filterParams.sortBy) {
          console.log('Voice command setting sortBy to:', filterParams.sortBy);
          setSortBy(filterParams.sortBy);
        }
        // Handle show all resources command
        if (filterParams.showAll) {
          setSelectedType(undefined); // Clear type filter to show all
          setQuery(''); // Clear search query to show all
          setSearchQuery('');
        }
      }
      
      // Clear the params to prevent re-triggering
      navigation.setParams({ searchQuery: undefined, filterParams: undefined });
    }
  }, [route.params, navigation]);

  // Get location name from coordinates
  const getLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await response.json();
      if (data.city && data.principalSubdivision) {
        return `${data.city}, ${data.principalSubdivision}`;
      } else if (data.locality) {
        return data.locality;
      } else {
        return 'Current Location';
      }
    } catch (error) {
      console.warn('Failed to get location name:', error);
      return 'Current Location';
    }
  };

  // Get current location and name
  const getCurrentLocation = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      const location = { lat: coords.latitude, lng: coords.longitude };
      setUserLocation(location);
      const locationName = await getLocationName(coords.latitude, coords.longitude);
      setCurrentLocation(locationName);
      console.log('HomeScreen: Got GPS location:', location);
    } catch (error) {
      console.warn('Failed to get current location:', error);
      // Fallback to JNTUH location for testing
      const jntuhLocation = { lat: 17.5449, lng: 78.5718 };
      setUserLocation(jntuhLocation);
      setCurrentLocation('JNTUH Campus, Hyderabad');
      console.log('HomeScreen: Using fallback JNTUH location:', jntuhLocation);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let params: any = { q: query || undefined, type: selectedType ? selectedType.toLowerCase() : undefined, openNow: openNow || undefined, minRating, services, languages, insurance, transportation, wheelchair, sortBy };
        
        console.log('HomeScreen: Loading resources with nearbyMe:', nearbyMe, 'userLocation:', userLocation);
        
        if (nearbyMe || radiusKm) {
          // Use selected location if available, otherwise get current GPS location
          if (userLocation) {
            params = { ...params, lat: userLocation.lat, lng: userLocation.lng, radiusMeters: radiusKm ? radiusKm * 1000 : 15000 };
            console.log('HomeScreen: Using selected location:', userLocation, 'radius:', radiusKm ? radiusKm * 1000 : 15000);
          } else {
            try {
              const { coords } = await Location.getCurrentPositionAsync({});
              params = { ...params, lat: coords.latitude, lng: coords.longitude, radiusMeters: radiusKm ? radiusKm * 1000 : 15000 };
              console.log('HomeScreen: Using GPS location:', coords.latitude, coords.longitude, 'radius:', radiusKm ? radiusKm * 1000 : 15000);
            } catch (locationError) {
              console.warn('Failed to get location for search:', locationError);
              // Continue without location-based search
            }
          }
        }
        
        console.log('HomeScreen: API params:', params);
        const data = await getResources(params);
        console.log('HomeScreen: Received resources:', data?.length || 0);
        
        const mapped = (data || []).map((r: any) => ({
          id: r._id || String(Math.random()),
          name: r.name,
          type: r.type || 'Hospital',
          distance: r.distanceFromUser ? `${r.distanceFromUser}km` : '—',
          distanceValue: r.distanceFromUser || 0,
          time: r.distanceFromUser ? `${Math.ceil(r.distanceFromUser * 2)}min` : '—', // Estimate 2 min per km
          rating: r.rating ? `${r.rating}` : '—',
          status: r.is24Hours ? 'Open 24/7' : (openNow ? 'Open' : '—'),
          emergency: r.emergency || false,
          address: r.address || '—',
          phone: r.contact || undefined,
          coords: r.location && Array.isArray(r.location.coordinates) ? { lat: r.location.coordinates[1], lng: r.location.coordinates[0] } : undefined,
          services: r.services || [],
          languages: r.languages || [],
          wheelchairAccessible: r.wheelchairAccessible || false,
          parkingAvailable: r.parkingAvailable || false,
          is24Hours: r.is24Hours || false
        }));
        // mark saved flags
        const withSavedFlags = await Promise.all(mapped.map(async (m: {id: string, [key: string]: any}) => ({ ...m, __saved: await isResourceSaved(m.id) })));
        
        // Filter by distance if nearbyMe is active and we have location data
        let filteredResources = withSavedFlags;
        if (nearbyMe && userLocation && radiusKm) {
          filteredResources = withSavedFlags.filter(resource => {
            return resource.distanceValue <= radiusKm;
          });
          console.log(`HomeScreen: Filtered to ${filteredResources.length} resources within ${radiusKm}km`);
        }
        
        setResources(filteredResources);
      } catch (err) {
        console.warn('Failed to load resources', err);
        setResources([]);
      }
    })();
  }, [query, selectedType, openNow, radiusKm, minRating, services, languages, insurance, transportation, wheelchair, nearbyMe, sortBy, userLocation]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        navigation.replace('LocationPermission');
      } else {
        getCurrentLocation();
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

      <TouchableOpacity style={[styles.rowPill,{borderColor:colors.border}]} onPress={() => setLocationPickerOpen(true)}>
        <Ionicons name="location" size={16} color={colors.accent} />
        <Text style={{color:colors.textPrimary, marginLeft: 8}}>{t('location_label') as string}</Text>
        <Text style={[styles.link,{color:colors.accent}]}> {currentLocation}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.accent} style={{marginLeft: 4}} />
      </TouchableOpacity>
      <View style={styles.searchRow}>
        <TextInput style={[styles.searchInput,{borderColor:colors.border, color:colors.textPrimary, backgroundColor: colors.card}]} placeholder={t('search_placeholder') as string} placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} />
        <TouchableOpacity style={[styles.searchBtn,{backgroundColor: colors.primary}]}><Text style={{color:'#fff', fontWeight:'700'}}>{t('search') as string}</Text></TouchableOpacity>
      </View>

      <View style={styles.filtersRow}>
        <TouchableOpacity 
          style={[styles.filterPill, nearbyMe && styles.filterPillActive]} 
          onPress={() => setNearbyMe(!nearbyMe)}
        >
          <Ionicons name="location" size={16} color={nearbyMe ? '#fff' : colors.textPrimary} />
          <Text style={{color: nearbyMe ? '#fff' : colors.textPrimary, marginLeft: 4}}>Nearby Me</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterPill} onPress={() => setFiltersOpen(true)}>
          <Ionicons name="options" size={16} color={colors.textPrimary} />
          <Text style={{color:colors.textPrimary, marginLeft: 4}}>
            Filter{useMemo(() => {
              let c = 0; if (selectedType) c++; if (openNow) c++; if (radiusKm) c++;
              return c ? ` (${c})` : '';
            }, [selectedType, openNow, radiusKm])}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterPill} onPress={() => setSortOpen(true)}>
          <Ionicons name="swap-vertical" size={16} color={colors.textPrimary} />
          <Text style={{color:colors.textPrimary, marginLeft: 4}}>Sort: {sortBy}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.resultsMeta,{color:colors.muted}]}>
        {resources.length} resources
        {nearbyMe && userLocation && radiusKm && ` within ${radiusKm}km`}
        {nearbyMe && userLocation && !radiusKm && ` within 15km`}
      </Text>

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
              <Text style={{color: colors.primary, fontWeight:'600'}}>📍 {item.distance}</Text>
              <Text>· ⏱ {item.time}</Text>
              <Text>· ⭐ {item.rating}</Text>
              {item.is24Hours ? (
                <Text style={{color:'#16a34a'}}>· 🕐 24/7</Text>
              ) : (
                <Text style={{color:'#16a34a'}}>· ○ Open</Text>
              )}
            </View>

              <Text style={[styles.address, {marginTop:10, color: colors.textSecondary}]}>{item.address}</Text>

            <View style={{marginTop:10}}>
              <View style={styles.badgeType}><Text style={styles.badgeTypeText}>{item.type}</Text></View>
            </View>

            {item.services && item.services.length > 0 && (
              <View style={{marginTop:10}}>
                <Text style={{fontWeight:'700', color: colors.textPrimary}}>{t('services') as string}:</Text>
                <View style={{flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:6}}>
                  {item.services.slice(0, 3).map((s: string) => (
                    <View key={s} style={styles.servicePill}><Text style={styles.servicePillText}>{s}</Text></View>
                  ))}
                  {item.services.length > 3 && (
                    <View style={styles.servicePill}><Text style={styles.servicePillText}>+{item.services.length - 3} more</Text></View>
                  )}
                </View>
              </View>
            )}

            {item.languages && item.languages.length > 0 && (
              <View style={{marginTop:10}}>
                <Text style={{fontWeight:'700', color: colors.textPrimary}}>{t('languages_spoken') as string}:</Text>
                <View style={{flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:6}}>
                  {item.languages.slice(0, 3).map((l: string) => (
                    <View key={l} style={styles.langPill}><Text style={styles.langPillText}>{l}</Text></View>
                  ))}
                  {item.languages.length > 3 && (
                    <View style={styles.langPill}><Text style={styles.langPillText}>+{item.languages.length - 3} more</Text></View>
                  )}
                </View>
              </View>
            )}

            <View style={{flexDirection:'row', alignItems:'center', gap:16, marginTop:10}}>
              {item.is24Hours && (
                <Text style={{color: '#16a34a', fontWeight:'600'}}>🕐 24/7</Text>
              )}
              {item.wheelchairAccessible && (
                <Text style={{color: colors.primary, fontWeight:'600'}}>♿ Accessible</Text>
              )}
              {item.parkingAvailable && (
                <Text style={{color: colors.textSecondary, fontWeight:'600'}}>🅿️ Parking</Text>
              )}
            </View>

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
              <TouchableOpacity
                accessibilityLabel={item.__saved ? 'Unsave resource' : 'Save resource'}
                style={[styles.ctaBtn, {backgroundColor: colors.card, borderWidth:1, borderColor: colors.border}]}
                onPress={async () => {
                  console.log('HomeScreen: Toggling save for resource:', item.name, 'Current saved:', item.__saved);
                  const nowSaved = await toggleSaved({
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    address: item.address,
                    phone: item.phone,
                    rating: item.rating,
                    coords: item.coords
                  });
                  console.log('HomeScreen: Resource now saved:', nowSaved);
                  setResources(rs => rs.map(r => r.id === item.id ? { ...r, __saved: nowSaved } : r));
                }}
              >
                <Ionicons
                  name={item.__saved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={item.__saved ? '#dc2626' : colors.textPrimary}
                />
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
              <TouchableOpacity 
                style={{padding: 8}} 
                onPress={() => setFiltersOpen(false)}
              >
                <Text style={{fontSize: 18}}>✕</Text>
              </TouchableOpacity>
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
              <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                {[2,5,10,15,25,50].map(km => (
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

      <Modal visible={sortOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={{fontWeight:'800'}}>Sort By</Text>
              <TouchableOpacity onPress={() => setSortOpen(false)}><Text>✕</Text></TouchableOpacity>
            </View>
            <View style={{marginTop:12}}>
              {[
                { key: 'distance', label: 'Distance', icon: 'location' },
                { key: 'rating', label: 'Rating', icon: 'star' },
                { key: 'name', label: 'Name', icon: 'text' }
              ].map(option => (
                <TouchableOpacity 
                  key={option.key}
                  style={[styles.sortOption, sortBy === option.key && styles.sortOptionSelected]}
                  onPress={() => {
                    setSortBy(option.key as any);
                    setSortOpen(false);
                  }}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={sortBy === option.key ? '#fff' : colors.textPrimary} 
                  />
                  <Text style={[styles.sortOptionText, sortBy === option.key && styles.sortOptionTextSelected]}>
                    {option.label}
                  </Text>
                  {sortBy === option.key && <Ionicons name="checkmark" size={20} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={locationPickerOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={{fontWeight:'800'}}>Choose Location</Text>
              <TouchableOpacity onPress={() => setLocationPickerOpen(false)}><Text>✕</Text></TouchableOpacity>
            </View>
            <View style={{marginTop:12}}>
              <TouchableOpacity 
                style={styles.locationOption}
                onPress={async () => {
                  await getCurrentLocation();
                  setLocationPickerOpen(false);
                }}
              >
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={{marginLeft:12, flex:1}}>
                  <Text style={{fontWeight:'600', color: colors.textPrimary}}>Use Current Location</Text>
                  <Text style={{fontSize:12, color: colors.textSecondary, marginTop:2}}>Detect automatically</Text>
                </View>
                <Ionicons name="refresh" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.locationOption}
                onPress={() => {
                  // Open location search modal
                  setLocationSearchOpen(true);
                  setLocationPickerOpen(false);
                }}
              >
                <Ionicons name="search" size={20} color={colors.primary} />
                <View style={{marginLeft:12, flex:1}}>
                  <Text style={{fontWeight:'600', color: colors.textPrimary}}>Search Location</Text>
                  <Text style={{fontSize:12, color: colors.textSecondary, marginTop:2}}>Enter city or address</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.locationOption}
                onPress={() => {
                  // Open map picker modal
                  setMapPickerOpen(true);
                  setLocationPickerOpen(false);
                }}
              >
                <Ionicons name="map" size={20} color={colors.primary} />
                <View style={{marginLeft:12, flex:1}}>
                  <Text style={{fontWeight:'600', color: colors.textPrimary}}>Pick on Map</Text>
                  <Text style={{fontSize:12, color: colors.textSecondary, marginTop:2}}>Select on interactive map</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Search Modal */}
      <Modal visible={locationSearchOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={{fontWeight:'800'}}>Search Location</Text>
              <TouchableOpacity 
                style={{padding: 8}} 
                onPress={() => setLocationSearchOpen(false)}
              >
                <Text style={{fontSize: 18}}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{marginTop:12}}>
              <TextInput 
                style={[styles.searchInput, {marginBottom: 12, color: '#000000', fontSize: 16, padding: 12}]} 
                placeholder="Enter city, address or landmark" 
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#888888"
                autoFocus
              />
              <FlatList
                data={searchQuery ? [
                  {id: '1', name: `${searchQuery}, Telangana`, description: 'Search result', coords: {lat: 16.2160, lng: 80.8467}}, // Guntur coordinates as example
                  {id: '2', name: `${searchQuery} Central, Maharashtra`, description: 'Area in Mumbai', coords: {lat: 19.0760, lng: 72.8777}},
                  {id: '3', name: `${searchQuery} District, Delhi`, description: 'Area in Delhi', coords: {lat: 28.7041, lng: 77.1025}},
                  {id: '4', name: `${searchQuery} Layout, Bangalore`, description: 'Area in Bangalore', coords: {lat: 12.9716, lng: 77.5946}},
                  {id: '5', name: `${searchQuery} Nagar, Chennai`, description: 'Area in Chennai', coords: {lat: 13.0827, lng: 80.2707}}
                ] : [
                  {id: '1', name: 'Hyderabad, Telangana', description: 'City in India', coords: {lat: 17.3850, lng: 78.4867}},
                  {id: '2', name: 'Mumbai, Maharashtra', description: 'City in India', coords: {lat: 19.0760, lng: 72.8777}},
                  {id: '3', name: 'Delhi, India', description: 'Capital of India', coords: {lat: 28.7041, lng: 77.1025}},
                  {id: '4', name: 'Bangalore, Karnataka', description: 'Tech hub of India', coords: {lat: 12.9716, lng: 77.5946}},
                  {id: '5', name: 'Chennai, Tamil Nadu', description: 'City in South India', coords: {lat: 13.0827, lng: 80.2707}},
                  {id: '6', name: 'Guntur, Andhra Pradesh', description: 'City in Andhra Pradesh', coords: {lat: 16.2160, lng: 80.8467}},
                  {id: '7', name: 'Vijayawada, Andhra Pradesh', description: 'City in Andhra Pradesh', coords: {lat: 16.5062, lng: 80.6480}},
                  {id: '8', name: 'Visakhapatnam, Andhra Pradesh', description: 'Port city in Andhra Pradesh', coords: {lat: 17.6868, lng: 83.2185}}
                ]}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity 
                    style={styles.locationOption}
                    onPress={() => {
                      console.log('Location selected:', item.name, 'Coordinates:', item.coords);
                      setCurrentLocation(item.name);
                      if (item.coords) {
                        setUserLocation(item.coords);
                      }
                      setLocationSearchOpen(false);
                    }}
                  >
                    <Ionicons name="location-outline" size={20} color={colors.primary} />
                    <View style={{marginLeft:12, flex:1}}>
                      <Text style={{fontWeight:'600', color: colors.textPrimary}}>{item.name}</Text>
                      <Text style={{fontSize:12, color: colors.textSecondary, marginTop:2}}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Map Picker Modal */}
      <Modal visible={mapPickerOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={{fontWeight:'800'}}>Pick on Map</Text>
              <TouchableOpacity 
                style={{padding: 8}} 
                onPress={() => setMapPickerOpen(false)}
              >
                <Text style={{fontSize: 18}}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{marginTop:12, height: 300, borderRadius: 12}}>
              <MapView 
                style={{width: '100%', height: '100%', borderRadius: 12}}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: 17.3850,
                  longitude: 78.4867,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Marker
                  coordinate={{latitude: 17.3850, longitude: 78.4867}}
                  title="Selected Location"
                  draggable
                />
              </MapView>
            </View>
            <TouchableOpacity 
              style={[styles.actionBtn, {backgroundColor: colors.primary, marginTop: 16}]}
              onPress={() => {
                // Set the coordinates to the map center (you can make this more sophisticated with marker dragging)
                const mapLocation = {lat: 17.3850, lng: 78.4867}; // Default to Hyderabad, can be made dynamic
                setUserLocation(mapLocation);
                setCurrentLocation('Selected Map Location');
                setMapPickerOpen(false);
              }}
            >
              <Text style={{color:'#fff', fontWeight:'700'}}>Confirm Location</Text>
            </TouchableOpacity>
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
  filterPill: { backgroundColor:'#fff', borderWidth:1, borderColor: colors.border, borderRadius:12, paddingVertical:8, paddingHorizontal:12, flexDirection:'row', alignItems:'center' },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
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
  ,ctaBtn: { flex:1, height:44, borderRadius:10, alignItems:'center', justifyContent:'center' },
  sortOption: { flexDirection:'row', alignItems:'center', paddingVertical:12, paddingHorizontal:16, borderRadius:8, marginBottom:8 },
  sortOptionSelected: { backgroundColor: colors.primary },
  sortOptionText: { marginLeft:12, flex:1, color: colors.textPrimary, fontWeight:'600' },
  sortOptionTextSelected: { color: '#fff' },
  locationOption: { flexDirection:'row', alignItems:'center', paddingVertical:16, paddingHorizontal:16, borderRadius:8, marginBottom:8, backgroundColor: colors.card, borderWidth:1, borderColor: colors.border }
});



