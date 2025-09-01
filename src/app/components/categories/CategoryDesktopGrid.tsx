import Image from 'next/image';
import { Post } from '@/lib/types';
import Link from 'next/link';

interface Props {
  posts: Post[];
}

// Helpers
const stripHtml = (html = '') => html.replace(/<[^>]+>/g, '');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCategory = (post: any): string | undefined =>
  post?.category ??
  post?.categories?.nodes?.[0]?.name ??
  (Array.isArray(post?.categories) ? post.categories[0] : undefined);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function CategoryDesktopGrid({ posts }: Props) {
  if (!posts || posts.length === 0) return null;

  const top = posts.slice(0, 4); // first row (4 cards)
  const feature = posts.slice(4, 6); // second row (2 feature cards)

  return (
    <div className="hidden lg:block">
      {/* Top divider */}
      <div className="border-t border-gray-200" />

      {/* Row 1: 4-up cards with vertical separators */}
      <div className="grid grid-cols-4 gap-10 py-8">
        {top.map((post, index) => {
          const img = post.featuredImage?.node?.sourceUrl;
          const alt = post.featuredImage?.node?.altText || post.title;
          const cat = getCategory(post);

          return (
            <div
              key={post.id}
              className={`group block ${index < top.length - 1 ? 'border-r border-gray-200 pr-6' : ''}`}
            >
              <Link href={`/${post.slug}`}>
                {img && (
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                      src={img}
                      alt={alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="mt-3">
                  {cat && (
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      {cat}
                    </span>
                  )}
                  <h3 className="mt-1 text-[20px] leading-snug font-semibold text-gray-900 group-hover:underline line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-gray-600 leading-snug line-clamp-2">
                      {stripHtml(post.excerpt)}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Middle divider */}
      <div className="border-t border-gray-200" />

      {/* Row 2: 2 feature media cards with separator */}
      <div className="grid grid-cols-2 gap-12 py-8">
        {feature.map((post, index) => {
          const img = post.featuredImage?.node?.sourceUrl;
          const alt = post.featuredImage?.node?.altText || post.title;
          const cat = getCategory(post);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const author = (post as any)?.author_name || (post as any)?.author?.node?.name;
          const date = formatDate(post.date);

          return (
            <div
              key={post.id}
              className={`group grid grid-cols-5 gap-6 items-center ${index === 0 ? 'border-r border-gray-200 pr-8' : ''}`}
            >
              <Link href={`/${post.slug}`} className="contents">
                {/* Image left */}
                <div className="relative col-span-2 aspect-[16/10] overflow-hidden">
                  {img && (
                    <Image
                      src={img}
                      alt={alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>

                {/* Text right */}
                <div className="col-span-3">
                  {cat && (
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      {cat}
                    </span>
                  )}
                  <h3 className="mt-2 text-[28px] leading-tight font-semibold text-gray-900 group-hover:underline line-clamp-3">
                    {post.title}
                  </h3>

                  {/* optional excerpt */}
                  {post.excerpt && (
                    <p className="mt-3 text-sm text-gray-600 leading-snug line-clamp-2">
                      {stripHtml(post.excerpt)}
                    </p>
                  )}

                  {/* meta row */}
                  {(author || date) && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      {author && <span className="font-medium">{author}</span>}
                      {author && date && <span className="mx-1">•</span>}
                      {date && <time dateTime={post.date}>{date}</time>}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Bottom divider */}
      <div className="border-t border-gray-200" />
    </div>
  );
}
