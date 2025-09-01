import { Sidebar } from "@/app/components/Main-page/SideBar";
import { getCategoryBySlug } from "@/lib/graph_queries/getCategory";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { ICategory, Post } from "@/lib/types";
import type { Metadata } from "next";
import { getBestSeoBySlug } from "@/lib/seo/seo-helpers";
import CategoryPosts from "./CategoryPosts";

type Params = { slug: string };

// ---------- helper (safe JSON parse) ----------
function safeParse<T = unknown>(raw?: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = await getBestSeoBySlug(slug, "category");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLdRaw = (meta.other as any)?.jsonLd as string | undefined;
  safeParse(jsonLdRaw);

  return meta;
}

export default async function CategoryPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;

  let category: ICategory | null = null;
  try {
    category = await getCategoryBySlug(slug);
  } catch (e) {
    console.error(e);
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Category</h1>
        <p className="text-red-500">Failed to load category.</p>
      </div>
    );
  }

  if (!category) notFound();

  const { meta: seoMeta } = await getBestSeoBySlug(slug, "category");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLdRaw = (seoMeta.other as any)?.jsonLd as string | undefined;
  safeParse(jsonLdRaw);

  // Breadcrumb items
  const breadcrumbItems = [
    { href: "/", label: "Hem" },
    { href: null as string | null, label: "Kategorier" },
    ...(category.parent?.node
      ? [{ href: `/category/${category.parent.node.slug}`, label: category.parent.node.name }]
      : []),
    { href: `/category/${category.slug}`, label: category.name, current: true },
  ];

  // Prepare initial posts + pageInfo for the client component
  // Ensures `avatar.url` is present to satisfy `AuthorAvatar` in `Post`.
  const initialPosts: Post[] = category.posts.nodes.map((p) => ({
    ...p,
    author: p.author && p.author.node
      ? {
          node: {
            ...p.author.node,
            avatar: p.author.node.avatar?.url
              ? { url: p.author.node.avatar.url }
              : { url: "/images/default-avatar.png" },
          },
        }
      : undefined,
  }));

  const initialPageInfo = category.posts.pageInfo; // <-- was missing

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Emit JSON-LD script */}
      {jsonLdRaw ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdRaw }} />
      ) : null}

      {/* Category header image */}
      {category.image?.sourceUrl && (
        <div className="mb-4 w-full flex justify-center">
          <Image
            src={category.image.sourceUrl}
            alt={category.image.altText || category.name}
            width={160}
            height={160}
            className="object-cover shadow border bg-white"
            priority
          />
        </div>
      )}

      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>

      {/* Breadcrumbs */}
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
                <BreadcrumbItem key={(item.href ?? item.label) as string}>
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
                      className={isLast
                        ? "font-semibold text-primary cursor-default"
                        : "text-gray-500 cursor-default"}
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

      <div className="text-gray-700 mb-2">{category.description}</div>
      {category.parent?.node && (
        <div className="text-xs text-gray-400 mb-2">Parent: {category.parent.node.name}</div>
      )}
      <div className="text-xs text-gray-500 mb-4">Posts: {category.count || "0"}</div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Posts delegated to CategoryPosts */}
        <div className="lg:col-span-2 flex flex-col">
          <CategoryPosts
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
