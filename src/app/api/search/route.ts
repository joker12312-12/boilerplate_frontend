import { NextResponse } from "next/server";

// Uncomment if you want to run this on the Edge runtime
// export const runtime = "edge";
// export const dynamic = "force-dynamic";

type GQLPost = {
  id?: string;
  databaseId?: number;
  slug?: string;
  title?: string;
  excerpt?: string;
  date?: string;
  featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
  author?: { node?: { name?: string; slug?: string; avatar?: { url?: string } } };
};

type GQLResp = {
  data?: {
    posts?: {
      pageInfo?: { hasNextPage: boolean; endCursor?: string | null };
      nodes?: GQLPost[];
    };
  };
  errors?: Array<{ message?: string }>;
};

const MAX_FIRST = 50;
const DEFAULT_FIRST = 10;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qRaw = (url.searchParams.get("q") || "").trim();
  const q = qRaw.slice(0, 200); // basic clamp

  const firstParam = url.searchParams.get("first");
  const first = Math.min(
    Math.max(Number.isFinite(Number(firstParam)) ? Number(firstParam) : DEFAULT_FIRST, 1),
    MAX_FIRST
  );

  const after = url.searchParams.get("after") || null;

  if (!q) {
    return NextResponse.json(
      { posts: [], pageInfo: { hasNextPage: false, endCursor: null } },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const gql = `
    query SearchPostsMore($q: String!, $first: Int!, $after: String) {
      posts(
        first: $first
        after: $after
        where: { search: $q, orderby: { field: DATE, order: DESC }, status: PUBLISH }
      ) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          databaseId
          slug
          title(format: RENDERED)
          excerpt(format: RENDERED)
          date
          featuredImage { node { sourceUrl altText } }
          author { node { name slug avatar { url } } }
        }
      }
    }
  `;

  // Add a defensive timeout so the route won't hang if WP is slow
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 10_000);

  try {
    const res = await fetch(process.env.WP_GRAPHQL_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ query: gql, variables: { q, first, after } }),
      signal: ac.signal,
    });

    if (!res.ok) {
      return NextResponse.json(
        { posts: [], pageInfo: { hasNextPage: false, endCursor: null } },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const json = (await res.json()) as GQLResp;

    if (json.errors?.length) {
      console.error("WPGraphQL errors:", json.errors);
      return NextResponse.json(
        { posts: [], pageInfo: { hasNextPage: false, endCursor: null } },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const posts = json?.data?.posts?.nodes ?? [];
    const pageInfo = json?.data?.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

    return NextResponse.json(
      { posts, pageInfo },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((e as any)?.name === "AbortError") {
      console.warn("WPGraphQL request aborted (timeout).");
    } else {
      console.error("search posts API failed:", e);
    }
    return NextResponse.json(
      { posts: [], pageInfo: { hasNextPage: false, endCursor: null } },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  } finally {
    clearTimeout(timeout);
  }
}
