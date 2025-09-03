import Link from "next/link";
import { getAllPosts, getTodaysPosts } from "@/lib/graph_queries/getPost";
import TickerTapeVisible from "./tickers/tradingviewServer";

type SidebarPost = {
  id: string | number;
  title: string;
  date?: string;
  excerpt?: string;
  slug?: string;
  category?: string;
  categories?: Array<{ name?: string }>;
};

type Props = { heading?: string };

type MinimalPost = {
  id?: string | number;
  title?: string;
  date?: string;
  excerpt?: string;
  slug?: string;
  category?: string;
  categories?:
    | { nodes?: Array<{ name?: string | null } | null> }
    | Array<{ name?: string | null } | null>;
};

const stockholmFmt = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function stripHtml(input?: string): string {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function truncate(s: string, n = 140) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

function formatDateStockholm(iso?: string) {
  if (!iso) return "";
  return stockholmFmt.format(new Date(iso));
}

function getCategory(p: SidebarPost): string {
  if (p.category) return p.category;
  const first = p.categories?.find((c) => !!c?.name)?.name;
  return first ?? "";
}

function toSidebarPost(p: MinimalPost): SidebarPost {
  const catsRaw =
    p.categories && !Array.isArray(p.categories) && "nodes" in p.categories
      ? p.categories.nodes ?? []
      : Array.isArray(p.categories)
      ? p.categories
      : [];

  const catArray = catsRaw
    .filter(Boolean)
    .map((c) => ({ name: c?.name ?? undefined }));

  const primary = p.category ?? catArray[0]?.name;

  return {
    id: (p.id as string | number) ?? "",
    title: p.title ?? "",
    date: p.date,
    excerpt: p.excerpt,
    slug: p.slug,
    category: primary,
    categories: catArray,
  };
}

export default async function TodayPostsSidebar({ heading = "Dagens inlägg" }: Props) {
  let posts: SidebarPost[] = [];
  let usedFallback = false;

  try {
    // Try fetching today's posts first
    const todays = await getTodaysPosts(12);
    posts = (todays as MinimalPost[]).map(toSidebarPost);
  } catch (error) {
    console.error("Error fetching today's posts:", error);
    posts = [];
  }

  // If no today's posts, fetch fallback right before render
  if (posts.length === 0) {
    try {
      const latest = await getAllPosts({ first: 12 });
      posts = (latest as MinimalPost[]).map(toSidebarPost);
      usedFallback = posts.length > 0;
    } catch (error) {
      console.error("Error fetching fallback posts:", error);
      posts = [];
    }
  }

  const finalHeading = usedFallback ? "Populära inlägg" : heading;

  return (
    <div className="bg-white">
      <div className="rounded-sm">
        <div className="p-3 space-y-4 flex flex-col items-start rounded-sm">
          <section className="w-full bg-muted flex flex-col">
            <h2 className="text-sm sm:text-base font-semibold flex items-center">
              <span className="relative inline-flex h-2.5 w-2.5" />
              {finalHeading}
            </h2>

            {/* Ticker: compact height on small screens */}
            <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
              <TickerTapeVisible
                className="min-h-8 sm:min-h-10 md:min-h-12"
                height={0}
                preloadOffset="200px"
              />
            </div>

            {posts.length === 0 ? (
              <div className="text-sm text-zinc-600">Inget att visa just nu.</div>
            ) : (
              /* Scrollable list */
              <div className="w-full overflow-y-auto overscroll-contain max-h-[260px] sm:max-h-[420px] md:max-h-[544px]">
                <ul className="space-y-2.5 sm:space-y-3 w-full" style={{ contain: "content" }}>
                  {posts.slice(0, 12).map((p) => {
                    const date = formatDateStockholm(p.date);
                    const excerpt = truncate(stripHtml(p.excerpt), 70);
                    const category = getCategory(p);

                    return (
                      <li
                        key={p.id}
                        className="group bg-white dark:bg-black-800 rounded-sm p-2.5 sm:p-3 shadow-sm hover:shadow-sm transition-shadow flex items-start gap-2 min-h-[56px] sm:min-h-[64px]"
                      >
                        <span className="relative inline-flex flex-shrink-0 h-2.5 w-2.5 mt-1">
                          <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                        </span>

                        <Link
                          href={`/${p.slug}`}
                          prefetch={false}
                          className="block flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
                        >
                          {(category || date) && (
                            <div className="text-[10px] sm:text-[11px] text-red-700 flex items-center gap-1">
                              {category && <span className="font-medium truncate">{category}</span>}
                              {category && date && <span aria-hidden>•</span>}
                              {date && <span className="shrink-0">{date}</span>}
                            </div>
                          )}

                          <div className="mt-0.5 text-sm sm:text-base font-medium leading-snug group-hover:underline line-clamp-2 break-words">
                            {p.title}
                          </div>

                          {excerpt && (
                            <p className="mt-1 hidden sm:block text-xs sm:text-sm text-black-600 dark:text-black-300 line-clamp-2 break-words">
                              {excerpt}
                            </p>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
