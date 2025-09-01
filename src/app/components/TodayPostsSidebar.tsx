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

/** 👇 A minimal shape that both Post and TodayPost can conform to */
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

/** Accepts either Post or TodayPost (or anything matching MinimalPost) */
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    id: (p.id as any) ?? "", 
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
    // Hämta upp till 12 (no cast to Post[] here)
    const todays = await getTodaysPosts(12); // TodayPost[] (or similar)
    posts = (todays as MinimalPost[]).map(toSidebarPost);

    if (!posts.length) {
      const latest = await getAllPosts({ first: 12 }); // Post[]
      posts = (latest as MinimalPost[]).map(toSidebarPost);
      usedFallback = true;
    }
  } catch {
    posts = [];
  }

  const finalHeading = usedFallback ? "Populära inlägg" : heading;

  return (
    <div className="overflow-visible bg-white">
      <div className="rounded-sm">
        <div className="p-3 space-y-4 flex flex-col items-start rounded-sm">
          <section className="w-full bg-muted flex flex-col">
            <h2 className="text-base sm:text-lg font-semibold flex items-center">
              <span className="relative inline-flex h-2.5 w-2.5" />
              {finalHeading}
            </h2>

            <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
              <TickerTapeVisible className="min-h-10 sm:min-h-12" height={0} preloadOffset="200px" />
            </div>

            {posts.length === 0 ? (
              <div className="text-sm text-zinc-600">Inget att visa just nu.</div>
            ) : (
              <div className="w-full overflow-visible md:overflow-y-auto md:max-h-[544px]">
                <ul className="space-y-3 w-full" style={{ contain: "content" }}>
                  {posts.slice(0, 12).map((p) => {
                    const date = formatDateStockholm(p.date);
                    const excerpt = truncate(stripHtml(p.excerpt), 70);
                    const category = getCategory(p);

                    return (
                      <li
                        key={p.id}
                        className="group bg-white dark:bg-black-800 rounded-sm p-3 shadow-sm hover:shadow-sm transition-shadow flex items-start gap-2 min-h-[64px]"
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
                            <div className="text-[11px] sm:text-xs text-red-700 flex items-center gap-1">
                              {category && <span className="font-medium truncate">{category}</span>}
                              {category && date && <span aria-hidden>•</span>}
                              {date && <span className="shrink-0">{date}</span>}
                            </div>
                          )}

                          <div className="mt-0.5 font-medium leading-snug group-hover:underline line-clamp-2 sm:line-clamp-2 break-words">
                            {p.title}
                          </div>

                          {excerpt && (
                            <p className="mt-1 text-xs sm:text-sm text-black-600 dark:text-black-300 line-clamp-2 break-words">
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
