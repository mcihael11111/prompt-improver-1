import { supabase } from './supabase.js';
import type { ConversationSession, ConversationMessage } from '@textcoach/shared';

export async function createConversation(
  id: string,
  data: {
    originalConversation: string;
    messages: ConversationMessage[];
    questionsAsked: number;
    freeTextUsed: number;
    userId: string;
    platform?: string;
  }
) {
  const { error } = await supabase
    .from('conversations')
    .insert({
      id,
      user_id: data.userId,
      original_prompt: data.originalConversation, // Legacy DB column name — stores the conversation text
      messages: data.messages,
      questions_asked: data.questionsAsked,
      free_text_used: data.freeTextUsed,
    });

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
}

export async function getConversation(id: string): Promise<ConversationSession | null> {
  if (!id) return null;

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    originalConversation: data.original_prompt, // Legacy DB column name
    messages: data.messages,
    questionsAsked: data.questions_asked,
    freeTextUsed: data.free_text_used,
    userId: data.user_id,
  };
}

export async function updateConversation(id: string, conv: ConversationSession) {
  const { error } = await supabase
    .from('conversations')
    .update({
      messages: conv.messages,
      questions_asked: conv.questionsAsked,
      free_text_used: conv.freeTextUsed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(`Failed to update conversation: ${error.message}`);
}

export async function deleteConversation(id: string) {
  await supabase.from('conversations').delete().eq('id', id);
}
