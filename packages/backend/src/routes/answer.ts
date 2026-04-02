import { Router } from 'express';
import { aiLimiter } from '../config/rateLimit.js';
import { callModelWithSchema } from '../services/openai.js';
import { trackUsage } from '../services/usageTracker.js';
import { getConversation, updateConversation, deleteConversation } from '../services/conversationStore.js';
import { SYSTEM_PROMPT_COACH } from '../prompts/coachMode.js';
import { COACH_RESPONSE_SCHEMA } from '../schemas/coachResponse.js';

const router = Router();

router.post('/', aiLimiter, async (req, res) => {
  try {
    let remaining: number | null | undefined;
    const { conversationId, answer, userId } = req.body;

    const conv = await getConversation(conversationId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    // Track usage on first answer only
    if (conv.messages.length <= 3) {
      remaining = await trackUsage(userId || conv.userId);
    }

    conv.messages.push({
      role: 'user',
      content: `Answer: ${typeof answer === 'string' ? answer : JSON.stringify(answer)}`,
    });

    // Safety net — force finalization if AI keeps asking (should rarely hit this)
    const forceFinalize = conv.questionsAsked >= 8;
    if (forceFinalize) {
      conv.messages.push({
        role: 'system',
        content: 'You have reached the maximum number of questions. Now return the final suggestions JSON object with type "suggestions".',
      });
    }

    const parsed = await callModelWithSchema({ messages: conv.messages, schema: COACH_RESPONSE_SCHEMA });
    conv.messages.push({ role: 'assistant', content: JSON.stringify(parsed) });

    if (parsed.type === 'question') {
      conv.questionsAsked = (conv.questionsAsked || 0) + 1;
      if (parsed.content.questionType === 'freeText') {
        conv.freeTextUsed = (conv.freeTextUsed || 0) + 1;
      }
    }

    if (forceFinalize || parsed.type === 'suggestions') {
      await deleteConversation(conversationId);
    } else {
      // Enforce freeText limit
      if (conv.freeTextUsed && conv.freeTextUsed >= 2) {
        const systemPrompt = `
          ${SYSTEM_PROMPT_COACH}

          Session constraints:
          - You have already asked ${conv.freeTextUsed} freeText questions.
          - You may only ask a total of 2 freeText questions per user session.
          - You are STRICTLY forbidden to use questionType:"freeText" again.
          - Instead, use another suitable question type.
        `;
        conv.messages[0] = { role: 'system', content: systemPrompt };
      }

      await updateConversation(conversationId, conv);
    }

    // Unwrap nested content to match extension's expected shape
    const isDone = parsed.type === 'suggestions';
    if (parsed.type === 'question') {
      res.json({
        conversationId,
        done: false,
        question: parsed.content.question,
        questionType: parsed.content.questionType,
        options: parsed.content.options,
        ...parsed.content,
        remaining,
      });
    } else {
      res.json({
        conversationId,
        done: true,
        suggestions: parsed.content.suggestions,
        dynamics: parsed.content.dynamics,
        remaining,
      });
    }
  } catch (err: any) {
    console.error('Error /answer:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
