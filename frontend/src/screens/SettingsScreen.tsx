import React, { useMemo, useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import i18n from '@/i18n';
import { useThemeMode } from '@/theme/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { clearLoginState } from '../utils/auth';
import ContactFormScreen from '@/screens/ContactFormScreen';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { setMode, effective } = useThemeMode();
  const [dark, setDark] = useState(effective === 'dark');
  const [offline, setOffline] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi' | 'te'>(i18n.language as any || 'en');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const navigation = useNavigation<any>();

  const changeLang = (code: 'en' | 'hi' | 'te') => {
    setLang(code);
    i18n.changeLanguage(code);
    setPickerOpen(false);
  };

  const langLabel = useMemo(() => ({ en: 'English', hi: 'हिन्दी', te: 'తెలుగు' }[lang]), [lang]);

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: dark ? '#111827' : '#f9fafb'
    },
    header: {
      backgroundColor: dark ? '#1f2937' : '#ffffff',
      borderBottomColor: dark ? '#374151' : '#e5e7eb'
    },
    headerTitle: {
      color: dark ? '#f9fafb' : '#111827'
    },
    headerSubtitle: {
      color: dark ? '#9ca3af' : '#6b7280'
    },
    sectionTitle: {
      color: dark ? '#d1d5db' : '#374151'
    },
    card: {
      backgroundColor: dark ? '#1f2937' : '#ffffff',
      borderColor: dark ? '#374151' : 'transparent'
    },
    settingLabel: {
      color: dark ? '#f3f4f6' : '#111827'
    },
    settingDescription: {
      color: dark ? '#9ca3af' : '#6b7280'
    },
    settingValue: {
      color: dark ? '#60a5fa' : '#2563eb'
    },
    changeButton: {
      backgroundColor: dark ? '#1e3a8a' : '#eff6ff'
    },
    changeButtonText: {
      color: dark ? '#93c5fd' : '#2563eb'
    },
    languageList: {
      borderTopColor: dark ? '#374151' : '#e5e7eb',
      backgroundColor: dark ? '#1f2937' : 'transparent'
    },
    languageItem: {
      backgroundColor: 'transparent'
    },
    languageItemActive: {
      backgroundColor: dark ? '#1e3a8a' : '#eff6ff'
    },
    languageText: {
      color: dark ? '#e5e7eb' : '#374151'
    },
    languageTextActive: {
      color: dark ? '#93c5fd' : '#2563eb'
    },
    languageTextDisabled: {
      color: dark ? '#6b7280' : '#9ca3af'
    },
    languageDivider: {
      backgroundColor: dark ? '#374151' : '#e5e7eb'
    },
    comingSoonBadge: {
      backgroundColor: dark ? '#374151' : '#f3f4f6',
      color: dark ? '#9ca3af' : '#6b7280'
    },
    contactCard: {
      backgroundColor: dark ? '#1f2937' : '#ffffff',
      borderColor: dark ? '#374151' : 'transparent'
    },
    emergencyCard: {
      borderColor: dark ? '#7f1d1d' : '#fee2e2'
    },
    contactIconContainer: {
      backgroundColor: dark ? '#1e3a8a' : '#eff6ff'
    },
    emergencyIconContainer: {
      backgroundColor: dark ? '#7f1d1d' : '#fef2f2'
    },
    contactTitle: {
      color: dark ? '#f3f4f6' : '#111827'
    },
    contactSubtitle: {
      color: dark ? '#9ca3af' : '#6b7280'
    },
    appInfoText: {
      color: dark ? '#6b7280' : '#9ca3af'
    },
    appInfoSubtext: {
      color: dark ? '#4b5563' : '#d1d5db'
    },
    logoutContainer: {
      backgroundColor: dark ? '#111827' : '#f9fafb',
      borderTopColor: dark ? '#374151' : '#e5e7eb'
    },
    registrationButton: {
      backgroundColor: dark ? '#1e3a8a' : '#eff6ff',
      borderColor: dark ? '#2563eb' : '#2563eb'
    },
    registrationButtonText: {
      color: dark ? '#93c5fd' : '#2563eb'
    }
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, dynamicStyles.header]}>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Settings</Text>
          <Text style={[styles.headerSubtitle, dynamicStyles.headerSubtitle]}>Manage your app preferences</Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Preferences</Text>

          {/* Language Selection */}
          <View style={[styles.settingCard, dynamicStyles.card]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="language" size={24} color={dark ? '#60a5fa' : '#2563eb'} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>{t('settings_language') as string}</Text>
                  <Text style={[styles.settingValue, dynamicStyles.settingValue]}>{langLabel}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setPickerOpen(v => !v)}
                style={[styles.changeButton, dynamicStyles.changeButton]}
              >
                <Text style={[styles.changeButtonText, dynamicStyles.changeButtonText]}>Change</Text>
                <Ionicons name={pickerOpen ? "chevron-up" : "chevron-down"} size={16} color={dark ? '#93c5fd' : '#2563eb'} />
              </TouchableOpacity>
            </View>

            {pickerOpen && (
              <View style={[styles.languageList, dynamicStyles.languageList]}>
                <ScrollView style={styles.languageScrollView}>
                  <TouchableOpacity
                    style={[styles.languageItem, lang === 'en' && dynamicStyles.languageItemActive]}
                    onPress={() => changeLang('en')}
                  >
                    <Text style={[dynamicStyles.languageText, lang === 'en' && dynamicStyles.languageTextActive]}>English</Text>
                    {lang === 'en' && <Ionicons name="checkmark" size={20} color={dark ? '#93c5fd' : '#2563eb'} />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.languageItem, lang === 'hi' && dynamicStyles.languageItemActive]}
                    onPress={() => changeLang('hi')}
                  >
                    <Text style={[dynamicStyles.languageText, lang === 'hi' && dynamicStyles.languageTextActive]}>हिन्दी</Text>
                    {lang === 'hi' && <Ionicons name="checkmark" size={20} color={dark ? '#93c5fd' : '#2563eb'} />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.languageItem, lang === 'te' && dynamicStyles.languageItemActive]}
                    onPress={() => changeLang('te')}
                  >
                    <Text style={[dynamicStyles.languageText, lang === 'te' && dynamicStyles.languageTextActive]}>తెలుగు</Text>
                    {lang === 'te' && <Ionicons name="checkmark" size={20} color={dark ? '#93c5fd' : '#2563eb'} />}
                  </TouchableOpacity>

                  {/* Additional languages (disabled for now) */}
                  <View style={[styles.languageDivider, dynamicStyles.languageDivider]} />
                  <TouchableOpacity style={[styles.languageItem, styles.languageItemDisabled]} disabled>
                    <Text style={dynamicStyles.languageTextDisabled}>Español</Text>
                    <Text style={[styles.comingSoonBadge, dynamicStyles.comingSoonBadge]}>Soon</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.languageItem, styles.languageItemDisabled]} disabled>
                    <Text style={dynamicStyles.languageTextDisabled}>Français</Text>
                    <Text style={[styles.comingSoonBadge, dynamicStyles.comingSoonBadge]}>Soon</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.languageItem, styles.languageItemDisabled]} disabled>
                    <Text style={dynamicStyles.languageTextDisabled}>Deutsch</Text>
                    <Text style={[styles.comingSoonBadge, dynamicStyles.comingSoonBadge]}>Soon</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.languageItem, styles.languageItemDisabled]} disabled>
                    <Text style={dynamicStyles.languageTextDisabled}>中文</Text>
                    <Text style={[styles.comingSoonBadge, dynamicStyles.comingSoonBadge]}>Soon</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.languageItem, styles.languageItemDisabled]} disabled>
                    <Text style={dynamicStyles.languageTextDisabled}>日本語</Text>
                    <Text style={[styles.comingSoonBadge, dynamicStyles.comingSoonBadge]}>Soon</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Dark Mode */}
          <View style={[styles.settingCard, dynamicStyles.card]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name={dark ? "moon" : "sunny"} size={24} color={dark ? '#60a5fa' : '#2563eb'} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>{t('settings_dark_mode') as string}</Text>
                  <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>Reduce eye strain in low light</Text>
                </View>
              </View>
              <Switch
                value={dark}
                onValueChange={(v) => {
                  setDark(v);
                  setMode(v ? 'dark' : 'light');
                }}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

          {/* Offline Mode */}
          <View style={[styles.settingCard, dynamicStyles.card]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name={offline ? "cloud-offline" : "cloud-done"} size={24} color={dark ? '#60a5fa' : '#2563eb'} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>{t('settings_offline') as string}</Text>
                  <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>Access content without internet</Text>
                </View>
              </View>
              <Switch
                value={offline}
                onValueChange={setOffline}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Service Providers Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Service Providers</Text>

          {/* Registration Button */}
          <TouchableOpacity
            style={[styles.registrationCard, dynamicStyles.registrationButton]}
            onPress={() => setShowContactForm(true)}
          >
            <View style={styles.registrationContent}>
              <Ionicons name="add-circle" size={28} color={dark ? '#60a5fa' : '#2563eb'} />
              <View style={styles.registrationText}>
                <Text style={[styles.registrationTitle, dynamicStyles.settingLabel]}>Register as Service Provider</Text>
                <Text style={[styles.registrationSubtitle, dynamicStyles.settingDescription]}>Add your medical resource to our network</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={dark ? '#60a5fa' : '#2563eb'} />
          </TouchableOpacity>
        </View>

        {/* Contact & Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Contact & Support</Text>

          <TouchableOpacity
            style={[styles.contactCard, dynamicStyles.contactCard]}
            onPress={() => {
              Alert.alert(
                'Contact Admin',
                'Choose how you would like to contact the administrator:',
                [
                  { text: 'Call', onPress: () => Linking.openURL('tel:+919876543210') },
                  { text: 'Email', onPress: () => Linking.openURL('mailto:admin@jeevanpath.com') },
                  { text: 'WhatsApp', onPress: () => Linking.openURL('https://wa.me/919876543210') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <View style={[styles.contactIconContainer, dynamicStyles.contactIconContainer]}>
              <Ionicons name="person-circle" size={28} color={dark ? '#60a5fa' : '#2563eb'} />
            </View>
            <View style={styles.contactContent}>
              <Text style={[styles.contactTitle, dynamicStyles.contactTitle]}>Contact Admin</Text>
              <Text style={[styles.contactSubtitle, dynamicStyles.contactSubtitle]}>Get help or report issues</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactCard, dynamicStyles.contactCard, dynamicStyles.emergencyCard]}
            onPress={() => {
              Alert.alert(
                'Emergency Contact',
                'For urgent medical assistance, please call emergency services.',
                [
                  { text: 'Call 108 (Emergency)', onPress: () => Linking.openURL('tel:108') },
                  { text: 'Call 102 (Ambulance)', onPress: () => Linking.openURL('tel:102') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <View style={[styles.contactIconContainer, dynamicStyles.emergencyIconContainer]}>
              <Ionicons name="medical" size={28} color="#ef4444" />
            </View>
            <View style={styles.contactContent}>
              <Text style={[styles.contactTitle, dynamicStyles.contactTitle]}>Emergency Services</Text>
              <Text style={[styles.contactSubtitle, dynamicStyles.contactSubtitle]}>Call 108 or 102 for emergencies</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, dynamicStyles.appInfoText]}>JeevanPath v1.0.0</Text>
          <Text style={[styles.appInfoSubtext, dynamicStyles.appInfoSubtext]}>© 2025 All rights reserved</Text>
        </View>
      </ScrollView>

      {/* Contact Form Modal */}
      <Modal
        visible={showContactForm}
        animationType="slide"
        onRequestClose={() => setShowContactForm(false)}
      >
        <ContactFormScreen onClose={() => setShowContactForm(false)} />
      </Modal>

      {/* Logout Button */}
      <View style={[styles.logoutContainer, dynamicStyles.logoutContainer]}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await clearLoginState();
                      await AsyncStorage.clear();
                    } catch { }
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>{t('logout') as string}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  settingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingText: {
    marginLeft: 12,
    flex: 1
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500'
  },
  settingDescription: {
    fontSize: 13
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4
  },
  languageList: {
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 8
  },
  languageScrollView: {
    maxHeight: 280
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4
  },
  languageItemDisabled: {
    opacity: 0.5
  },
  languageDivider: {
    height: 1,
    marginVertical: 8
  },
  comingSoonBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600'
  },
  registrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1
  },
  registrationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  registrationText: {
    marginLeft: 12,
    flex: 1
  },
  registrationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  registrationSubtitle: {
    fontSize: 13
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contactContent: {
    flex: 1,
    marginLeft: 12
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  contactSubtitle: {
    fontSize: 13
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20
  },
  appInfoText: {
    fontSize: 13,
    fontWeight: '500'
  },
  appInfoSubtext: {
    fontSize: 12,
    marginTop: 4
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    height: 52,
    borderRadius: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8
  }
});