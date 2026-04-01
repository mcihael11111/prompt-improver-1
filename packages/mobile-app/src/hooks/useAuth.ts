import { useState, useCallback } from 'react';
import { supabase } from '../services/auth';
import { saveSession, clearSession, getSession } from '../services/storage';

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const restoreSession = useCallback(async () => {
    const session = await getSession();
    if (session) {
      setUserId(session.userId);
      setEmail(session.email || null);
    }
    return session;
  }, []);

  const signInWithEmail = useCallback(async (emailInput: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password,
      });
      if (error) throw error;
      const user = data.user;
      await saveSession({
        userId: user.id,
        email: user.email || undefined,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      });
      setUserId(user.id);
      setEmail(user.email || null);
      return user.id;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    await clearSession();
    setUserId(null);
    setEmail(null);
  }, []);

  return { userId, email, loading, restoreSession, signInWithEmail, signOut };
}
