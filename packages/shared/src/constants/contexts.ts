export const CONVERSATION_CONTEXTS = [
  'general',
  'dating',
  'professional',
  'social',
  'family',
  'conflict',
] as const;

export type ConversationContext = (typeof CONVERSATION_CONTEXTS)[number];

export const CONTEXT_LABELS: Record<ConversationContext, string> = {
  general: 'General',
  dating: 'Dating / Romantic',
  professional: 'Professional / Work',
  social: 'Social / Friends',
  family: 'Family',
  conflict: 'Difficult Conversation',
};
