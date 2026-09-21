import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { allowedOrigins, port } from './config.js';
import { cspReportRouter } from './routes/csp-report.route.js';

const app = express();

app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
    callback(null, true);
    return;
  }

  callback(new Error('Origin is not allowed by CORS'));
} }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'poc-csp-back' });
});

app.get('/api/message', (_request, response) => {
  response.json({ message: 'สวัสดีจาก Node.js backend' });
});

app.use(cspReportRouter);

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  const bodyParserError = error as { type?: string } | undefined;

  if (bodyParserError?.type === 'entity.too.large') {
    response.status(413).json({ error: 'payload_too_large' });
    return;
  }

  if (bodyParserError?.type === 'entity.parse.failed' || error instanceof SyntaxError) {
    response.status(400).json({ error: 'invalid_json' });
    return;
  }

  console.error(error);
  response.status(500).json({ error: 'internal_error' });
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});