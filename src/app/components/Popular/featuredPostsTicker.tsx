'use client';

import React from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import type { Item } from '../PopularNewsTicker';

export default function PopularNewsSequenceClient({
  items,
  intervalMs = 4000, // updated default interval to 4000ms
  className = '',
}: {
  items: Item[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => clearTimeout(t);
  }, [index, paused, items.length, intervalMs]);

  const onPause = () => setPaused(true);
  const onResume = () => setPaused(false);

  const current = items[index];

  return (
    <div
      className={`group relative w-full overflow-hidden border-0 ${className}`}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onFocusCapture={onPause}
      onBlurCapture={onResume}
      role="region"
      aria-label="Trendig inlägg just nu"
    >
      {/* Row: badge + animated post */}
      <div className="flex h-12 items-center gap-3 border-0">
        <span className="text-sm font-bold text-[#1b3d32] shrink-0">
          Trendig inlägg just nu
        </span>

        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            <PostSlide
              key={current?.id ?? index}
              post={current}
              reduced={prefersReducedMotion}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PostSlide({
  post,
  reduced,
}: {
  post: Item;
  reduced: boolean;
}) {
  const variants: Variants = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        // enter from right, leave to left
        initial: { opacity: 0, x: 24, filter: 'blur(3px)' },
        animate: {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        },
        exit: {
          opacity: 0,
          x: -24,
          filter: 'blur(3px)',
          transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
        },
      };

  const pulseProps = reduced
    ? {}
    : {
        animate: { scale: [1, 1.02, 1], opacity: [1, 0.98, 1] },
        transition: { duration: 2, ease: 'easeInOut' as const }, // 2s pulse
      };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="absolute inset-0 flex items-center border-0"
    >
      <motion.div
        {...pulseProps}
        className="flex min-w-0 items-center gap-3"
        aria-live="polite"
        aria-atomic="true"
      >

        <Link
          href={post.slug?.startsWith('/') ? post.slug : `/${post.slug}`}
          className="block w-full truncate text-sm md:text-base font-medium leading-6 hover:underline focus:outline-none focus:ring-0"
          prefetch={false}
        >
          {post.title}
        </Link>
      </motion.div>
    </motion.div>
  );
}
