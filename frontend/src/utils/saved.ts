import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedResource = {
  id: string;
  name: string;
  type?: string;
  address?: string;
  phone?: string;
  rating?: string;
  coords?: { lat: number; lng: number };
};

const SAVED_KEY = 'savedResources:v1';

export async function getSavedResources(): Promise<SavedResource[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function isResourceSaved(id: string): Promise<boolean> {
  const list = await getSavedResources();
  return list.some(r => r.id === id);
}

export async function saveResource(resource: SavedResource): Promise<void> {
  const list = await getSavedResources();
  const exists = list.some(r => r.id === resource.id);
  if (exists) return;
  const next = [resource, ...list].slice(0, 200);
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
}

export async function removeSavedResource(id: string): Promise<void> {
  const list = await getSavedResources();
  const next = list.filter(r => r.id !== id);
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
}

export async function toggleSaved(resource: SavedResource): Promise<boolean> {
  const saved = await isResourceSaved(resource.id);
  if (saved) {
    await removeSavedResource(resource.id);
    return false;
  }
  await saveResource(resource);
  return true;
}



