import { Platform } from 'react-native';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: string;
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  // Try to get existing device ID from storage
  let deviceId = await AsyncStorage.getItem('deviceId');
  
  if (!deviceId) {
    // Generate a unique device ID based on platform and screen dimensions
    const { width, height } = Dimensions.get('window');
    deviceId = `${Platform.OS}-${width}x${height}-${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem('deviceId', deviceId);
  }
  
  const deviceName = `${Platform.OS === 'ios' ? 'iOS' : 'Android'} Device`;
  const platform = Platform.OS;

  return {
    deviceId,
    deviceName,
    platform
  };
}
