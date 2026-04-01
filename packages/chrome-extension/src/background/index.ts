import { registerMessageHandler } from './messageHandler';
import { getSession } from './sessionManager';
import { supabase } from './supabaseClient';

// ─── Register the message router ─────────────────────────────────
registerMessageHandler();

// ─── Restore session on install / startup ─────────────────────────
async function restoreSession(): Promise<void> {
  const session = await getSession();
  if (!session) return;

  try {
    await supabase.auth.setSession({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });
    console.log('[TextCoach] Session restored for', session.email ?? session.userId);
  } catch (err) {
    console.warn('[TextCoach] Failed to restore session:', err);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  restoreSession();
});

chrome.runtime.onStartup.addListener(() => {
  restoreSession();
});
