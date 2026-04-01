import cors from 'cors';

export const corsMiddleware = cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-TextCoach-Source', 'stripe-signature'],
});
