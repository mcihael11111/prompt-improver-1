export const PLAN_NAMES = ['free', 'starter', 'pro'] as const;
export type PlanName = (typeof PLAN_NAMES)[number];

export interface PlanFeatures {
  quickSuggestLimit: number | null;
  coachLimit: number | null;
  suggestionsPerRequest: number;
  reasoningDepth: 'brief' | 'standard' | 'detailed';
  dynamicsVisible: boolean;
  resetPeriod: 'weekly' | 'monthly' | null;
}

export const PLAN_FEATURES: Record<PlanName, PlanFeatures> = {
  free: {
    quickSuggestLimit: 5,
    coachLimit: 2,
    suggestionsPerRequest: 2,
    reasoningDepth: 'brief',
    dynamicsVisible: false,
    resetPeriod: 'weekly',
  },
  starter: {
    quickSuggestLimit: 30,
    coachLimit: 15,
    suggestionsPerRequest: 3,
    reasoningDepth: 'standard',
    dynamicsVisible: true,
    resetPeriod: 'monthly',
  },
  pro: {
    quickSuggestLimit: null,
    coachLimit: null,
    suggestionsPerRequest: 4,
    reasoningDepth: 'detailed',
    dynamicsVisible: true,
    resetPeriod: null,
  },
};
