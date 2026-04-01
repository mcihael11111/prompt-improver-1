import { Router } from 'express';
import bodyParser from 'body-parser';
import { stripe, getPlanFromPriceId } from '../services/stripe.js';
import { supabase } from '../services/supabase.js';
import { updateUsageLimitForPlan } from '../services/usageTracker.js';
import { env } from '../config/env.js';

const router = Router();

router.post('/', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const email = session.customer_details?.email;
        if (!email) break;

        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items'],
        });

        const priceId = (fullSession as any).line_items?.data?.[0]?.price?.id;
        const planName = getPlanFromPriceId(priceId);

        console.log(`Checkout completed: email=${email}, priceId=${priceId}, plan=${planName}`);

        await supabase.from('user_subscriptions')
          .update({
            stripe_customer_id: session.customer,
            plan_name: planName,
            blocked: false,
            updated_at: new Date().toISOString(),
          })
          .eq('email', email);

        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('email', email)
          .single();

        if (userSub?.user_id) {
          await updateUsageLimitForPlan(userSub.user_id, planName);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customer = await stripe.customers.retrieve(subscription.customer) as any;
        const email = customer.email;
        if (!email) break;

        console.log(`Subscription deleted: email=${email}`);

        await supabase.from('user_subscriptions')
          .update({
            plan_name: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('email', email);

        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('email', email)
          .single();

        if (userSub?.user_id) {
          await updateUsageLimitForPlan(userSub.user_id, 'free');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;

        if (subscription.cancel_at_period_end) {
          console.log(`Subscription will cancel at period end: ${subscription.id}`);
          break;
        }

        const customer = await stripe.customers.retrieve(subscription.customer) as any;
        const email = customer.email;
        if (!email) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const planName = getPlanFromPriceId(priceId);

        console.log(`Subscription updated: email=${email}, priceId=${priceId}, plan=${planName}`);

        await supabase.from('user_subscriptions')
          .update({
            plan_name: planName,
            updated_at: new Date().toISOString(),
          })
          .eq('email', email);

        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('email', email)
          .single();

        if (userSub?.user_id) {
          await updateUsageLimitForPlan(userSub.user_id, planName);
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error('Error handling webhook event:', e);
  }

  res.json({ received: true });
});

export default router;
