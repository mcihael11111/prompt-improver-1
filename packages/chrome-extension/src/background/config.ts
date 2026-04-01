// ─── Environment toggle ───────────────────────────────────────────
const ENVIRONMENT: 'development' | 'production' = 'production';

// ─── Per-environment settings ─────────────────────────────────────
interface EnvConfig {
  API_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  STRIPE_STARTER_CHECKOUT: string;
  STRIPE_PRO_MONTHLY_CHECKOUT: string;
  STRIPE_PRO_YEARLY_CHECKOUT: string;
  WEBSITE_URL: string;
}

const configs: Record<'development' | 'production', EnvConfig> = {
  development: {
    API_URL: 'http://localhost:3000',
    SUPABASE_URL: 'https://zzgwxsptkfutxuucvolw.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Z3d4c3B0a2Z1dHh1dWN2b2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTc2NTMsImV4cCI6MjA3NDQzMzY1M30.Uh_mp0Dk_csD3l--0_J1JNnXCYRioDIco9hQvUcrAg4',
    STRIPE_STARTER_CHECKOUT: 'https://buy.stripe.com/test_00w28kgag2ThcyJdjZ9ws04',
    STRIPE_PRO_MONTHLY_CHECKOUT: 'https://buy.stripe.com/test_28E00caPW9hF6alfs79ws06',
    STRIPE_PRO_YEARLY_CHECKOUT: 'https://buy.stripe.com/test_4gMaEQ0bibpNfKV93J9ws05',
    WEBSITE_URL: 'https://textcoach.com',
  },
  production: {
    API_URL: 'https://prompt-improver-1.onrender.com',
    SUPABASE_URL: 'https://yrjxpchquyzqyypixxgu.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyanhwY2hxdXl6cXl5cGl4eGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mzk3MzMsImV4cCI6MjA3ODIxNTczM30.PmSmjP2uVEyABRUkoAnTnuDexXfCZ8FBXt4vI1_KWFQ',
    STRIPE_STARTER_CHECKOUT: 'https://buy.stripe.com/8x25kD6uJ4Un1FG1vQgfu00',
    STRIPE_PRO_MONTHLY_CHECKOUT: 'https://buy.stripe.com/bJe4gz1ap1Ibdoodeygfu01',
    STRIPE_PRO_YEARLY_CHECKOUT: 'https://buy.stripe.com/8x2fZh9GV2Mf988gqKgfu02',
    WEBSITE_URL: 'https://textcoach.com',
  },
};

export const config = configs[ENVIRONMENT];
export { ENVIRONMENT };
