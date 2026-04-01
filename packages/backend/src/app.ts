import express from 'express';
import bodyParser from 'body-parser';
import { corsMiddleware } from './config/cors.js';
import { globalLimiter } from './config/rateLimit.js';
import { requestLog } from './middleware/requestLog.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import healthRouter from './routes/health.js';
import stripeWebhookRouter from './routes/stripeWebhook.js';
import quickSuggestRouter from './routes/quickSuggest.js';
import coachRouter from './routes/coach.js';
import answerRouter from './routes/answer.js';
import undoAnswerRouter from './routes/undoAnswer.js';
import usageRouter from './routes/usage.js';
import apiKeysRouter from './routes/apiKeys.js';

export function createApp() {
  const app = express();

  // Global middleware
  app.use(corsMiddleware);
  app.use(globalLimiter);

  // Health check (no auth needed)
  app.use('/health', healthRouter);

  // Stripe webhook MUST come before bodyParser.json()
  app.use('/stripe-webhook', stripeWebhookRouter);

  // JSON body parser for all other routes
  app.use(bodyParser.json());

  // Request logging
  app.use(requestLog);

  // API routes
  app.use('/quick-suggest', quickSuggestRouter);
  app.use('/coach', coachRouter);
  app.use('/answer', answerRouter);
  app.use('/undo-answer', undoAnswerRouter);
  // Usage routes: GET /remaining-prompts and GET /remaining-prompts/plan
  app.use('/remaining-prompts', usageRouter);
  app.use('/api-keys', apiKeysRouter);

  // Error handler
  app.use(errorHandler);

  return app;
}
