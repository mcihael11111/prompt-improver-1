export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ConversationSession {
  originalConversation: string;
  messages: ConversationMessage[];
  questionsAsked: number;
  freeTextUsed: number;
  userId: string;
  platform?: string;
}
