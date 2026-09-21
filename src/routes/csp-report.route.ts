import express, { Router } from 'express';
import { createRateLimiter } from '../middleware/rate-limit.js';
import { persistCspLog } from '../services/csp-log-storage.js';
import { processReportsPayload } from '../services/csp-report-validator.js';

const ALLOWED_CONTENT_TYPES = new Set(['application/reports+json', 'application/csp-report']);
const MAX_BODY_SIZE = '20kb';

const cspReportRateLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });

export const cspReportRouter = Router();

cspReportRouter.get('/api/security/csp-report', (_request, response) => {
  response.set('Allow', 'POST');
  response.status(405).json({ error: 'method_not_allowed' });
});

cspReportRouter.post(
  '/api/security/csp-report',
  cspReportRateLimiter,
  (request, response, next) => {
    const contentType = request.headers['content-type']?.split(';')[0]?.trim().toLowerCase();
    if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
      response.status(415).json({ error: 'unsupported_media_type' });
      return;
    }
    next();
  },
  express.json({
    limit: MAX_BODY_SIZE,
    type: ['application/json', 'application/*+json', 'application/reports+json', 'application/csp-report']
  }),
  async (request, response) => {
    console.log('[csp-report] raw browser payload', JSON.stringify(request.body, null, 2));

    const result = processReportsPayload(request.body);

    if (!result || result.entries.length === 0) {
      console.warn('[csp-report] rejected report payload', request.body);
      response.status(400).json({ error: 'invalid_report' });
      return;
    }

    console.log('[csp-report] accepted report payload', JSON.stringify({
      acceptedCount: result.entries.length,
      rejectedCount: result.rejectedCount,
      entries: result.entries
    }, null, 2));

    let persistedCount = 0;
    for (const entry of result.entries) {
      try {
        await persistCspLog(entry);
        persistedCount += 1;
      } catch (error) {
        console.error('[csp-report] failed to persist entry', error);
      }
    }

    if (persistedCount === 0) {
      response.status(500).json({ error: 'storage_unavailable' });
      return;
    }

    response.status(204).end();
  }
);
