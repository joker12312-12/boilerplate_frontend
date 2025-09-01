import Link from "next/link";
import SearchPosts from "../api/search/SearchPosts";
import { Sidebar } from "../components/Main-page/SideBar";
import type { Metadata } from "next";

/* ------------------------- Logging utilities ------------------------- */
const DEBUG_SEARCH =
  process.env.NODE_ENV !== "production" || process.env.DEBUG_SEARCH === "1";

function stripHtml(s?: string) {
  return s ? s.replace(/<[^>]*>/g, "") : "";
}

function sanitize(s?: string) {
  return s ? stripHtml(s).replace(/[\r\n\t]/g, " ").trim() : "";
}

function logSearch(payload: Record<string, unknown>) {
  if (!DEBUG_SEARCH) return;
  try {
    // Pretty-print in development mode
    console.groupCollapsed(
      `%c[Sökdebugg]`,
      "color:#3B82F6; font-weight:bold;",
      payload?.["q"] ? `Fråga: "${payload["q"]}"` : ""
    );
    console.table(payload);
    console.groupEnd();
  } catch {
    // Fallback if console.table fails
    console.log("[Sökdebugg]", payload);
  }
}

/* ------------------------------ Helpers ------------------------------ */
type SearchDict = { [key: string]: string | string[] | undefined };

function getQ(sp?: SearchDict): string {
  const raw = sp?.q;
  const val = Array.isArray(raw) ? raw[0] : raw || "";
  return val.trim();
}

/* ------------------------------ Metadata ----------------------------- */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchDict>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = getQ(sp);
  const SITE = process.env.NEXT_PUBLIC_HOSTNAME ?? "Hem";

  const robots = { index: false, follow: true as const };

  if (!q) {
    return {
      title: "Sökresultat",
      description: `Sökresultat från ${SITE}`,
      robots,
    };
  }

  return {
    title: `Sökresultat för "${q}" - ${SITE}`,
    description: `Sökresultat för "${q}" från ${SITE}`,
    robots,
    other: {
      jsonLd: JSON.stringify([
        {
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          name: `Sökresultat för "${q}"`,
          description: `Sökresultat för "${q}" från ${SITE}`,
          url: `${process.env.NEXT_PUBLIC_HOST_URL || "http://localhost"}/search?q=${encodeURIComponent(
            q
          )}`,
          query: q,
        },
      ]),
    },
  };
}

/* ------------------------------- Types -------------------------------- */
type GQLPost = {
  id?: string;
  databaseId?: number;
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;
  featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
  author?: {
    node?: { name?: string; slug?: string; avatar?: { url?: string } };
  };
};

type PageInfo = { hasNextPage: boolean; endCursor?: string | null };

/* --------------------------- Server-side fetch ------------------------ */
async function fetchSearchResultsWithPageInfo(
  q: string,
  first = 6
): Promise<{ nodes: GQLPost[]; pageInfo: PageInfo }> {
  const GRAPHQL_URL = process.env.WP_GRAPHQL_URL!;
  const gql = `
    query SearchPostsFull($search: String!, $first: Int!) {
      posts(
        first: $first,
        where: { search: $search, orderby: { field: DATE, order: DESC }, status: PUBLISH }
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

  const started = Date.now();
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ query: gql, variables: { search: q, first } }),
  });
  const durationMs = Date.now() - started;

  if (!res.ok) {
    logSearch({ q: sanitize(q), first, error: res.statusText, durationMs });
    throw new Error(`GraphQL request failed: ${res.statusText}`);
  }

  const json = await res.json();
  const nodes = (json?.data?.posts?.nodes ?? []) as GQLPost[];
  const pageInfo =
    (json?.data?.posts?.pageInfo ?? {
      hasNextPage: false,
      endCursor: null,
    }) as PageInfo;

  logSearch({
    q: sanitize(q),
    first,
    count: nodes.length,
    hasNextPage: !!pageInfo?.hasNextPage,
    endCursor: pageInfo?.endCursor ?? null,
    durationMs,
    sample: nodes.slice(0, 3).map((n) => ({
      id: n.id ?? n.databaseId,
      slug: n.slug,
      title: sanitize(n.title),
      date: n.date,
      author: n.author?.node?.name,
    })),
  });

  return { nodes, pageInfo };
}

/* -------------------------------- Page -------------------------------- */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchDict>;
}) {
  const sp = await searchParams;
  const q = getQ(sp);

  if (!q) {
    logSearch({ q: "", count: 0, reason: "empty-query" });
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-4">Sök</h1>
        <p className="text-muted-foreground">
          Skriv in en sökfråga i sökfältet ovan för att se resultat.
        </p>
      </div>
    );
  }

  const { nodes, pageInfo } = await fetchSearchResultsWithPageInfo(q, 6);

  if (nodes.length === 0) {
    logSearch({ q: sanitize(q), count: 0, hasNextPage: false, reason: "no-results" });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Inject JSON-LD script from metadata.other */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            name: `Sökresultat för "${q}"`,
            description: `Sökresultat för "${q}" från ${
              process.env.NEXT_PUBLIC_HOSTNAME ?? "Hem"
            }`,
            url: `${
              process.env.NEXT_PUBLIC_HOST_URL || "http://localhost"
            }/search?q=${encodeURIComponent(q)}`,
            query: q,
          }),
        }}
      />

      <h1 className="text-3xl font-bold mb-2">Sökresultat för ”{q}”</h1>
      <div className="text-sm text-muted-foreground mb-6">
        Visar {nodes.length} resultat.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 flex flex-col">
          {nodes.length === 0 ? (
            <div className="mb-8 p-6 rounded-sm border border-gray-200 bg-gray-50 text-center">
              <p className="text-lg font-semibold text-gray-600 mb-4">
                Inga resultat hittades.
              </p>
              <div className="text-gray-500 mb-2">
                Prova ett annat sökord eller bläddra bland våra{" "}
                <Link href="/" className="underline" prefetch={false}>
                  senaste inlägg
                </Link>
                .
              </div>
            </div>
          ) : (
            <SearchPosts
              q={q}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              initialPosts={nodes as any}
              initialPageInfo={pageInfo}
              pageSize={6}
            />
          )}
        </div>

        <aside className="w-full h-full hidden lg:block">
          <div className="sticky top-24 w-[60%]">
            <Sidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}
