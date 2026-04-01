export interface ConversationDynamics {
  interestLevel: string;
  tone: string;
  patterns: string;
  subtext: string;
}

export interface Suggestion {
  text: string;
  toneLabel: string;
  reasoning: string;
  recommended: boolean;
}

export interface SuggestionsResponse {
  dynamics: ConversationDynamics;
  suggestions: Suggestion[];
}
