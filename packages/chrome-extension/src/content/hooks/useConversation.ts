// ─── Coach mode conversation state ────────────────────────────────
import { useState, useCallback } from 'react';
import { useApi, type CoachAnswerResponse } from './useApi';

export interface ConversationState {
  conversationId: string | null;
  currentQuestion: string | null;
  questionHistory: string[];
  suggestions: string[] | null;
  dynamics: string[] | null;
  done: boolean;
}

const initialState: ConversationState = {
  conversationId: null,
  currentQuestion: null,
  questionHistory: [],
  suggestions: null,
  dynamics: null,
  done: false,
};

export function useConversation() {
  const [state, setState] = useState<ConversationState>(initialState);
  const api = useApi();

  const startCoach = useCallback(
    async (conversation: string, platform?: string) => {
      const result = await api.startCoach(conversation, platform);
      setState({
        conversationId: result.conversationId,
        currentQuestion: result.question,
        questionHistory: [result.question],
        suggestions: null,
        dynamics: null,
        done: false,
      });
      return result;
    },
    [api],
  );

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!state.conversationId) throw new Error('No active conversation');
      const result: CoachAnswerResponse = await api.submitAnswer(
        state.conversationId,
        answer,
      );

      setState((prev) => ({
        ...prev,
        currentQuestion: result.question ?? null,
        questionHistory: result.question
          ? [...prev.questionHistory, result.question]
          : prev.questionHistory,
        suggestions: result.suggestions ?? null,
        dynamics: result.dynamics ?? null,
        done: result.done,
      }));
      return result;
    },
    [api, state.conversationId],
  );

  const undoAnswer = useCallback(async () => {
    if (!state.conversationId) throw new Error('No active conversation');
    const result: CoachAnswerResponse = await api.undoAnswer(
      state.conversationId,
    );
    setState((prev) => ({
      ...prev,
      currentQuestion: result.question ?? null,
      questionHistory: prev.questionHistory.slice(0, -1),
      suggestions: null,
      dynamics: null,
      done: result.done,
    }));
    return result;
  }, [api, state.conversationId]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    startCoach,
    submitAnswer,
    undoAnswer,
    reset,
  };
}
