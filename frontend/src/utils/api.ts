import axios from 'axios';

const BASE_URL = (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_API_URL) || 'http://10.0.2.2:4000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export async function getResources(params?: { type?: string; q?: string; minRating?: number; openNow?: boolean; lat?: number; lng?: number; radiusMeters?: number; services?: string[]; languages?: string[]; insurance?: string[]; transportation?: string[]; wheelchair?: boolean; sortBy?: 'distance' | 'rating' }) {
  const res = await api.get('/api/resources', { params });
  return res.data;
}




