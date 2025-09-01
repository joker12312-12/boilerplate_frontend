'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Will only load on the client when actually rendered
const TradingViewTickerTape = dynamic(() => import('./tradingViewTicker'), {
  ssr: false,
});

type Props = {
  preloadOffset?: string;
  height: number;
  className?: string;
};

export default function TickerTapeVisible({
  preloadOffset = '200px',
  height = 40,
  className,
}: Props) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) return; // already loaded
    const el = ref.current;

    // Fallback: load immediately if IO isn't available
    if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
      setShow(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: preloadOffset }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [show, preloadOffset]);

  return (
    <div ref={ref} className={className} style={{ minHeight: height }}>
      {show ? (
        <TradingViewTickerTape />
      ) : (
        <div
          className="w-full rounded-md bg-gray-200/70 animate-pulse"
          style={{ height }}
        />
      )}
    </div>
  );
}
