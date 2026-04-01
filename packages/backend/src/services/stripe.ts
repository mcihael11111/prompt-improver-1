import Stripe from 'stripe';
import { env } from '../config/env.js';

// Stripe is optional — only initialized if STRIPE_SECRET_KEY is set
export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

export function getPlanFromPriceId(priceId: string): 'free' | 'starter' | 'pro' {
  const proPriceIds = [
    env.STRIPE_PRO_MONTHLY_PRICE_ID,
    env.STRIPE_PRO_YEARLY_PRICE_ID,
  ].filter(Boolean);

  const starterPriceIds = [
    env.STRIPE_STARTER_PRICE_ID,
  ].filter(Boolean);

  if (proPriceIds.includes(priceId)) return 'pro';
  if (starterPriceIds.includes(priceId)) return 'starter';
  return 'pro';
}
