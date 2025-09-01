'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import { AdCard } from '@/app/components/ads/adcard';

type Ad = ComponentProps<typeof AdCard>['ad'];

type AdRotatorProps = {
  ads: readonly Ad[];
  intervalMs?: number;   // default 15000
  initialIndex?: number; // passed from server to avoid hydration mismatch
};

export default function AdRotator({
  ads,
  intervalMs = 15000,
  initialIndex = 0,
}: AdRotatorProps) {
  const len = ads?.length ?? 0;
  const safeStart = len > 0 ? initialIndex % len : 0;

  const [index, setIndex] = useState(safeStart);

  useEffect(() => {
    if (len < 1) return; // skip timer if 0 or 1 ad

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, intervalMs);

    return () => clearInterval(id);
  }, [len, intervalMs]);

  if (len === 0) return null;

  return <AdCard ad={ads[index]} />;
}
