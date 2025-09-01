import { getAuthorBySlug } from '@/lib/graph_queries/getAuthor';
import { Sidebar } from "@/app/components/Main-page/SideBar";
import { stripHtml } from '@/lib/helper_functions/strip_html';
import { Post } from '@/lib/types';
import Link from "next/link";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import type { Metadata } from 'next';
import { getBestSeoBySlug } from '@/lib/seo/seo-helpers';
import { truncateWords } from '@/lib/utils';

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

// ---------- helper (safe JSON parse) ----------
function safeParse<T = unknown>(raw?: string): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = await getBestSeoBySlug(slug, 'author');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLdRaw = (meta.other as any)?.jsonLd as string | undefined;
  safeParse(jsonLdRaw); // parsed but not logged

  return meta;
}

export default async function AuthorInfo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch content in parallel to reduce server time (helps TTFB)
  const [author, seo] = await Promise.all([
    getAuthorBySlug(slug),
    getBestSeoBySlug(slug, 'author'),
  ]);

  const { meta: seoMeta } = seo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLdRaw = (seoMeta.other as any)?.jsonLd as string | undefined;
  safeParse(jsonLdRaw); // parsed but not logged

  if (!author) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Author</h1>
        <p className="text-red-500">{`Author "${slug}" not found.`}</p>
      </div>
    );
  }


const breadcrumbItems = [
  { href: "/", label: "Hem" },
  { href: null, label: "Författare" }, 
  { href: `/author/${slug}`, label: `${author.name}`, current: true },
];

return (
  <div className="container mx-auto py-8 px-4">
    {/* Emit JSON-LD script (server-rendered) */}
    {jsonLdRaw ? (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdRaw }}
      />
    ) : null}

    {/* Title */}
    <h1 className="text-3xl font-bold mb-2">{author.name}</h1>

    {/* Breadcrumbs UNDER the title */}
    <Breadcrumb>
      <BreadcrumbList className="flex items-center gap-1 text-sm ">
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


      {/* Description */}
      <div className="text-gray-700 mb-6 mt-6">{author.description}</div>
      <div className="text-xs text-gray-500 mb-4">
        Posts: {author.posts.nodes.length}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 flex flex-col">
          <ul
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            // Optional: helps keep below-the-fold work from delaying paint
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 800px' as any }}
          >
            {author.posts.nodes.length > 0 ? (
              author.posts.nodes.map((post: Post, idx: number) => {
                const imgSrc =
                  post.featuredImage?.node?.sourceUrl ||
                  author.avatar?.url ||
                  './full_logo_with_slogan.png';
                const imgAlt =
                  post.featuredImage?.node?.altText || post.title || author.name;

                const isLCP = idx === 0; // only the very first card gets priority (must be above the fold)

                return (
                  <li
                    key={post.id}
                    className="rounded-sm hover:cursor-pointer transition flex flex-col overflow-hidden group"
                  >
                    <Link
                      href={`/${post.slug}`}
                      prefetch={false}
                      className="block overflow-hidden"
                    >
                      {/* Use fill mode to avoid width/height mismatch warnings */}
                 <div className="relative w-full aspect-[600/300]">
                  <Image
                    src={imgSrc}
                    alt={imgAlt}
                    fill
                    sizes="(max-width: 640px) 100vw,
                          (max-width: 1024px) 60vw,
                          80vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-200 bg-[#f5f5f5]"
                    priority={isLCP}
                    fetchPriority={isLCP ? 'high' : 'auto'}
                    loading={isLCP ? 'eager' : 'lazy'}
                    placeholder="blur"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    blurDataURL={(post as any)?.featuredImage?.node?.blurDataURL || "./full_logo_with_slogan.png"}
                    quality={85} // 🔹 increase from 70 → 85 for sharper images
                  />
                </div>
                    </Link>

                    <div className="pt-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/${post.slug}`}
                          prefetch={false}
                          className="font-bold text-lg hover:underline line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(post.date).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="prose prose-sm text-gray-700 mt-2 flex-1">
                        {truncateWords(stripHtml(post.excerpt || "") || "", 15)}
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="col-span-full text-gray-500 text-center mt-8">
                Inga inlägg hittades för denna författare.
              </li>
            )}
          </ul>
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
