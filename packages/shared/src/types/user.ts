export interface UserSubscription {
  user_id: string;
  email?: string;
  plan_name: 'free' | 'starter' | 'pro';
  stripe_customer_id?: string;
  blocked: boolean;
  updated_at?: string;
}

export interface UserUsage {
  user_id: string;
  prompts_used: number;
  prompts_remaining: number | null;
  last_reset: string;
}

export interface UserPreferences {
  user_id: string;
  default_context: ConversationContext;
  communication_style?: string;
  updated_at?: string;
}

type ConversationContext = 'general' | 'dating' | 'professional' | 'social' | 'family' | 'conflict';
