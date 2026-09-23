import { randomUUID } from 'node:crypto';

/**
 * Row id for server-side inserts.
 *
 * The Prisma-created tables have no database default for `id` (Prisma generated
 * cuids in application code), so every insert must supply one. Server-only.
 */
export function newId(): string {
  return randomUUID();
}

/** Timestamp for `updatedAt`, which likewise has no database default. */
export function nowIso(): string {
  return new Date().toISOString();
}
