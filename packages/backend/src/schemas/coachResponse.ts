export const COACH_RESPONSE_SCHEMA = {
  name: 'textCoachCoach',
  schema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['question', 'suggestions'],
      },
      content: {
        type: 'object',
      },
    },
    required: ['type', 'content'],
    additionalProperties: false,
  },
};
