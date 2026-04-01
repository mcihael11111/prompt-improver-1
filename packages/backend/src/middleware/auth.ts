import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase.js';

export function checkUserAccess(shouldCheckLimit = false): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Try API key from Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const apiKey = authHeader.replace('Bearer ', '');
        const { data: keyRecord } = await supabase
          .from('api_keys')
          .select('user_id')
          .eq('key', apiKey)
          .single();

        if (keyRecord) {
          if (!req.body) req.body = {};
          req.body.userId = keyRecord.user_id;
          if (!req.query) (req as any).query = {};
          (req.query as any).userId = keyRecord.user_id;

          supabase.from('api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('key', apiKey).then(() => {});
        } else if (apiKey) {
          res.status(401).json({ error: 'Invalid API key' });
          return;
        }
      }

      const userId = req.body?.userId || req.query?.userId;
      if (!userId) {
        res.status(400).json({ error: 'Missing userId or API key' });
        return;
      }

      // Get user subscription
      let { data: userSub } = await supabase
        .from('user_subscriptions')
        .select('plan_name, blocked')
        .eq('user_id', userId)
        .single();

      if (!userSub) {
        // First-time user: insert as free
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({ user_id: userId, plan_name: 'free' });

        if (insertError) {
          console.error('Failed to create user subscription:', insertError.message);
          res.status(500).json({ error: 'Failed to create user account' });
          return;
        }

        // Fetch the newly created subscription
        const { data: newSub } = await supabase
          .from('user_subscriptions')
          .select('plan_name, blocked')
          .eq('user_id', userId)
          .single();

        if (!newSub) {
          res.status(500).json({ error: 'Failed to create user account' });
          return;
        }
        userSub = newSub;
      }

      if (userSub.blocked) {
        res.status(403).json({ error: 'User is blocked' });
        return;
      }

      // Fetch plan limits
      const { data: plan } = await supabase
        .from('plans')
        .select('weekly_limit, monthly_limit')
        .eq('name', userSub.plan_name)
        .single();

      if (!plan) {
        // No plan found — allow access (treat as unlimited)
        return next();
      }

      const hasWeeklyLimit = plan.weekly_limit !== null;
      const hasMonthlyLimit = plan.monthly_limit !== null;
      const limit = hasWeeklyLimit ? plan.weekly_limit : (hasMonthlyLimit ? plan.monthly_limit : null);
      const resetDays = hasWeeklyLimit ? 7 : (hasMonthlyLimit ? 30 : null);

      // Unlimited plan
      if (!limit) return next();

      const now = new Date();

      // Check user usage
      const { data: usage } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!usage) {
        await supabase.from('user_usage').insert({
          user_id: userId,
          prompts_used: 0,
          prompts_remaining: limit,
          last_reset: now.toISOString(),
        });
        return next();
      }

      const lastReset = new Date(usage.last_reset);
      const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

      if (resetDays && daysSinceReset >= resetDays) {
        await supabase.from('user_usage')
          .update({ prompts_remaining: limit, last_reset: now.toISOString() })
          .eq('user_id', userId);
        return next();
      }

      if (shouldCheckLimit && usage.prompts_remaining <= 0) {
        const limitType = hasWeeklyLimit ? 'weekly' : 'monthly';
        res.status(403).json({
          error: `${limitType.charAt(0).toUpperCase() + limitType.slice(1)} limit of ${limit} suggestions reached`,
          errorType: 'limit_reached',
        });
        return;
      }

      next();
    } catch (err: any) {
      console.error('Auth middleware error:', err.message);
      res.status(500).json({ error: 'Authentication error' });
    }
  };
}
