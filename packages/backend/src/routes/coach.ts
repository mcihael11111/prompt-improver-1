import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { aiLimiter } from '../config/rateLimit.js';
import { checkUserAccess } from '../middleware/auth.js';
import { callModelWithSchema } from '../services/openai.js';
import { createConversation } from '../services/conversationStore.js';
import { SYSTEM_PROMPT_COACH } from '../prompts/coachMode.js';
import { COACH_RESPONSE_SCHEMA } from '../schemas/coachResponse.js';

const router = Router();

router.post('/', aiLimiter, checkUserAccess(true), async (req, res) => {
  try {
    const { conversation, userId, platform } = req.body;
    if (!conversation) return res.status(400).json({ error: "Missing 'conversation'" });
    if (!userId) return res.status(400).json({ error: "Missing 'userId'" });

    const conversationId = uuidv4();

    const platformContext = platform ? `\n\nPlatform: ${platform}` : '';
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT_COACH },
      { role: 'user', content: `Conversation thread:${platformContext}\n\n${conversation}` },
    ];

    const parsed = await callModelWithSchema({ messages, schema: COACH_RESPONSE_SCHEMA });

    await createConversation(conversationId, {
      originalConversation: conversation,
      messages: [...messages, { role: 'assistant', content: JSON.stringify(parsed) }] as any,
      questionsAsked: 1,
      freeTextUsed: 0,
      userId,
      platform,
    });

    res.json({
      conversationId,
      ...parsed,
    });
  } catch (err: any) {
    console.error('Error /coach:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
