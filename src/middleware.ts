// middleware.ts
import { NextResponse } from 'next/server';

// In-memory store: Map<ip, timestamps[]>
const requests = new Map<string, number[]>();

/**
 * Simple sliding-window rate limiter
 * - limit: max requests allowed
 * - windowMs: timeframe in ms
 */
function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Remove old hits
  const hits = requests.get(key)?.filter(ts => ts > windowStart) ?? [];

  // Record this hit
  hits.push(now);
  requests.set(key, hits);

  // Check
  return hits.length <= limit;
}

export function middleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const ok = rateLimit(ip, 5, 2000);

  if (!ok) {
    return NextResponse.json(
      { message: 'Too many requests' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
