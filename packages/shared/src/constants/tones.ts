export const TONE_LABELS = [
  'Playful & Engaging',
  'Direct & Warm',
  'Lighthearted',
  'Confident',
  'Genuine & Thoughtful',
  'Flirty',
  'Formal & Professional',
  'Diplomatic',
  'Casual & Chill',
  'Witty',
] as const;

export type ToneLabel = (typeof TONE_LABELS)[number];

export const TONE_COLORS: Record<string, string> = {
  'Playful & Engaging': '#8b5cf6',
  'Direct & Warm': '#3b82f6',
  'Lighthearted': '#22c55e',
  'Confident': '#ef4444',
  'Genuine & Thoughtful': '#06b6d4',
  'Flirty': '#ec4899',
  'Formal & Professional': '#64748b',
  'Diplomatic': '#f59e0b',
  'Casual & Chill': '#14b8a6',
  'Witty': '#a855f7',
};
