import type { AdminPricingConfig } from './types';

/**
 * Thin client for the pricing admin endpoints.
 *
 * Auth rides on the `vd_token` cookie, so every call sends credentials and
 * nothing here handles a token directly.
 */

async function handle(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = json.details
      ? ` (${Object.entries(json.details)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ')})`
      : '';
    throw new Error((json.error || `Request failed with ${res.status}`) + detail);
  }
  return json;
}

export async function fetchConfig(): Promise<AdminPricingConfig> {
  const res = await fetch('/api/admin/pricing/config', { credentials: 'include' });
  const json = await handle(res);
  return json.data;
}

export async function createRecord(resource: string, body: unknown) {
  const res = await fetch(`/api/admin/pricing/${resource}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await handle(res)).data;
}

export async function updateRecord(resource: string, body: { id: string } & Record<string, unknown>) {
  const res = await fetch(`/api/admin/pricing/${resource}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await handle(res)).data;
}

export async function deleteRecord(resource: string, id: string) {
  const res = await fetch(`/api/admin/pricing/${resource}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return (await handle(res)).data;
}

export async function saveSettings(settings: Record<string, unknown>) {
  const res = await fetch('/api/admin/pricing/settings', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return (await handle(res)).data;
}
