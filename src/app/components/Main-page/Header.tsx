'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import DesktopNav from '../Header-navigation/DesktopNav';
import MobileNav from '../Header-navigation/MobileNav';
import { SearchResult } from '../Header-navigation/hooks/useSearchBar';
import SearchBarInline from '../Header-navigation/SearchBarInline';
import PopupModal from '../client/newsletter/Rule_sub';
import { DEFAULT_LINKS } from '../client/constants/links';
import { Post } from '@/lib/types';

type Category = { id: string; name: string; slug: string };

type HeaderProps = {
  posts: Post[],
  initialCategories?: Category[];
};

export default function Header({ initialCategories = [], posts }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const categories = initialCategories;

  const handleOpenNewsletter = useCallback(() => setIsModalOpen(true), []);
  const handleCloseNewsletter = useCallback(() => setIsModalOpen(false), []);

  const searchFn = useCallback(
    async (q: string, opts?: { signal?: AbortSignal }): Promise<SearchResult[]> => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        cache: 'no-store',
        signal: opts?.signal,
      });
      if (!res.ok) return [];
      return (await res.json()) as SearchResult[];
    },
    []
  );

  return (
    <>
      {/* Outer layer: full-width background & border */}
      <header className="sticky top-0 z-50 w-full border-b bg-[#F3F8F7/80] backdrop-blur-md">

        {/* Inner container: truly 70% on lg, and the only place with horizontal padding */}
        <div className="mx-auto w-full lg:w-[90%] xl:w-[70%] px-2 sm:px-4 md:px-6">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-0">
            {/* Left: Logo */}
            <div className="flex items-center min-h-[40px]">
              <Link href="/" aria-label="Gå till startsidan" className="flex-shrink-0"> 
                <div className="relative w-[100px] h-auto">
              <Image
              src="/full_logo_with_slogan.png"
              alt="Logotyp"
              width={100}
              height={60}
              className="!w-[100px] !h-[60px] object-contain"
              priority
            />
              </div>
              </Link>
            </div>

            {/* Center: Sök (desktop) */}
            <div className="hidden [@media(min-width:1100px)]:flex justify-center">
              <SearchBarInline
                value={searchValue}
                onChange={setSearchValue}
                posts={posts}
                searchFn={searchFn}
                className="w-full max-w-xl"
              />
            </div>

            {/* Right: Nav */}
            <div className="flex items-center gap-2 min-h-[40px] justify-end">
              <div className="hidden [@media(min-width:1100px)]:flex">
                <DesktopNav links={DEFAULT_LINKS} onNewsletterClick={handleOpenNewsletter} categories={categories} />
              </div>
              <div className="[@media(min-width:1100px)]:hidden flex items-center gap-1">
                <MobileNav links={DEFAULT_LINKS} onNewsletterClick={handleOpenNewsletter} categories={categories} />
              </div>
            </div>

            {/* Mobile: full-width search row */}
            <div className="col-span-3 [@media(min-width:1100px)]:hidden">
              <SearchBarInline
                value={searchValue}
                onChange={setSearchValue}
                posts={posts}
                searchFn={searchFn}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </header>

      <PopupModal isOpen={isModalOpen} onClose={handleCloseNewsletter} />
    </>
  );
}