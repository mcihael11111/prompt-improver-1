// ─── API hook — wraps fetch with userId & config from background ──
import { useCallback, useRef, useEffect } from 'react';
import { apiFetch, ApiError } from '../services/api';

/** Shape of API responses */
export interface SuggestionsResponse {
  suggestions: string[];
  dynamics?: string[];
  remaining?: number;
}

export interface CoachStartResponse {
  conversationId: string;
  question: string;
}

export interface CoachAnswerResponse {
  conversationId: string;
  question?: string;
  suggestions?: string[];
  dynamics?: string[];
  done: boolean;
}

export interface PlanResponse {
  plan: string;
  remaining: number;
}

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

export function useApi() {
  const baseUrlRef = useRef<string>('');

  useEffect(() => {
    sendMessage<{ apiUrl: string }>('getConfig')
      .then(({ apiUrl }) => {
        baseUrlRef.current = apiUrl;
      })
      .catch(() => {
        baseUrlRef.current = '';
      });
  }, []);

  const getUserId = useCallback(async (): Promise<string> => {
    const result = await sendMessage<{ userId: string | null }>('getUserId');
    if (!result.userId) throw new Error('Not authenticated');
    return result.userId;
  }, []);

  // ── Quick Suggest ───────────────────────────────────────────────
  const quickSuggest = useCallback(
    async (
      conversation: string,
      platform?: string,
    ): Promise<SuggestionsResponse> => {
      const userId = await getUserId();
      return apiFetch<SuggestionsResponse>(
        `${baseUrlRef.current}/quick-suggest`,
        {
          method: 'POST',
          body: { userId, conversation, platform },
        },
      );
    },
    [getUserId],
  );

  // ── Coach Mode: start ──────────────────────────────────────────
  const startCoach = useCallback(
    async (
      conversation: string,
      platform?: string,
    ): Promise<CoachStartResponse> => {
      const userId = await getUserId();
      return apiFetch<CoachStartResponse>(
        `${baseUrlRef.current}/coach`,
        {
          method: 'POST',
          body: { userId, conversation, platform },
        },
      );
    },
    [getUserId],
  );

  // ── Coach Mode: submit answer ──────────────────────────────────
  const submitAnswer = useCallback(
    async (
      conversationId: string,
      answer: string,
    ): Promise<CoachAnswerResponse> => {
      const userId = await getUserId();
      return apiFetch<CoachAnswerResponse>(
        `${baseUrlRef.current}/answer`,
        {
          method: 'POST',
          body: { userId, conversationId, answer },
        },
      );
    },
    [getUserId],
  );

  // ── Coach Mode: undo answer ────────────────────────────────────
  const undoAnswer = useCallback(
    async (conversationId: string): Promise<CoachAnswerResponse> => {
      const userId = await getUserId();
      return apiFetch<CoachAnswerResponse>(
        `${baseUrlRef.current}/undo-answer`,
        {
          method: 'POST',
          body: { userId, conversationId },
        },
      );
    },
    [getUserId],
  );

  // ── Remaining suggestions ─────────────────────────────────────
  const getRemaining = useCallback(async (): Promise<number> => {
    const userId = await getUserId();
    const res = await apiFetch<{ remaining: number }>(
      `${baseUrlRef.current}/remaining-prompts?userId=${encodeURIComponent(userId)}`,
    );
    return res.remaining;
  }, [getUserId]);

  // ── Current plan ───────────────────────────────────────────────
  const getPlan = useCallback(async (): Promise<PlanResponse> => {
    const userId = await getUserId();
    return apiFetch<PlanResponse>(
      `${baseUrlRef.current}/remaining-prompts/plan?userId=${encodeURIComponent(userId)}`,
    );
  }, [getUserId]);

  return {
    quickSuggest,
    startCoach,
    submitAnswer,
    undoAnswer,
    getRemaining,
    getPlan,
  };
}

export { ApiError };
