import { supabase } from './supabaseClient';
import { config } from './config';
import { saveSession, getSession, clearSession, SessionData } from './sessionManager';

/**
 * Launch Google OAuth via chrome.identity.launchWebAuthFlow,
 * then exchange the returned token with Supabase.
 */
export async function signIn(): Promise<SessionData> {
  const redirectUrl = chrome.identity.getRedirectURL();

  // Build the Supabase OAuth URL that redirects back to the extension
  const authUrl =
    `${config.SUPABASE_URL}/auth/v1/authorize` +
    `?provider=google` +
    `&redirect_to=${encodeURIComponent(redirectUrl)}`;

  const responseUrl = await chrome.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true,
  });

  if (!responseUrl) {
    throw new Error('OAuth flow was cancelled or returned no URL.');
  }

  // Extract tokens from the redirect URL hash fragment
  const url = new URL(responseUrl);
  const hashParams = new URLSearchParams(url.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (!accessToken || !refreshToken) {
    throw new Error('Missing tokens in OAuth redirect.');
  }

  // Set the session in the Supabase client
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? 'Failed to establish Supabase session.');
  }

  const session: SessionData = {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    userId: data.session.user.id,
    email: data.session.user.email,
    expiresAt: data.session.expires_at,
  };

  await saveSession(session);
  return session;
}

/** Clear local session and sign out of Supabase. */
export async function signOut(): Promise<void> {
  await clearSession();
  await supabase.auth.signOut();
}

/** Return the current auth state (session data or null). */
export async function getAuthState(): Promise<SessionData | null> {
  const session = await getSession();
  return session ?? null;
}

/** Return the stored userId, or null if not signed in. */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}
