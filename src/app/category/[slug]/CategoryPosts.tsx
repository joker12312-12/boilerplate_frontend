"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { Post } from "@/lib/types";

interface CategoryPostsProps {
  slug: string;
  initialPosts: Post[];
  initialPageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}

async function fetchMorePosts(slug: string, after: string) {
  const res = await fetch(`/category?slug=${encodeURIComponent(slug)}&after=${encodeURIComponent(after)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to load more posts");
  return res.json() as Promise<{
    posts: Post[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  }>;
}

function getFirstWords(html: string, wordCount: number) {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(Boolean).slice(0, wordCount);
  return words.join(" ") + (words.length === wordCount ? "…" : "");
}

export default function CategoryPosts({ slug, initialPosts, initialPageInfo }: CategoryPostsProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [loading, setLoading] = useState(false);

  const { ref, inView } = useInView({ threshold: 0, triggerOnce: false });

  useEffect(() => {
    if (inView && pageInfo.hasNextPage && !loading) {
      setLoading(true);
      fetchMorePosts(slug, pageInfo.endCursor)
        .then((data) => {
          setPosts((prev) => [...prev, ...data.posts]);
          setPageInfo(data.pageInfo);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [inView, pageInfo.hasNextPage, pageInfo.endCursor, slug, loading]);

  return (
    <>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={{ contentVisibility: "auto", containIntrinsicSize: "1px 800px" as any }}
      >
        {posts.map((post: Post, idx) => {
          const imgSrc = post.featuredImage?.node?.sourceUrl || "./full_logo_with_slogan.png";
          const imgAlt = post.featuredImage?.node?.altText || post.title || "Post image";

          // First image gets LCP optimization
          const isLCP = idx === 0;

          return (
            <li
              key={post.id}
              className="rounded-sm cursor-pointer hover:shadow-none transition flex flex-col overflow-hidden group"
            >
              <Link prefetch={false} href={`/${post.slug}`} className="block overflow-hidden">
                {/* Match old aspect ratio: 600/300 = 2:1 */}
                <div className="relative w-full aspect-[600/300]">
                  <Image
                    src={imgSrc}
                    alt={imgAlt}
                    fill
                    sizes="(max-width: 640px) 100vw,
                           (max-width: 1024px) 60vw,
                           70vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-200 bg-[#f5f5f5]"
                    quality={100}
                    priority={isLCP}
                    fetchPriority={isLCP ? "high" : "auto"}
                    loading={isLCP ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL={
                      // Prefer a per-image blur if available, fallback to favicon
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (post as any)?.featuredImage?.node?.blurDataURL || "./full_logo_with_slogan.png"
                    }
                  />
                </div>
              </Link>

              <div className="pt-4 flex flex-col flex-1">
                {/* Title + Date row */}
                <div className="flex items-center justify-between gap-2">
                  <Link
                   prefetch={false}
                    href={`/${post.slug}`}
                    className="font-bold text-lg hover:underline line-clamp-1"
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
