// app/sitemap.xml/route.ts
import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_HOST_URL!;
const WP_GRAPHQL_ENDPOINT = process.env.WP_GRAPHQL_URL!;
export const revalidate = 3600;
const CHUNK_SIZE = 45_000;

const staticRoutes = ['/', '/about', '/contact', '/work', 'privacy'];

const CONTENT_COUNT_QUERY = `
  query Counts {
    posts(where: { status: PUBLISH }) { pageInfo { total } }
    pages(where: { status: PUBLISH }) { pageInfo { total } }
    categories(where: { hideEmpty: true }) { pageInfo { total } }
  }
`;

async function getTotals(): Promise<number> {
  try {
    const res = await fetch(WP_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: CONTENT_COUNT_QUERY }),
      next: { revalidate },
    });
    const json = await res.json();
    const posts = json?.data?.posts?.pageInfo?.total;
    const pages = json?.data?.pages?.pageInfo?.total;
    const cats  = json?.data?.categories?.pageInfo?.total;
    if ([posts, pages, cats].every(v => Number.isFinite(v))) return posts + pages + cats;
  } catch { /* ignore */ }

  let total = 0;
  {
    let after: string | null = null;
    const first = 500;
    do {
      const res = await fetch(WP_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `
          query ContentOnly($first: Int!, $after: String) {
            contentNodes(first: $first, after: $after, where: { status: PUBLISH, contentTypes: [POST, PAGE] }) {
              nodes { __typename }
              pageInfo { hasNextPage endCursor }
            }
          }`, variables: { first, after } }),
        next: { revalidate },
      });
      const json = await res.json();
      const conn = json.data.contentNodes;
      total += conn.nodes.length;
      after = conn.pageInfo?.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (after);
  }
  // categories
  {
    let after: string | null = null;
    const first = 500;
    do {
      const res = await fetch(WP_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `
          query Cats($first: Int!, $after: String) {
            categories(first: $first, after: $after, where: { hideEmpty: true }) {
              nodes { id }
              pageInfo { hasNextPage endCursor }
            }
          }`, variables: { first, after } }),
        next: { revalidate },
      });
      const json = await res.json();
      const conn = json.data.categories;
      total += conn.nodes.length;
      after = conn.pageInfo?.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (after);
  }
  return total;
}

export async function GET() {
  const grandTotal = staticRoutes.length + (await getTotals());
  const parts = Math.max(1, Math.ceil(grandTotal / CHUNK_SIZE));

  const items = Array.from({ length: parts }, (_, i) =>
    `<sitemap><loc>${new URL(`/sitemap/${i}.xml`, BASE_URL).toString()}</loc></sitemap>`
  ).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`;

  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } });
}
