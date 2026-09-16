import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200' }));
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