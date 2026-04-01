// ─── Auth hook — delegates to background service worker ───────────
import { useState, useEffect, useCallback } from 'react';

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  email: null,
  loading: true,
};

/** Send a typed message to the background and await a response. */
function sendMessage<T = unknown>(
  type: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, ...payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response as T);
      }
    });
  });
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Fetch auth state from background on mount
  useEffect(() => {
    sendMessage<AuthState>('getAuthState')
      .then((state) => setAuthState({ ...state, loading: false }))
      .catch(() => setAuthState({ ...initialState, loading: false }));
  }, []);

  const signIn = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      const state = await sendMessage<AuthState>('signIn');
      setAuthState({ ...state, loading: false });
    } catch {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      await sendMessage('signOut');
      setAuthState({ ...initialState, loading: false });
    } catch {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const result = await sendMessage<{ userId: string | null }>('getUserId');
      return result.userId;
    } catch {
      return null;
    }
  }, []);

  return { authState, signIn, signOut, getUserId };
}
