// app/sitemap.ts
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_HOST_URL!;    
const WP_GRAPHQL_ENDPOINT = process.env.WP_GRAPHQL_URL!;
export const revalidate = 3600; // 1 hour

const CHUNK_SIZE = 45_000;

type WpNode = { uri: string; modifiedGmt?: string | null };  
type TermNode = { uri: string };                            

// POSTS + PAGES together
const CONTENT_QUERY = `
  query Content($first: Int!, $after: String) {
    contentNodes(
      first: $first
      after: $after
      where: { status: PUBLISH, contentTypes: [POST, PAGE] }
    ) {
      nodes {
        ... on Post { uri modifiedGmt }
        ... on Page { uri modifiedGmt }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

// CATEGORIES (hideEmpty true so you don't list empty term archives)
const CATEGORIES_QUERY = `
  query Categories($first: Int!, $after: String) {
    categories(first: $first, after: $after, where: { hideEmpty: true }) {
      nodes { uri }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

// Optional fast counts if your WPGraphQL exposes totals
const COUNTS_QUERY = `
  query Counts {
    posts(where: { status: PUBLISH }) { pageInfo { total } }
    pages(where: { status: PUBLISH }) { pageInfo { total } }
    categories(where: { hideEmpty: true }) { pageInfo { total } }
  }
`;

const staticRoutes = ['/', '/about', '/contact', '/work', 'privacy'];

// Generic cursor paginator
async function* paginate(
  query: string,
  rootKey: 'contentNodes' | 'categories',
  first = 500
) {
  let after: string | null = null;
  do {
    const res = await fetch(WP_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { first, after } }),
      next: { revalidate },
    });
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    const conn = json.data[rootKey];
    for (const node of conn.nodes as unknown[]) yield node;
    after = conn.pageInfo?.hasNextPage ? conn.pageInfo.endCursor : null;
  } while (after);
}

// Count helpers (fallback when COUNTS_QUERY isn't available)
async function countContent(): Promise<number> {
  let c = 0;
  for await (const n of paginate(CONTENT_QUERY, 'contentNodes')) { void n; c++; }
  return c;
}
async function countCategories(): Promise<number> {
  let c = 0;
  for await (const n of paginate(CATEGORIES_QUERY, 'categories')) { void n; c++; }
  return c;
}

async function getCounts() {
  try {
    const res = await fetch(WP_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: COUNTS_QUERY }),
      next: { revalidate },
    });
    const json = await res.json();
    const posts = json?.data?.posts?.pageInfo?.total;
    const pages = json?.data?.pages?.pageInfo?.total;
    const cats  = json?.data?.categories?.pageInfo?.total;
    if ([posts, pages, cats].every(v => Number.isFinite(v))) {
      return { contentTotal: posts + pages, categoriesTotal: cats };
    }
  } catch { /* ignore and fall back */ }
  // Fallback: count by paging once (cached by revalidate)
  const [contentTotal, categoriesTotal] = await Promise.all([
    countContent(),
    countCategories(),
  ]);
  return { contentTotal, categoriesTotal };
}

// How many chunk files?
export async function generateSitemaps() {
  const { contentTotal, categoriesTotal } = await getCounts();
  const total = staticRoutes.length + contentTotal + categoriesTotal;
  const parts = Math.max(1, Math.ceil(total / CHUNK_SIZE));
  return Array.from({ length: parts }, (_, id) => ({ id }));
}

// Build a single chunk
export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];
  const now = new Date();

  let skip = id * CHUNK_SIZE;
  let remaining = CHUNK_SIZE;

  // 1) Static routes
  for (const path of staticRoutes) {
    if (skip > 0) { skip--; continue; }
    if (remaining === 0) return urls;
    urls.push({ url: new URL(path, BASE_URL).toString(), lastModified: now });
    remaining--;
  }

  // 2) Posts + Pages
  for await (const n of paginate(CONTENT_QUERY, 'contentNodes')) {
    if (skip > 0) { skip--; continue; }
    if (remaining === 0) break;
    const node = n as WpNode;
    urls.push({
      url: new URL(node.uri, BASE_URL).toString(),
      lastModified: node.modifiedGmt ? new Date(node.modifiedGmt) : undefined,
    });
    remaining--;
  }

  // 3) Categories
  if (remaining > 0) {
    for await (const n of paginate(CATEGORIES_QUERY, 'categories')) {
      if (skip > 0) { skip--; continue; }
      if (remaining === 0) break;
      const term = n as TermNode;
      urls.push({
        url: new URL(term.uri, BASE_URL).toString(),
        // categories/terms don't have a reliable modified date; omit lastModified
      });
      remaining--;
    }
  }

  return urls;
}
