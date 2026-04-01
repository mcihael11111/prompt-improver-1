import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return val;
}

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  OPENAI_API_KEY: required('OPENAI_API_KEY'),
  SUPABASE_URL: required('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  STRIPE_SECRET_KEY: required('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: required('STRIPE_WEBHOOK_SECRET'),
  STRIPE_PRO_MONTHLY_PRICE_ID: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
  STRIPE_PRO_YEARLY_PRICE_ID: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
  STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID || '',
} as const;
