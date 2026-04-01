import { Router } from 'express';
import { getConversation, updateConversation } from '../services/conversationStore.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { conversationId } = req.body;

    const conv = await getConversation(conversationId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    if (conv.messages.length < 3) {
      return res.status(400).json({ error: 'No answer to undo' });
    }

    // Remove last 2 messages (user answer + assistant response)
    conv.messages.pop();
    conv.messages.pop();

    if (conv.questionsAsked > 0) {
      conv.questionsAsked -= 1;
    }

    await updateConversation(conversationId, conv);

    const lastMessage = conv.messages[conv.messages.length - 1];
    const parsed = JSON.parse(lastMessage.content);

    res.json(parsed);
  } catch (err: any) {
    console.error('Error /undo-answer:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
