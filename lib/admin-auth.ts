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

/** Everyone who may sign in to the staff area, not just the approvers. */
const STAFF_ROLES = ['SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST', 'CAFE_STAFF'];

export interface AdminSession {
  userId: string;
  role: string;
  email?: string;
}

async function sessionFor(roles: string[]): Promise<AdminSession | null> {
  // `cookies()` is async from Next 15 onwards.
  const cookieStore = await cookies();
  const token = cookieStore.get('vd_token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = String(payload.role ?? '');
    if (!roles.includes(role)) return null;

    return {
      userId: String(payload.sub ?? payload.userId ?? ''),
      role,
      email: payload.email ? String(payload.email) : undefined,
    };
  } catch {
    return null;
  }
}

/** SUPER_ADMIN or MANAGER — anything that changes money or confirms a stay. */
export async function getAdminSession(): Promise<AdminSession | null> {
  return sessionFor(ADMIN_ROLES);
}

/**
 * Any signed-in staff member.
 *
 * Used for reads (a receptionist listing bookings) and for low-risk status
 * changes. Approving a booking and marking it PAID stays behind
 * `getAdminSession`.
 */
export async function getStaffSession(): Promise<AdminSession | null> {
  return sessionFor(STAFF_ROLES);
}
