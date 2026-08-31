// Simple in-memory rate limiter. Resets on server restart/redeploy, and is
// per-instance in a serverless environment — not a substitute for a proper
// distributed limiter (e.g. Upstash), but stops casual abuse cheaply with
// zero new infrastructure.
const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  if (entry.count > limit) return true;

  return false;
}
