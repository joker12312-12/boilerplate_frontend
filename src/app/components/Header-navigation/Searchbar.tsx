'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerOverlay,
  DrawerClose,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Search from '../icons/search';
import clsx from 'clsx';
import { Post } from '@/lib/types';

interface SearchDrawerProps {
  posts: Post[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 'icon' = small icon button (mobile), 'input' = full-width fake input (desktop) */
  variant?: 'icon' | 'input';
  /** Optional classes for the trigger wrapper (useful for width/position) */
  triggerClassName?: string;
}

const PAGE_SIZE = 20;

export default function SearchDrawer({
  posts,
  value,
  onChange,
  variant = 'icon',
  triggerClassName,
}: SearchDrawerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);


  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce controlled input
  useEffect(() => {
    if (!mounted) return;
    if (value === '') {
      setDebouncedSearchValue('');
      setLoading(false);
      setVisibleCount(PAGE_SIZE);
      return;
    }
    setLoading(true);
    const handler = setTimeout(() => {
      setDebouncedSearchValue(value);
      setLoading(false);
      setVisibleCount(PAGE_SIZE);
    }, 300); // snappier debounce
    return () => clearTimeout(handler);
  }, [value, mounted]);

  const filteredPosts = useMemo(() => {
    if (!debouncedSearchValue) return [];
    const q = debouncedSearchValue.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt?.toLowerCase().includes(q),
    );
  }, [debouncedSearchValue, posts]);

  const visiblePosts = useMemo(
    () => filteredPosts.slice(0, visibleCount),
    [filteredPosts, visibleCount],
  );

  if (!mounted) return null;

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      {/* TRIGGER */}
      <div className={clsx(triggerClassName)}>
        <DrawerTrigger asChild>
          {variant === 'icon' ? (
            <Button variant="ghost" className="text-gray-500 hover:text-black">
              <Search className="h-5 w-5" />
            </Button>
          ) : (
            // Fake input trigger (full-width button styled like an input)
            <button
              type="button"
              className="w-full rounded-full border border-neutral-300 bg-white/80 px-4 py-2 text-left text-gray-500 backdrop-blur-md hover:border-neutral-400 hover:bg-white/90 focus:outline-none"
            >
              <span className="inline-flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span>Sök…</span>
              </span>
            </button>
          )}
        </DrawerTrigger>
      </div>

      {/* OVERLAY + CONTENT */}
      <DrawerOverlay className="fixed inset-0 bg-black/30 z-40" />
      <DrawerContent
        className="
          fixed top-0 right-0 h-full w-full bg-white z-[999] shadow-lg flex flex-col
          data-[vaul-drawer-direction=right]:inset-y-0
          data-[vaul-drawer-direction=right]:right-0
          data-[vaul-drawer-direction=right]:border-l
        "
      >
        <DrawerTitle className="sr-only">Sök</DrawerTitle>

        {/* Header */}
        <div className="flex items-center text-lg mt-5 justify-between border-b p-4">
          <DrawerClose asChild>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              X
            </Button>
          </DrawerClose>
        </div>

        {/* Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              autoFocus
              placeholder="Sök..."
              aria-label="Sök"
              value={value}
              onChange={onChange}
              className="pl-10 bg-transparent w-full"
            />
          </div>
        </div>

        {/* Results — compact text list (no images) */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <svg className="animate-spin h-6 w-6 text-gray-500 mb-2" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" opacity="0.75" />
              </svg>
              <span className="text-sm text-gray-500">Laddar...</span>
            </div>
          ) : !debouncedSearchValue ? (
            <p className="px-3 py-3 text-sm text-gray-500">Börja skriva för att se resultat.</p>
          ) : filteredPosts.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-500">Inga resultat hittades.</p>
          ) : (
            <>
              <ul className="divide-y">
                {visiblePosts.map((post) => (
                  <li key={post.slug} className="first:pt-1">
                    <Link
                      href={`/${post.slug}`}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 rounded-md hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none"
                    >
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {post.title}
                      </div>
                      {post.excerpt && (
                        <div className="text-xs text-neutral-600 line-clamp-2">
                          {post.excerpt.replace(/<[^>]+>/g, '')}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              {visibleCount < filteredPosts.length && (
                <div className="flex justify-center p-3">
                  <Button size="sm" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                    Ladda mer
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}