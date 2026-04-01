import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'textcoach_session';

interface SessionData {
  userId: string;
  email?: string;
  accessToken: string;
  refreshToken: string;
}

export async function saveSession(data: SessionData): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export async function getSession(): Promise<SessionData | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
