import { Router } from 'express';
import { aiLimiter } from '../config/rateLimit.js';
import { checkUserAccess } from '../middleware/auth.js';
import { callModelWithSchema } from '../services/openai.js';
import { trackUsage } from '../services/usageTracker.js';
import { SYSTEM_PROMPT_QUICK_SUGGEST } from '../prompts/quickSuggest.js';
import { QUICK_SUGGEST_RESPONSE_SCHEMA } from '../schemas/quickSuggestResponse.js';

const router = Router();

router.post('/', aiLimiter, checkUserAccess(true), async (req, res) => {
  try {
    const { conversation, userId, platform } = req.body;
    if (!conversation) return res.status(400).json({ error: "Missing 'conversation'" });
    if (!userId) return res.status(400).json({ error: "Missing 'userId'" });

    const remaining = await trackUsage(userId);

    const platformContext = platform ? `\n\nPlatform: ${platform}` : '';
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT_QUICK_SUGGEST },
      { role: 'user', content: `Conversation thread:${platformContext}\n\n${conversation}` },
    ];

    const parsed = await callModelWithSchema({ messages, schema: QUICK_SUGGEST_RESPONSE_SCHEMA });

    res.json({
      dynamics: parsed.dynamics,
      suggestions: parsed.suggestions,
      remaining,
    });
  } catch (err: any) {
    console.error('Error /quick-suggest:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
