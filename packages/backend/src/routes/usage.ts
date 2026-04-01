import { Router } from 'express';
import { checkUserAccess } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';

const router = Router();

router.get('/', checkUserAccess(), async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing 'userId' query parameter" });
    }

    const { data: user_usage } = await supabase
      .from('user_usage')
      .select('prompts_remaining')
      .eq('user_id', userId)
      .single();

    res.json({
      remaining: user_usage?.prompts_remaining ?? null,
    });
  } catch (err: any) {
    console.error('Error /remaining:', err);
    res.status(500).json({ error: 'Failed to fetch remaining suggestions' });
  }
});

router.get('/plan', checkUserAccess(), async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing 'userId' query parameter" });
    }

    const { data: userSub } = await supabase
      .from('user_subscriptions')
      .select('plan_name')
      .eq('user_id', userId)
      .single();

    res.json({
      plan: userSub?.plan_name,
    });
  } catch (err: any) {
    console.error('Error /get-plan:', err);
    res.status(500).json({ error: 'Failed to check user subscription' });
  }
});

export default router;
