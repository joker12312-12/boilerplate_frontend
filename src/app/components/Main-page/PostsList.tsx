'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { stripHtml } from '@/lib/helper_functions/strip_html';
import { Sidebar } from './SideBar';
import { Button } from '@/components/ui/button';
import TradingViewWidget from '../tickers/uppcomingEventsTicker';

export default function PostsList({posts}) {
  const { searchBarHeader } = useAppContext();
  const term = searchBarHeader.trim().toLowerCase();
  
  const filtered = term
    ? posts.filter((p) => p.title.toLowerCase().includes(term))
    : posts;

  const [visibleCount, setVisibleCount] = useState(8);
  const items = filtered.slice(0, visibleCount);

  const limitWords = (text: string, maxWords: number) => {
    const words = text.split(/\s+/);
    return words.length > maxWords
      ? words.slice(0, maxWords).join(' ') + '…'
      : text;
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto w/full xl:w-[70%] px-2 sm:px-4 md:px-6">
        <p className="text-center text-gray-500 text-sm">Inga inlägg hittades</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--secBG)]">
      <div className="mx-auto w-full px-2 lg:w-[90%] xl:w-[70%] sm:px-4">
        {/* 1 col on mobile; 70/30 split on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 py-4">
          {/* Main feed (≈70%) */}
          <main>
            <h2 className="text-xl sm:px-2 font-bold mb-3">Senaste nyheterna</h2>

            {/* Separator below heading */}
            <hr className="border-gray-200 mb-4" />

            {/* Grid */}
            <ul
              className={[
                'grid grid-cols-1 sm:grid-cols-2',
                // Outer borders
                'border-x border-gray-200',
                // Mobile: simple horizontal dividers
                'divide-y divide-gray-200 sm:divide-y-0',
              ].join(' ')}
            >
              {items.map((post, index) => {
                const rawExcerpt = stripHtml(post.excerpt!) || '';
                const limitedExcerpt = limitWords(rawExcerpt, 15);
                const isOdd = index % 2 === 0;

                return (
                  <li
                    key={post.id}
                    className={[
                      'group flex flex-col p-3 hover:cursor-pointer relative',
                      // On sm+, add spacing so content doesn't stick to dividers
                      'sm:[&:nth-child(odd)]:pr-4 sm:[&:nth-child(even)]:pl-4',
                    ].join(' ')}
                  >
                    {/* Vertical separator ONLY between columns */}
                    {isOdd && (
                      <span className="hidden sm:block absolute top-4 right-0 w-px h-[85%] bg-gray-200" />
                    )}

                    {/* Featured image */}
                    {post.featuredImage?.node?.sourceUrl && (
                      <Link href={`/${post.slug}`} className="block" prefetch={false}>
                        <div className="relative w-full aspect-[2/1] overflow-hidden">
                          <Image
                            src={post.featuredImage.node.sourceUrl}
                            alt={post.featuredImage.node.altText || post.title}
                            fill
                            className="object-cover transform-gpu transition-transform duration-300 ease-out md:group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                            priority={index < 2}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        </div>
                      </Link>
                    )}

                  {/* Category */}
                  {post.categories?.nodes?.[0] && (
                    <p className="text-xs font-medium text-[#990000] mt-2">
                      {post.categories.nodes[0].name}
                    </p>
                  )}

                   {/* Title */}
                  <h3 className="text-base lg:text-lg font-semibold leading-snug mb-1">
                    {post.title}
                  </h3>


                    {/* Excerpt */}
                    <p className="text-gray-700 text-xs leading-relaxed">
                      {limitedExcerpt}
                    </p>
                  </li>
                );
              })}
            </ul>

            {/* Load more button */}
            {visibleCount < filtered.length && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="px-4 py-2 bg-blue-600 text-black text-sm font-medium rounded hover:bg-blue-700 transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ladda mer
                </Button>
              </div>
            )}
          </main>

          {/* Aside (≈30%) */}
          <aside className="lg:pt-12 mt-12 self-start text-sm rounded-sm">
            {/* Mobile separator above sidebar */}
            <div className="border-t border-gray-200 mb-4 lg:hidden" />

            <TradingViewWidget
              title="Kommande händelser"
              heights={{ base: 360, sm: 420, md: 500, lg: 560 }}
              className="rounded-md overflow-hidden border"
            />
            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}