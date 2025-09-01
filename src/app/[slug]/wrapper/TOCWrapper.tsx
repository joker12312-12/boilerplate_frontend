"use client"

import { ITOCItem } from '@/lib/types';
import dynamic from 'next/dynamic';

const TocCard = dynamic(() =>
  import("../_components/TocCard").then((mod) => mod.TocCard)
);



export function PostTOC({ toc }: { toc: ITOCItem[] }) {
  return (
    <div className="hidden lg:block">
      <TocCard toc={toc} />
    </div>
  );
}
