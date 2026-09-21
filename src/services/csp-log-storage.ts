import { randomUUID } from 'node:crypto';
import type { CspLogEntry } from '../types/csp-report.js';

function buildBlobPath(entry: CspLogEntry): string {
  const date = new Date(entry.timestamp);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${entry.environment}/${yyyy}/${mm}/${dd}/${randomUUID()}.json`;
}

// Storage is not implemented yet. This only prepares the server-generated path/payload
// so the Azure Blob write (Managed Identity, private "csp-logs" container) can be dropped in later.
export async function persistCspLog(entry: CspLogEntry): Promise<void> {
  const blobPath = buildBlobPath(entry);
  console.log('[csp-report] prepared storage entry', JSON.stringify({
    blobPath,
    environment: entry.environment,
    documentUrl: entry.documentUrl,
    blockedUrl: entry.blockedUrl,
    directive: entry.directive,
    disposition: entry.disposition,
    timestamp: entry.timestamp
  }, null, 2));
}
