/**
 * Renvoie un hash (SHA‑1 hex) stable des opérations actives.
 * Utile pour versionner les appels au worker et filtrer les frames obsolètes.
 */

import type { Operation } from '@/models/Operation';

export async function hashOperations(ops: Operation[]): Promise<string> {
  const json = JSON.stringify(ops);
  const buffer = new TextEncoder().encode(json);
  const digest = await crypto.subtle.digest('SHA-1', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
