// Environment-specific configuration
// This file is populated at build time based on VITE_ENV environment variable

const ENV = import.meta.env.VITE_ENV || 'production';

const config = {
  development: {
    API_URL: 'http://localhost:3000',
    SUPABASE_URL: 'https://zzgwxsptkfutxuucvolw.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Z3d4c3B0a2Z1dHh1dWN2b2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTc2NTMsImV4cCI6MjA3NDQzMzY1M30.Uh_mp0Dk_csD3l--0_J1JNnXCYRioDIco9hQvUcrAg4',
    STRIPE_MANAGE_SUBSCRIPTION_LINK: 'https://billing.stripe.com/p/login/test_28E8wIgag8dB9mxeo39ws00?prefilled_email=',
    STRIPE_STARTER_MONTHLY_LINK: 'https://buy.stripe.com/test_28E00caPW9hF6alfs79ws06',
    STRIPE_PRO_MONTHLY_LINK: 'https://buy.stripe.com/test_4gMaEQ0bibpNfKV93J9ws05',
    STRIPE_PRO_YEARLY_LINK: 'https://buy.stripe.com/test_00w28kgag2ThcyJdjZ9ws04',
    WEBSITE_URL: 'https://www.promptgpt.com.au/',
    FAQ_URL: 'https://www.promptgpt.com.au/faq',
  },
  production: {
    API_URL: 'https://prompt-improver-1.onrender.com',
    SUPABASE_URL: 'https://yrjxpchquyzqyypixxgu.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyanhwY2hxdXl6cXl5cGl4eGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mzk3MzMsImV4cCI6MjA3ODIxNTczM30.PmSmjP2uVEyABRUkoAnTnuDexXfCZ8FBXt4vI1_KWFQ',
    STRIPE_MANAGE_SUBSCRIPTION_LINK: 'https://billing.stripe.com/p/login/8x25kD6uJ4Un1FG1vQgfu00?prefilled_email=',
    STRIPE_STARTER_MONTHLY_LINK: 'https://buy.stripe.com/8x25kD6uJ4Un1FG1vQgfu00',
    STRIPE_PRO_MONTHLY_LINK: 'https://buy.stripe.com/bJe4gz1ap1Ibdoodeygfu01',
    STRIPE_PRO_YEARLY_LINK: 'https://buy.stripe.com/8x2fZh9GV2Mf988gqKgfu02',
    WEBSITE_URL: 'https://www.promptgpt.com.au/',
    FAQ_URL: 'https://www.promptgpt.com.au/faq',
  },
};

// Export the configuration for the current environment
export const {
  API_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  STRIPE_MANAGE_SUBSCRIPTION_LINK,
  STRIPE_STARTER_MONTHLY_LINK,
  STRIPE_PRO_MONTHLY_LINK,
  STRIPE_PRO_YEARLY_LINK,
  WEBSITE_URL,
  FAQ_URL,
} = config[ENV as keyof typeof config];
