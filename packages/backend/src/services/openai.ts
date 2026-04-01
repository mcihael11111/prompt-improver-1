import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface CallModelOptions {
  messages: { role: string; content: string }[];
  schema: any;
  temperature?: number;
}

export async function callModelWithSchema({ messages, schema, temperature = 0.5 }: CallModelOptions) {
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages as OpenAI.ChatCompletionMessageParam[],
    temperature,
    response_format: {
      type: 'json_schema',
      json_schema: schema,
    },
  });

  const content = resp?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return JSON.parse(content);

  throw new Error('Unexpected model response shape');
}
