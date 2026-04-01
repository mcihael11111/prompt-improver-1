import type { ConversationDynamics, Suggestion } from './suggestions.js';
import type { QuestionContent } from './questions.js';

// === Request Types ===

export interface QuickSuggestRequest {
  conversation: string;
  userId: string;
  platform?: string;
}

export interface CoachRequest {
  conversation: string;
  userId: string;
  platform?: string;
}

export interface AnswerRequest {
  conversationId: string;
  answer: string | Record<string, unknown>;
  userId: string;
}

export interface UndoAnswerRequest {
  conversationId: string;
}

// === Response Types ===

export interface QuickSuggestApiResponse {
  dynamics: ConversationDynamics;
  suggestions: Suggestion[];
  remaining: number | null;
}

export interface CoachStartApiResponse {
  conversationId: string;
  type: 'question';
  content: QuestionContent;
}

export interface CoachQuestionApiResponse {
  type: 'question';
  content: QuestionContent;
  remaining?: number | null;
}

export interface CoachSuggestionsApiResponse {
  type: 'suggestions';
  content: {
    dynamics: ConversationDynamics;
    suggestions: Suggestion[];
  };
  remaining?: number | null;
}

export type CoachAnswerApiResponse = CoachQuestionApiResponse | CoachSuggestionsApiResponse;

export interface RemainingApiResponse {
  remaining: number | null;
}

export interface PlanApiResponse {
  plan: string;
}

export interface ErrorApiResponse {
  error: string;
  errorType?: string;
}
