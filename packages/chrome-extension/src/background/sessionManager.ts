// ─── Session shape stored in chrome.storage.local ─────────────────
export interface SessionData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email?: string;
  expiresAt?: number;
}

const STORAGE_KEY = 'textcoach_session';

/** Persist session data to chrome.storage.local. */
export async function saveSession(data: SessionData): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

/** Read session data from chrome.storage.local (may be undefined). */
export async function getSession(): Promise<SessionData | undefined> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] as SessionData | undefined;
}

/** Remove session data from chrome.storage.local. */
export async function clearSession(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
}
