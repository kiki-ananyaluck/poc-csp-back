import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);
const allowedOrigins = new Set(
  [
    'http://localhost:4200',
    'https://poc-csp-front.vercel.app',
    'https://secure.kikiluckily-lab.stream/',
    ...(process.env.FRONTEND_ORIGIN?.split(',') ?? [])
  ]
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
);

app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
    callback(null, true);
    return;
  }

  callback(new Error('Origin is not allowed by CORS'));
} }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'poc-csp-back' });
});

app.get('/api/message', (_request, response) => {
  response.json({ message: 'สวัสดีจาก Node.js backend' });
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});