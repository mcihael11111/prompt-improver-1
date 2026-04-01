export const QUICK_SUGGEST_RESPONSE_SCHEMA = {
  name: 'textCoachQuickSuggest',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      dynamics: {
        type: 'object',
        properties: {
          interestLevel: { type: 'string' },
          tone: { type: 'string' },
          patterns: { type: 'string' },
          subtext: { type: 'string' },
        },
        required: ['interestLevel', 'tone', 'patterns', 'subtext'],
        additionalProperties: false,
      },
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            toneLabel: { type: 'string' },
            reasoning: { type: 'string' },
            recommended: { type: 'boolean' },
          },
          required: ['text', 'toneLabel', 'reasoning', 'recommended'],
          additionalProperties: false,
        },
      },
    },
    required: ['dynamics', 'suggestions'],
    additionalProperties: false,
  },
};
