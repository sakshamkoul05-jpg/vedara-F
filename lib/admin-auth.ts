import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * Admin authorisation for route handlers.
 *
 * Uses the same `vd_token` cookie and JWT secret as `middleware.ts`. The
 * middleware guards page navigation; route handlers must check for themselves,
 * because an API call is not a navigation and never passes through it.
 */

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-jwt-secret');

const ADMIN_ROLES = ['SUPER_ADMIN', 'MANAGER'];

export interface AdminSession {
  userId: string;
  role: string;
  email?: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  // `cookies()` is async from Next 15 onwards.
  const cookieStore = await cookies();
  const token = cookieStore.get('vd_token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = String(payload.role ?? '');
    if (!ADMIN_ROLES.includes(role)) return null;

    return {
      userId: String(payload.sub ?? payload.userId ?? ''),
      role,
      email: payload.email ? String(payload.email) : undefined,
    };
  } catch {
    return null;
  }
}
