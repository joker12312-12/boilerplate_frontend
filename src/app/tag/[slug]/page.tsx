import { Sidebar } from "@/app/components/Main-page/SideBar";
import { getTagBySlug } from "@/lib/graph_queries/getTag";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { getBestSeoBySlug } from "@/lib/seo/seo-helpers";
import { Post } from "@/lib/types";
import TagPosts from "./TagPosts";

// ---- Types ----
type Params = Promise<{ slug: string }>;

interface Tag {
  id: string;
  slug: string;
  name: string;
  description?: string;
  count?: number;
  posts: {
    nodes: Post[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

// ---------- helper (safe JSON parse) ----------
function safeParse<T = unknown>(raw?: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = await getBestSeoBySlug(slug, "tag");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLdRaw = (meta.other as any)?.jsonLd as string | undefined;
  safeParse(jsonLdRaw);

  return meta;
}

export default async function TagPage({ params }: { params: Params }) {
  const { slug } = await params;

  let tag: Tag | null = null;
  try {
    tag = await getTagBySlug(slug);
  } catch (e) {
    console.error(e);
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Tag</h1>
        <p className="text-red-500">Failed to load tag.</p>
      </div>
    );
  }

  if (!tag) notFound();

  // Fetch SEO again for JSON-LD injection (server-rendered)
  const { meta: seoMeta } = await getBestSeoBySlug(slug, "tag");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLdRaw = (seoMeta.other as any)?.jsonLd as string | undefined;
  safeParse(jsonLdRaw);

  // Breadcrumb items (mirror category page pattern)
  const breadcrumbItems = [
    { href: "/", label: "Hem" },
    { href: null, label: "Taggar" },
    { href: `/tags/${tag.slug}`, label: tag.name, current: true },
  ];

  // Prepare initial posts + pageInfo for the client component
  const initialPosts: Post[] = tag.posts?.nodes ?? [];
  const initialPageInfo = tag.posts?.pageInfo ?? {
    hasNextPage: false,
    endCursor: "",
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Emit JSON-LD script (server-rendered) */}
      {jsonLdRaw ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdRaw }} />
      ) : null}

      <h1 className="text-3xl font-bold mb-2">{tag.name}</h1>

      {/* Breadcrumbs (valid <ol>/<li> structure, separator is its own <li>) */}
      <Breadcrumb>
        <BreadcrumbList className="flex items-center gap-1 text-sm">
          {breadcrumbItems.flatMap((item, idx) => {
            const isLast = idx === breadcrumbItems.length - 1;

            return [
              idx !== 0 ? (
                <BreadcrumbSeparator key={`sep-${idx}`}>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </BreadcrumbSeparator>
              ) : null,
              (
                <BreadcrumbItem key={item.href || item.label}>
                  {item.href && !isLast ? (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href}
                        className="text-gray-700 underline underline-offset-4 hover:text-gray-900 transition-colors"
                        prefetch={false}
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className={`${
                        isLast
                          ? "font-semibold text-primary cursor-default"
                          : "text-gray-500 cursor-default"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </BreadcrumbItem>
              ),
            ];
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {tag.description && <div className="text-gray-700 mb-2">{tag.description}</div>}
      <div className="text-xs text-gray-500 mb-4 mt-2">Posts: {tag.count || "0"}</div>

      {/* Main grid (kept identical to category page) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Posts via TagPosts (client) */}
        <div className="lg:col-span-2 flex flex-col">
          <TagPosts
            slug={slug}
            initialPosts={initialPosts}
            initialPageInfo={initialPageInfo}
          />
        </div>

        {/* Sidebar */}
        <aside className="w-full h-full hidden lg:block">
          <div className="sticky top-24 w-[60%]">
            <Sidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}
