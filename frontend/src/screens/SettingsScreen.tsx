import React, { useMemo, useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '@/i18n';
import { useThemeMode } from '@/theme/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { clearLoginState } from '../utils/auth';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { mode, setMode, effective } = useThemeMode();
  const [dark, setDark] = useState(effective === 'dark');
  const [offline, setOffline] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi' | 'te'>(i18n.language as any || 'en');
  const [pickerOpen, setPickerOpen] = useState(false);
  const navigation = useNavigation<any>();
  const changeLang = (code: 'en' | 'hi' | 'te') => {
    setLang(code);
    i18n.changeLanguage(code);
    setPickerOpen(false);
  };
  const langLabel = useMemo(() => ({ en: 'English', hi: 'हिन्दी', te: 'తెలుగు' }[lang]), [lang]);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
      <View style={{ position:'relative' }}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('settings_language') as string}</Text>
          <TouchableOpacity onPress={() => setPickerOpen(v => !v)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{langLabel}</Text>
            <Text style={{marginLeft:6}}>▾</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.langChosen}>{langLabel}</Text>
        {pickerOpen && (
          <View style={styles.dropdownMenu}>
            <ScrollView style={{maxHeight:320}}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => changeLang('en')}><Text>English</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => changeLang('hi')}><Text>हिन्दी</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => changeLang('te')}><Text>తెలుగు</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Español</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Français</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Deutsch</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Português</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Italiano</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Русский</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>العربية</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>中文</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>日本語</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>한국어</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Türkçe</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Nederlands</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Svenska</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Norsk</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Dansk</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Suomi</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Polski</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Čeština</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Magyar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Română</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Български</Text></TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>
      <View style={styles.row}><Text style={styles.label}>{t('settings_dark_mode') as string}</Text><Switch value={dark} onValueChange={(v) => { setDark(v); setMode(v ? 'dark' : 'light'); }} /></View>
      <View style={styles.row}><Text style={styles.label}>{t('settings_offline') as string}</Text><Switch value={offline} onValueChange={setOffline} /></View>
      </ScrollView>
      <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
        try { 
          await clearLoginState();
          await AsyncStorage.clear(); 
        } catch {}
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }}>
        <Text style={styles.logoutText}>{t('logout') as string}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { fontWeight: '600' }
  ,dropdownButton: { flexDirection:'row', alignItems:'center', paddingVertical:6, paddingHorizontal:10, borderWidth:1, borderColor:'#e2e8f0', borderRadius:10, backgroundColor:'#f8fafc' }
  ,dropdownButtonText: { fontWeight:'600' }
  ,dropdownMenu: { position:'absolute', right:0, top:44, width:240, backgroundColor:'#fff', borderWidth:1, borderColor:'#e2e8f0', borderRadius:10, elevation:3, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:10 }
  ,dropdownItem: { paddingVertical:10, paddingHorizontal:12 }
  ,langChosen: { marginTop:4, color:'#64748b' }
  ,logoutBtn: { position:'absolute', left:16, right:16, bottom:16, backgroundColor:'#ef4444', height:44, borderRadius:10, alignItems:'center', justifyContent:'center' }
  ,logoutText: { color:'#fff', fontWeight:'700' }
});






