// Serverkomponent (ingen 'use client')
import { getPostByPeriod, getAllPosts } from '@/lib/graph_queries/getPost';
import PopularNews from './PopularPostsGrid';
import { Post } from '@/lib/types';
import { getSiteTagline } from '@/lib/graph_queries/getSiteTagline';

type TickerItem = {
  id: string;
  slug: string;
  title: string;
  date?: string;
  category?: string;
  featuredImage?: string | { node?: { sourceUrl?: string } };
};

// Canonical key: prefer slug (stable across queries), then databaseId/postId, then id
function postKey(p: Post): string {
  const slug =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p as any)?.slug ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p as any)?.uri?.split('/').filter(Boolean).pop();
  if (slug) return String(slug).trim().toLowerCase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbid = (p as any)?.databaseId ?? (p as any)?.postId;
  if (dbid != null) return `db:${String(dbid)}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const id = (p as any)?.id;
  return id ? String(id) : Math.random().toString(36);
}

function appendWithoutDupes(base: Post[], extra: Post[], seen: Set<string>): Post[] {
  const out = [...base];
  for (const p of extra ?? []) {
    const k = postKey(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

export default async function PopularPosts() {
  const taglinePromise = getSiteTagline();

  // 1) Week
  const week = (await getPostByPeriod('week')) ?? [];
  const seen = new Set<string>(week.map(postKey));
  let merged: Post[] = [...week];

  // 2) Top up from Month
  if (merged.length < 9) {
    const month = (await getPostByPeriod('month')) ?? [];
    merged = appendWithoutDupes(merged, month, seen);
  }

  // 3) Top up from Latest (guaranteed to have posts)
  if (merged.length < 9) {
    const latest = (await getAllPosts()) ?? [];
    merged = appendWithoutDupes(merged, latest, seen);
  }

  const tagline = await taglinePromise;

  if (!merged.length) return <div>Inga roliga inlägg!</div>;

  // Grid: exactly up to 9
  const items: Post[] = merged.slice(0, 9);

  // Ticker: up to 12 from the merged (already de-duped) list
  const tickerItems: TickerItem[] = merged.slice(0, 12).map((p) => ({
    id: String(p.id),
    slug: p.slug,
    title: p.title,
    date: p.date,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: (p as any).category,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    featuredImage: (p as any).featuredImage,
  }));

  return <PopularNews items={items} tickerItems={tickerItems} tagline={tagline} />;
}
