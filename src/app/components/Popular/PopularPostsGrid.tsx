import Link from 'next/link';
import { Post } from '@/lib/types';
import PostCard from './PopularPostsCard';
import PopularNewsSequenceClient from './featuredPostsTicker';
import TodayPostsSidebar from '../TodayPostsSidebar';

type PostItem = Post & { type?: 'post' };
type FeedItem = PostItem;

export default function PopularNews({
  items = [],
  tickerItems = [],
  tagline = '',
}: {
  items: FeedItem[];
  tickerItems?: {
    id: string;
    slug: string;
    title: string;
    date?: string;
    author_name?: string;
    featuredImage?: string | { node?: { sourceUrl?: string } };
  }[];
  tagline?: string;
}) {
  if (!items.length) return <div className="py-8 text-center">Inga populära inlägg hittades.</div>;

  // Vänster kolumn får 4 inlägg; mitten (hero) får 2
  const leftCol = items.slice(0, 4);
  const midCol = items.slice(4, 6);

  return (
    <section className="w-[100%] lg:w-[90%] xl:w-[70%] px-2 mx-auto py-8">

      {tagline ? (
        <h1 className="mt-1 text-sm text-gray-500 block mb-4">{tagline}</h1>
      ) : (
        <div className="h-4 w-40 rounded bg-gray-200/70 animate-pulse mb-4" />
      )}

      {tickerItems?.length ? (
        <div className="mb-6">
          <PopularNewsSequenceClient items={tickerItems} />
        </div>
      ) : null}

      {/* Horisontell avgränsare */}
      <hr className="my-6 border-gray-200" />

      {/* MOBILE FIRST: visa MITTEN (hero), sedan VÄNSTER kompakt grid och sidofält */}
      <div className="lg:hidden space-y-6">
        {/* Mittens hero-inlägg först */}
        <div className="flex flex-col gap-6">
          {midCol.map((item) => (
            <Link href={`/${item.slug}`} key={item.id} prefetch={false}>
              <PostCard
                post={item}
                variant="hero"
                className="h-[420px]" 
              />
            </Link>
          ))}
        </div>

        {/* Avgränsare */}
        <hr className="my-4 border-gray-300" />

        {/* Vänstra inlägg efter hero — mindre bilder, 2-kolumners grid */}
        <div className="grid grid-cols-2 gap-4">
          {leftCol.map((item) => (
            <Link href={`/${item.slug}`} key={item.id} prefetch={false}>
              <PostCard
                post={item}
                className="h-full" 
              />
            </Link>
          ))}
        </div>

        {/* Avgränsare före sidofältet */}
        <hr className="my-4 border-gray-300" />

        {/* HÖGER kolumn (sidofält) — nu också synlig på mobil */}
        <aside>
          <TodayPostsSidebar />
        </aside>
      </div>

      {/* DESKTOP: layout med 3 kolumner */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 mt-8">
        {/* VÄNSTER kolumn (4 mindre staplade inlägg) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 border-r border-gray-200 pr-4">
          {leftCol.map((item) => (
            <Link href={`/${item.slug}`} key={item.id} prefetch={false}>
              <PostCard post={item} />
            </Link>
          ))}
        </div>

        {/* MITTERSTA kolumn (2 hero-kort) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6 px-4">
          {midCol.map((item) => (
            <Link href={`/${item.slug}`} key={item.id} prefetch={false}>
              <PostCard
                post={item}
                variant="hero"
                className="h-[460px] xl:h-[500px]"
              />
            </Link>
          ))}
        </div>

        {/* HÖGER kolumn (sidofält) */}
        <aside className="col-span-12 lg:col-span-3 border-l border-gray-200 pl-4">
          <TodayPostsSidebar />
        </aside>
      </div>
    </section>
  );
}
