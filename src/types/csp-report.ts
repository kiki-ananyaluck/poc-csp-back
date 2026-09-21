// Shape of a single entry as sent by the browser Reporting API (application/reports+json).
export interface ReportsApiEntry {
  type?: unknown;
  body?: unknown;
  [key: string]: unknown;
}

// Internal, sanitized representation persisted for each accepted CSP violation.
export interface CspLogEntry {
  timestamp: string;
  environment: string;
  documentUrl: string;
  blockedUrl: string;
  directive: string;
  disposition: string;
}
