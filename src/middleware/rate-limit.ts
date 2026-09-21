import type { NextFunction, Request, Response } from 'express';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

// Minimal in-memory fixed-window limiter, keyed by client IP. Good enough for a single-instance POC.
export function createRateLimiter({ windowMs, max }: RateLimiterOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (request: Request, response: Response, next: NextFunction) => {
    const key = request.ip ?? 'unknown';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= max) {
      response.status(429).json({ error: 'rate_limited' });
      return;
    }

    entry.count += 1;
    next();
  };
}
