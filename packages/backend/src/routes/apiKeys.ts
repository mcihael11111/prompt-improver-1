import { Router } from 'express';
import crypto from 'crypto';
import { checkUserAccess } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';

const router = Router();

function generateApiKey(): string {
  return 'pk_' + crypto.randomBytes(32).toString('hex');
}

router.post('/', checkUserAccess(), async (req, res) => {
  try {
    const { userId, name } = req.body;
    const key = generateApiKey();

    const { data, error } = await supabase
      .from('api_keys')
      .insert({ user_id: userId, key, name: name || 'Default' })
      .select('id, key, name, created_at')
      .single();

    if (error) throw error;
    res.json({ apiKey: data });
  } catch (err: any) {
    console.error('Error POST /api-keys:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', checkUserAccess(), async (req, res) => {
  try {
    const { userId } = req.query;
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, created_at, last_used_at, key')
      .eq('user_id', userId);

    if (error) throw error;

    const masked = (data || []).map((k: any) => ({
      ...k,
      key: k.key.substring(0, 7) + '...' + k.key.slice(-4),
    }));

    res.json({ apiKeys: masked });
  } catch (err: any) {
    console.error('Error GET /api-keys:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', checkUserAccess(), async (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId;
    const { id } = req.params;

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error DELETE /api-keys:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
