// src/lib/wpCached.ts
import { unstable_cache as cache } from 'next/cache';
import crypto from 'node:crypto';
import { signedFetch } from '@/lib/security/signedFetch';

function stableHash(input: unknown): string {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return crypto.createHash('sha1').update(str).digest('hex');
}

type CacheOpts = {
  revalidate?: number;
  tags?: string[];
};

// Let fetchJSON accept a `json` shortcut like signedFetch does.
type SignedInit = RequestInit & { json?: unknown };

async function fetchJSON(url: string, init: SignedInit = {}) {
  const { json, headers: initHeaders, ...rest } = init;

  const headers = new Headers(initHeaders ?? {});
  headers.set('Accept', 'application/json');

  if (json !== undefined) {
    // Convenience: set JSON body & headers automatically
    rest.method = rest.method ?? 'POST';
    rest.body = JSON.stringify(json);
    headers.set('Content-Type', 'application/json');
  } else if ((rest.method ?? 'GET').toUpperCase() === 'POST') {
    // If caller provided a body for POST but forgot the header, add it
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const res = await signedFetch(url, { cache: 'no-store', headers, ...rest });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[fetchJSON] ${res.status} ${res.statusText} ${body}`);
  }
  return res.json();
}

/** Cached GraphQL call (WPGraphQL). */
export async function wpGraphQLCached<T>(
  query: string,
  variables: Record<string, unknown> = {},
  opts: CacheOpts = {}
): Promise<T> {
  const key = ['wp:gql', stableHash(query), stableHash(variables)];

  const runner = cache(
    async () => {
      const data = await fetchJSON(process.env.WP_GRAPHQL_URL!, {
        json: { query, variables }, // ← ensures proper header + body
      });
      return data as T;
    },
    key,
    { revalidate: opts.revalidate ?? 300, tags: opts.tags ?? [] }
  );

  return runner();
}

/** Cached REST call (WP REST endpoints). */
export async function wpRestCached<T>(
  url: string,
  opts: CacheOpts = {},
  init?: SignedInit
): Promise<T> {
  const key = ['wp:rest', stableHash(url)];
  const runner = cache(
    async () => {
      const data = await fetchJSON(url, init);
      return data as T;
    },
    key,
    { revalidate: opts.revalidate ?? 300, tags: opts.tags ?? [] }
  );
  return runner();
}