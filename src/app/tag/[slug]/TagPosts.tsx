"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { Post } from "@/lib/types";

interface TagPostsProps {
  slug: string;
  initialPosts: Post[];
  initialPageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}

async function fetchMorePosts(slug: string, after: string) {
  const res = await fetch(
    `/tag?slug=${encodeURIComponent(slug)}&after=${encodeURIComponent(after)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    }
  );
  if (!res.ok) throw new Error("Failed to load more posts");
  return res.json() as Promise<{
    posts: Post[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  }>;
}

function getFirstWords(html: string, wordCount: number) {
  if (!html) return "";
  // Remove HTML tags
  const text = html.replace(/<[^>]+>/g, "");
  // Split into words and take first `wordCount`
  const words = text.split(/\s+/).filter(Boolean).slice(0, wordCount);
  return words.join(" ") + (words.length === wordCount ? "…" : "");
}

export default function TagPosts({ slug, initialPosts, initialPageInfo }: TagPostsProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [loading, setLoading] = useState(false);

  // Intersection Observer hook
  const { ref, inView } = useInView({ threshold: 0, triggerOnce: false });

  // Fetch more when the sentinel comes into view
  useEffect(() => {
    if (inView && pageInfo.hasNextPage && !loading) {
      setLoading(true);
      fetchMorePosts(slug, pageInfo.endCursor)
        .then((data) => {
          setPosts((prev) => [...prev, ...data.posts]);
          setPageInfo(data.pageInfo);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [inView, pageInfo.hasNextPage, pageInfo.endCursor, slug, loading]);

  return (
    <>
      <ul
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        // keep below-the-fold cheap
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ contentVisibility: "auto", containIntrinsicSize: "1px 800px" as any }}
      >
        {posts.map((post: Post, idx: number) => {
          const imgSrc = post.featuredImage?.node?.sourceUrl || "./full_logo_with_slogan.png";
          const imgAlt = post.featuredImage?.node?.altText || post.title || "Post image";

          // First card can be LCP if above fold
          const isLCP = idx === 0;

          return (
            <li
              key={post.id}
              className="rounded-sm cursor-pointer hover:shadow-none transition flex flex-col overflow-hidden group"
            >
              <Link href={`/${post.slug}`} className="block overflow-hidden" prefetch={false}>
                {/* Match category’s 2:1 aspect ratio (600/300) */}
                <div className="relative w-full aspect-[600/300]">
                  <Image
                    src={imgSrc}
                    alt={imgAlt}
                    fill
                    // Slightly generous sizes for crispness on retina
                    sizes="(max-width: 640px) 100vw,
                           (max-width: 1024px) 60vw,
                           70vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-200 bg-[#f5f5f5]"
                    quality={85}
                    priority={isLCP}
                    fetchPriority={isLCP ? "high" : "auto"}
                    loading={isLCP ? "eager" : "lazy"}
                    placeholder="blur"
                    // prefer per-image blur, fallback to favicon
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    blurDataURL={(post as any)?.featuredImage?.node?.blurDataURL || "./full_logo_with_slogan.png"}
                  />
                </div>
              </Link>

              <div className="pt-4 flex flex-col flex-1">
                {/* Title + Date row */}
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/${post.slug}`}
                    className="font-bold text-lg hover:underline line-clamp-1"
                    prefetch={false}
                  >
                    {post.title}
                  </Link>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>

                {/* Excerpt */}
                <div className="prose prose-sm text-gray-700 mt-2 flex-1">
                  {getFirstWords(post.excerpt ?? "", 15)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {pageInfo.hasNextPage && (
        <div ref={ref} className="h-10 flex items-center justify-center">
          {loading ? (
            <span className="text-gray-400">Loading more...</span>
          ) : (
            <span className="text-gray-300">Scroll to load more...</span>
          )}
        </div>
      )}
    </>
  );
}
