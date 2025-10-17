import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginState {
  isLoggedIn: boolean;
  phone: string;
  deviceId: string;
  lastLoginAt: string;
}

const LOGIN_STATE_KEY = 'loginState';

export async function saveLoginState(phone: string, deviceId: string): Promise<void> {
  const loginState: LoginState = {
    isLoggedIn: true,
    phone,
    deviceId,
    lastLoginAt: new Date().toISOString()
  };
  
  await AsyncStorage.setItem(LOGIN_STATE_KEY, JSON.stringify(loginState));
}

export async function getLoginState(): Promise<LoginState | null> {
  try {
    const stored = await AsyncStorage.getItem(LOGIN_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error getting login state:', error);
    return null;
  }
}

export async function clearLoginState(): Promise<void> {
  await AsyncStorage.removeItem(LOGIN_STATE_KEY);
}

export async function isLoggedIn(): Promise<boolean> {
  const loginState = await getLoginState();
  return loginState?.isLoggedIn || false;
}

