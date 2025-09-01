import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, getCategoryBySlug } from '@/lib/graph_queries/getCategory';


// Helper to set CDN + browser caching in one place
function setCache(
  res: NextResponse,
  {
    ttl,
    swr = 60,
    browserMaxAge = 0
  }: { ttl: number; swr?: number; browserMaxAge?: number }
) {
  if (ttl <= 0) {
    res.headers.set('Cache-Control', 'no-store');
    // CDN-specific header (Vercel honors this and it overrides Cache-Control)
    res.headers.set('CDN-Cache-Control', 'no-store');
    return res;
  }
  const cdn = `public, s-maxage=${ttl}, stale-while-revalidate=${swr}`;
  const browser = `public, max-age=${browserMaxAge}`;
  res.headers.set('Cache-Control', `${browser}, ${cdn}`);
  res.headers.set('CDN-Cache-Control', cdn);
  return res;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug')?.trim() || null;
  const after = searchParams.get('after') || undefined;

  try {
    // Posts for a specific category
    if (slug) {
      const category = await getCategoryBySlug(slug, after);

      if (!category) {
        // 404 is fine; don't cache
        return NextResponse.json({ error: 'Category not found' }, { status: 404, headers: { 'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store' } });
      }

      const posts = category.posts?.nodes ?? [];
      const pageInfo = category.posts?.pageInfo ?? {
        hasNextPage: false,
        endCursor: null,
      };

      const res = NextResponse.json({ posts, pageInfo }, { status: 200 });

      // ✅ Cache the FIRST page for a short time; don't cache pagination
      if (after) {
        res.headers.set('Cache-Control', 'no-store');
        res.headers.set('CDN-Cache-Control', 'no-store');
      } else {
        setCache(res, { ttl: 300, swr: 60, browserMaxAge: 0 }); // 5 min CDN cache
      }
      return res;
    }

    // Category list
    const categories = await getAllCategories();
    const res = NextResponse.json(categories, { status: 200 });

    // ✅ Cache category list longer; your getAllCategories also has fetch revalidate
    setCache(res, { ttl: 86400, swr: 3600, browserMaxAge: 300 }); // 1 day CDN, 5 min browser
    return res;
  } catch (err) {
    console.error('GET /api/categories error:', err);
    return NextResponse.json({ error: 'Failed to fetch data' }, {
      status: 500,
      headers: { 'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store' },
    });
  }
}
