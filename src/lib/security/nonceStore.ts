// src/lib/security/nonceStore.ts
import "server-only"; 

const nonceCache = new Map<string, number>();

export async function seenNonce(nonce: string, ttlSec: number): Promise<boolean> {
  const now = Date.now();

  // purge expired entries
  for (const [key, exp] of nonceCache) {
    if (exp < now) nonceCache.delete(key);
  }

  if (nonceCache.has(nonce)) {
    // already used
    return false;
  }

  // mark as used until expiry
  nonceCache.set(nonce, now + ttlSec * 1000);
  return true;
}
