import { allowedOrigins, environment } from '../config.js';
import type { CspLogEntry, ReportsApiEntry } from '../types/csp-report.js';

const MAX_URL_LENGTH = 2048;
const MAX_BATCH_SIZE = 50;

const ALLOWED_DIRECTIVES = new Set([
  'default-src',
  'script-src',
  'script-src-elem',
  'script-src-attr',
  'style-src',
  'style-src-elem',
  'style-src-attr',
  'img-src',
  'font-src',
  'connect-src',
  'object-src',
  'base-uri',
  'frame-ancestors',
  'frame-src',
  'child-src',
  'media-src',
  'manifest-src',
  'worker-src',
  'form-action',
  'require-trusted-types-for',
  'trusted-types',
  'sandbox',
  'navigate-to'
]);

const ALLOWED_DISPOSITIONS = new Set(['report', 'enforce']);

// Non-URL values the CSP spec allows for blocked-uri; kept as-is rather than URL-parsed.
const BLOCKED_URL_KEYWORDS = new Set(['inline', 'eval', 'self', 'data', 'blob', 'filesystem', 'wasm-eval']);

function normalizeUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > MAX_URL_LENGTH) {
    return null;
  }

  try {
    const url = new URL(raw);
    url.search = '';
    url.hash = '';
    url.username = '';
    url.password = '';
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeBlockedUrl(raw: unknown): string | null {
  if (typeof raw === 'string' && BLOCKED_URL_KEYWORDS.has(raw)) {
    return raw;
  }
  return normalizeUrl(raw);
}

function isAllowedDocumentHost(documentUrl: string): boolean {
  try {
    return allowedOrigins.has(new URL(documentUrl).origin);
  } catch {
    return false;
  }
}

function toLogEntry(item: unknown): CspLogEntry | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const { type, body } = item as ReportsApiEntry;
  if (type !== 'csp-violation' || !body || typeof body !== 'object') {
    return null;
  }

  const rawBody = body as Record<string, unknown>;
  const documentUrl = normalizeUrl(rawBody.documentURL);
  const blockedUrl = normalizeBlockedUrl(rawBody.blockedURL);
  const directive = typeof rawBody.effectiveDirective === 'string' ? rawBody.effectiveDirective : '';
  const disposition = typeof rawBody.disposition === 'string' ? rawBody.disposition : '';

  if (
    !documentUrl ||
    !blockedUrl ||
    !ALLOWED_DIRECTIVES.has(directive) ||
    !ALLOWED_DISPOSITIONS.has(disposition) ||
    !isAllowedDocumentHost(documentUrl)
  ) {
    return null;
  }

  return {
    timestamp: new Date().toISOString(),
    environment,
    documentUrl,
    blockedUrl,
    directive,
    disposition
  };
}

export interface ProcessResult {
  entries: CspLogEntry[];
  rejectedCount: number;
}

// Validates + normalizes a `reports+json` payload into internal log entries. Returns null if the payload shape is unusable.
export function processReportsPayload(payload: unknown): ProcessResult | null {
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const entries: CspLogEntry[] = [];
  let rejectedCount = 0;

  for (const item of payload.slice(0, MAX_BATCH_SIZE)) {
    const entry = toLogEntry(item);
    if (entry) {
      entries.push(entry);
    } else {
      rejectedCount += 1;
    }
  }

  return { entries, rejectedCount };
}
