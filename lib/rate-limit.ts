/**
 * Fixed-window rate limiting for route handlers.
 *
 * State lives in the process, so on Vercel each serverless instance keeps its
 * own counter and the effective limit is roughly `max` times the number of warm
 * instances. That is deliberate: the routes using this guard against someone
 * grinding through booking references from a script, and a per-instance counter
 * still turns a feasible attack into an infeasible one. It is not a defence
 * against a distributed attacker, and it is not a billing control — if either
 * becomes a concern, move the counter to Redis or Supabase.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Drop expired windows so a long-lived instance does not grow without bound. */
function sweep(now: number): void {
  if (windows.size < 5000) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Attempts left in the current window, after counting this one. */
  remaining: number;
  /** Seconds until the window resets, for a Retry-After header. */
  retryAfter: number;
};

export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return {
    allowed: existing.count <= max,
    remaining: Math.max(0, max - existing.count),
    retryAfter,
  };
}

/**
 * Caller identity for rate limiting.
 *
 * `x-forwarded-for` is client-controlled in general, but on Vercel the platform
 * rewrites it, so the first entry is the real peer. Falls back to a single
 * shared bucket when no header is present, which fails closed rather than
 * handing every caller its own allowance.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  return `${scope}:${ip}`;
}
