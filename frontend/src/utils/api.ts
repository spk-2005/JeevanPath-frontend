import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Prefer explicit config; otherwise choose sensible defaults per platform
const extraUrl = (Constants as any)?.expoConfig?.extra?.EXPO_PUBLIC_API_URL
  || (Constants as any)?.manifest?.extra?.EXPO_PUBLIC_API_URL; // older Expo fallback
const envUrl = (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_API_URL) as string | undefined;
// TEMP: Hardcode LAN IP to ensure real device can reach backend. Revert to env/extra once stable.
const BASE_URL = 'http://192.168.157.169:4000';

// Debug: log resolved base URL once
// Note: will print in Metro/Expo logs
// Use this to confirm the device is targeting the correct server
// eslint-disable-next-line no-console
console.log('[API] baseURL =', BASE_URL, '| source =', envUrl ? 'env' : (extraUrl ? 'app.json extra' : (Platform.OS === 'ios' ? 'ios-default' : 'android-emulator-default')));

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




