import { supabase } from './supabase.js';

export async function trackUsage(userId: string): Promise<number | null> {
  // Fetch user subscription and plan
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('plan_name, blocked')
    .eq('user_id', userId)
    .single();

  if (subError || !subscription) throw new Error(`Subscription not found for ${userId}`);
  if (subscription.blocked) throw new Error('User is blocked');

  const { plan_name } = subscription;

  // Get the plan details
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('weekly_limit, monthly_limit')
    .eq('name', plan_name)
    .single();

  if (planError || !plan) throw new Error(`Plan not found: ${planError?.message}`);

  // Determine which limit to use and reset period
  const hasWeeklyLimit = plan.weekly_limit !== null;
  const hasMonthlyLimit = plan.monthly_limit !== null;
  const planLimit = hasWeeklyLimit ? plan.weekly_limit : (hasMonthlyLimit ? plan.monthly_limit : null);
  const resetDays = hasWeeklyLimit ? 7 : (hasMonthlyLimit ? 30 : null);

  // Get user usage
  const { data: usage, error: usageError } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (usageError || !usage) throw new Error(`Usage not found: ${usageError?.message}`);

  // Handle reset logic
  const lastReset = new Date(usage.last_reset);
  const now = new Date();
  const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

  // DB columns are still named prompts_* for backward compatibility
  let remaining = usage.prompts_remaining;

  if (resetDays && daysSinceReset >= resetDays) {
    remaining = planLimit ?? null;
  }

  // Check limit
  if (planLimit !== null && remaining !== null && remaining <= 0) {
    const limitType = hasWeeklyLimit ? 'Weekly' : 'Monthly';
    throw new Error(`${limitType} suggestion limit reached`);
  }

  // Update usage (DB columns keep old names for backward compat)
  const updates: Record<string, unknown> = {
    prompts_used: usage.prompts_used + 1,
    last_reset: (resetDays && daysSinceReset >= resetDays) ? now.toISOString() : usage.last_reset,
  };

  if (planLimit !== null && remaining !== null) {
    updates.prompts_remaining = remaining - 1;
  }

  const { data: updatedUsage, error: updateError } = await supabase
    .from('user_usage')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (updateError) throw new Error(`Failed to update usage: ${updateError.message}`);

  return updatedUsage.prompts_remaining;
}

export async function updateUsageLimitForPlan(userId: string, planName: string) {
  const { data: plan } = await supabase
    .from('plans')
    .select('weekly_limit, monthly_limit')
    .eq('name', planName)
    .single();

  if (!plan) return;

  const hasWeeklyLimit = plan.weekly_limit !== null;
  const hasMonthlyLimit = plan.monthly_limit !== null;
  const newLimit = hasWeeklyLimit ? plan.weekly_limit : (hasMonthlyLimit ? plan.monthly_limit : null);

  await supabase
    .from('user_usage')
    .update({
      prompts_remaining: newLimit,
      last_reset: new Date().toISOString(),
    })
    .eq('user_id', userId);
}
