import axios from 'axios';
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Prefer explicit config; otherwise choose sensible defaults per platform
const extraUrl = (Constants as any)?.expoConfig?.extra?.EXPO_PUBLIC_API_URL
  || (Constants as any)?.manifest?.extra?.EXPO_PUBLIC_API_URL; // older Expo fallback
const envUrl = (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_API_URL) as string | undefined;

// Try to derive LAN host from Expo/Metro host when running in dev, but only accept real LAN IPs
const guessedLan = (() => {
  try {
    const hostUri = (Constants as any)?.expoConfig?.hostUri
      || (Constants as any)?.manifest?.debuggerHost
      || (NativeModules as any)?.SourceCode?.scriptURL; // Metro dev server URL

    if (hostUri) {
      const hostPart = String(hostUri).split('//').pop() as string;
      const hostname = hostPart.split(':')[0];
      // Accept only IPv4 LAN addresses; ignore localhost, 127.0.0.1, and tunnel hostnames
      const isIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
      const isLoopback = hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === 'localhost';
      if (isIpv4 && !isLoopback) {
        return `http://${hostname}:4000`;
      }
    }
  } catch {}
  return undefined;
})();

// Safe defaults for emulators/simulators
// Override Android fallback to your hosted backend
const defaultUrl = Platform.OS === 'android' ? 'https://jeevanpath-frontend.onrender.com' : 'https://jeevanpath-frontend.onrender.com';

// Prefer the Expo/Metro host on-device to avoid 10.0.2.2 on physical devices
let CURRENT_BASE_URL = (extraUrl || envUrl || guessedLan || defaultUrl);

// Debug: log resolved base URL once
// Note: will print in Metro/Expo logs
// Use this to confirm the device is targeting the correct server
// eslint-disable-next-line no-console
console.log(
  '[API] baseURL =',
  CURRENT_BASE_URL,
  '| source =',
  extraUrl ? 'app.json extra' : (envUrl ? 'env' : (guessedLan ? 'expo-host' : (Platform.OS === 'ios' ? 'ios-default' : 'android-emulator-default')))
);

export const api = axios.create({
  baseURL: CURRENT_BASE_URL,
  timeout: 15000,
});

// Debug: log request/response errors centrally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // eslint-disable-next-line no-console
    console.log('[API] error', {
      message: error?.message,
      code: error?.code,
      url: error?.config?.baseURL + (error?.config?.url || ''),
      method: error?.config?.method,
      params: error?.config?.params,
      data: error?.config?.data,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      responseData: error?.response?.data
    });
    return Promise.reject(error);
  }
);

// Allow runtime override of API base URL via AsyncStorage
export async function loadApiBaseUrlOverride(): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem('apiBaseUrl');
    // Only apply storage override if no explicit config is provided
    if (!extraUrl && !envUrl && stored && typeof stored === 'string' && stored.startsWith('http')) {
      const normalized = stored.replace(/\/$/, '');
      const isLoopback = /^(http:\/\/localhost|http:\/\/127\.0\.0\.1|http:\/\/10\.0\.2\.2)/i.test(normalized);
      if (!isLoopback) {
        CURRENT_BASE_URL = normalized;
        api.defaults.baseURL = CURRENT_BASE_URL;
        // eslint-disable-next-line no-console
        console.log('[API] override baseURL =', CURRENT_BASE_URL, '| source =', 'storage');
        return CURRENT_BASE_URL;
      }
    }
  } catch {}
  return null;
}

export async function setApiBaseUrlOverride(url: string): Promise<void> {
  const normalized = (url || '').trim().replace(/\/$/, '');
  await AsyncStorage.setItem('apiBaseUrl', normalized);
  CURRENT_BASE_URL = normalized;
  api.defaults.baseURL = CURRENT_BASE_URL;
  // eslint-disable-next-line no-console
  console.log('[API] override baseURL set =', CURRENT_BASE_URL);
}

// Load override on module import
void loadApiBaseUrlOverride();

// Simple connectivity check to help diagnose device ↔ server reachability
export async function pingApi(): Promise<{ ok: boolean; baseURL: string; error?: string }> {
  try {
    const res = await api.get('/');
    return { ok: !!res?.data, baseURL: CURRENT_BASE_URL };
  } catch (e: any) {
    return { ok: false, baseURL: CURRENT_BASE_URL, error: e?.message || 'Network Error' };
  }
}

export async function getResources(params?: { type?: string; q?: string; minRating?: number; openNow?: boolean; lat?: number; lng?: number; radiusMeters?: number; services?: string[]; languages?: string[]; insurance?: string[]; transportation?: string[]; wheelchair?: boolean; sortBy?: 'distance' | 'rating' }) {
  // eslint-disable-next-line no-console
  console.log('[API] GET /api/resources params =', params);
  const res = await api.get('/api/resources', { params });
  // eslint-disable-next-line no-console
  console.log('[API] GET /api/resources ok count =', Array.isArray(res.data) ? res.data.length : 'n/a');
  return res.data;
}

export async function checkDeviceRegistration(phone: string, deviceId: string, platform: string) {
  // eslint-disable-next-line no-console
  console.log('[API] POST /api/users/check-device', { phone, deviceId, platform });
  const res = await api.post('/api/users/check-device', { phone, deviceId, platform });
  // eslint-disable-next-line no-console
  console.log('[API] POST /api/users/check-device response =', res.data);
  return res.data;
}

export async function registerDevice(phone: string, deviceId: string, deviceName: string, platform: string) {
  // eslint-disable-next-line no-console
  console.log('[API] POST /api/users/register-device', { phone, deviceId, deviceName, platform });
  const res = await api.post('/api/users/register-device', { phone, deviceId, deviceName, platform });
  // eslint-disable-next-line no-console
  console.log('[API] POST /api/users/register-device response =', res.data);
  return res.data;
}

export async function submitContactForm(formData: any) {
  // eslint-disable-next-line no-console
  console.log('[API] POST /api/contact-form', formData);
  const res = await api.post('/api/contact-form', formData);
  // eslint-disable-next-line no-console
  console.log('[API] POST /api/contact-form response =', res.data);
  return res.data;
}

export async function processVoiceCommand(text: string, userContext?: { userId?: string; location?: { lat: number; lng: number }; previousQueries?: string[] }) {
  // eslint-disable-next-line no-console
  console.log('[API] POST /api/nlp/process', { text, userContext });
  const res = await api.post('/api/nlp/process', { text, userContext });
  // eslint-disable-next-line no-console
  console.log('[API] POST /api/nlp/process response =', res.data);
  return res.data;
}

export async function getVoiceAnalytics(userId?: string) {
  // eslint-disable-next-line no-console
  console.log('[API] GET /api/nlp/analytics', { userId });
  const res = await api.get('/api/nlp/analytics', { params: { userId } });
  // eslint-disable-next-line no-console
  console.log('[API] GET /api/nlp/analytics response =', res.data);
  return res.data;
}




