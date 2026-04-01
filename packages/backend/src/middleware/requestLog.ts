import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase.js';

export function requestLog(req: Request, res: Response, next: NextFunction) {
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    supabase.from('request_log').insert({
      user_id: req.body?.userId || req.query?.userId || null,
      endpoint: req.path,
      source: (req.headers['x-textcoach-source'] as string) || 'unknown',
      status_code: res.statusCode,
    }).then(() => {});
    return originalEnd.apply(res, args as any);
  };
  next();
}
