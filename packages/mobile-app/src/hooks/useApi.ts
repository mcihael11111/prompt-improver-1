import { useState, useCallback } from 'react';
import * as api from '../services/api';

export function useApi(userId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickSuggest = useCallback(async (conversation: string, platform?: string) => {
    if (!userId) throw new Error('Not signed in');
    setLoading(true);
    setError(null);
    try {
      return await api.quickSuggest(conversation, userId, platform);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const startCoach = useCallback(async (conversation: string, platform?: string) => {
    if (!userId) throw new Error('Not signed in');
    setLoading(true);
    setError(null);
    try {
      return await api.startCoach(conversation, userId, platform);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const submitAnswer = useCallback(async (conversationId: string, answer: string | object) => {
    if (!userId) throw new Error('Not signed in');
    setLoading(true);
    setError(null);
    try {
      return await api.submitAnswer(conversationId, answer, userId);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const undoAnswer = useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      return await api.undoAnswer(conversationId);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, quickSuggest, startCoach, submitAnswer, undoAnswer };
}
