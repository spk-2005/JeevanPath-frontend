import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Prefer explicit config; otherwise choose sensible defaults per platform
const extraUrl = (Constants as any)?.expoConfig?.extra?.EXPO_PUBLIC_API_URL
  || (Constants as any)?.manifest?.extra?.EXPO_PUBLIC_API_URL; // older Expo fallback
const envUrl = (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_API_URL) as string | undefined;

// Try to derive LAN host from Expo debugger/host when running in dev
const guessedLan = (() => {
  try {
    const hostUri = (Constants as any)?.expoConfig?.hostUri || (Constants as any)?.manifest?.debuggerHost;
    if (hostUri) {
      const hostname = String(hostUri).split(':')[0];
      return `http://${hostname}:4000`;
    }
  } catch {}
  return undefined;
})();

// Safe defaults for emulators/simulators
const defaultUrl = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

// Prefer guessed Expo host when running in Expo Go on a physical device
const inExpoGo = (Constants as any)?.appOwnership === 'expo';
const BASE_URL = inExpoGo
  ? (guessedLan || envUrl || extraUrl || defaultUrl)
  : (envUrl || extraUrl || guessedLan || defaultUrl);

// Debug: log resolved base URL once
// Note: will print in Metro/Expo logs
// Use this to confirm the device is targeting the correct server
// eslint-disable-next-line no-console
console.log('[API] baseURL =', BASE_URL, '| source =', inExpoGo ? (guessedLan ? 'expo-host' : 'expo-default') : (envUrl ? 'env' : (extraUrl ? 'app.json extra' : (guessedLan ? 'expo-host' : (Platform.OS === 'ios' ? 'ios-default' : 'android-emulator-default')))));

export const api = axios.create({
  baseURL: BASE_URL,
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




