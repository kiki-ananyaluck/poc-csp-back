import dotenv from 'dotenv';

dotenv.config();

export const port = Number(process.env.PORT ?? 3000);

// Server-controlled label written into CSP log entries; never trust a client-supplied value for this.
export const environment = process.env.CSP_REPORT_ENVIRONMENT ?? 'dev';

export const allowedOrigins = new Set(
  [
    'http://localhost:4200',
    'https://poc-csp-front.vercel.app',
    'https://secure.kikiluckily-lab.stream/',
    ...(process.env.FRONTEND_ORIGIN?.split(',') ?? [])
  ]
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
);
