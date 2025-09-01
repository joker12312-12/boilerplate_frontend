"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Post } from "@/lib/types";

function getFirstWords(html: string, wordCount: number) {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(Boolean).slice(0, wordCount);
  return words.join(" ") + (words.length === wordCount ? "…" : "");
}

const stripHtml = (s: string) => (s ? s.replace(/<[^>]+>/g, "") : "");

function mergeUniquePosts(prev: Post[], next: Post[]) {
  const seen = new Set(
    prev.map((p) => (p.id ?? p.databaseId ?? p.slug) as string | number)
  );
  const deduped = next.filter((p) => {
    const key = (p.id ?? p.databaseId ?? p.slug) as string | number;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...prev, ...deduped];
}

export default function SearchPosts({
  q,
  initialPosts,
  initialPageInfo,
  pageSize = 6,
}: {
  q: string;
  initialPosts: Post[];
  initialPageInfo: { hasNextPage: boolean; endCursor?: string | null };
  pageSize?: number;
}) {
  const [posts, setPosts] = React.useState<Post[]>(initialPosts);
  const [pageInfo, setPageInfo] = React.useState(initialPageInfo);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);

  const loadMore = React.useCallback(async () => {
    if (!pageInfo.hasNextPage || loading) return;

    setLoading(true);
    setError(null);

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const url = new URL("/api/search", window.location.origin);
      url.searchParams.set("q", q);
      url.searchParams.set("first", String(pageSize));
      if (pageInfo.endCursor) url.searchParams.set("after", pageInfo.endCursor);

      const res = await fetch(url.toString(), {
        cache: "no-store",
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`Failed to load more (${res.status}) ${msg}`);
      }

      const data = await res.json();
      const nextPosts: Post[] = data.posts ?? [];
      setPosts((prev) => mergeUniquePosts(prev, nextPosts));
      setPageInfo(data.pageInfo ?? { hasNextPage: false, endCursor: undefined });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error(e);
        setError(
          "Something went wrong while loading more results. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [q, pageInfo.hasNextPage, pageInfo.endCursor, loading, pageSize]);

  return (
    <>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post, idx) => {
          const imgSrc = post.featuredImage?.node?.sourceUrl;
          const imgAlt =
            post.featuredImage?.node?.altText || stripHtml(post.title);
          const isLCP = idx === 0; // Boost first result

          return (
            <li
              key={post.id ?? post.databaseId ?? post.slug}
              className="rounded-sm hover:cursor-pointer transition flex flex-col overflow-hidden group"
            >
              {/* Image */}
              {imgSrc ? (
                <Link href={`/${post.slug}`} className="block overflow-hidden">
                  <div className="relative w-full aspect-[1200/450]">
                  <Image
                  src={imgSrc || "./full_logo_with_slogan.png"}
                  alt={imgAlt}
                  fill
                  sizes="(max-width: 640px) 100vw,
                        (max-width: 1024px) 60vw,
                        75vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-200 bg-[#f5f5f5]"
                  quality={85}
                  priority={isLCP}
                  fetchPriority={isLCP ? "high" : "auto"}
                  loading={isLCP ? "eager" : "lazy"}
                  placeholder={isLCP ? "empty" : "blur"}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  blurDataURL={!isLCP ? (post as any)?.featuredImage?.node?.blurDataURL || "./full_logo_with_slogan.png" : undefined}
                />
                  </div>
                </Link>
              ) : (
                <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">
                  Ingen bild
                </div>
              )}

              {/* Content */}
              <div className="pt-4 flex flex-col flex-1">
                <Link
                  href={`/${post.slug}`}
                  className="font-bold text-lg mb-1 hover:underline line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
                <div className="flex items-center justify-between mb-2">
                  {/* Author info left */}
                  <div className="flex items-center gap-2">
                    {post.author?.node?.avatar?.url && (
                      <Image
                        src={post.author.node.avatar.url}
                        alt={post.author.node.name || "Author"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    {post.author?.node && (
                      <Link
                        href={`/author/${post.author.node.slug}`}
                        className="text-xs text-gray-700 hover:underline"
                      >
                        {post.author.node.name}
                      </Link>
                    )}
                  </div>
                  {/* Date right */}
                  {post.date && (
                    <span className="text-xs text-gray-500 mr-2">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="prose prose-sm text-gray-700 flex-1 line-clamp-4">
                  {getFirstWords(post.excerpt ?? "", 20)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Load more button */}
      {pageInfo.hasNextPage && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <Button
            onClick={loadMore}
            disabled={loading}
            aria-busy={loading}
            className="bg-black hover:bg-primary-600 text-white"
          >
            {loading ? "Laddar…" : "Ladda mer"}
          </Button>
          {error && (
            <div
              className="text-xs text-red-600/80"
              role="status"
              aria-live="polite"
            >
              {error}
            </div>
          )}
        </div>
      )}
    </>
  );
}
