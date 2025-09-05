import { MediaItemNode } from '@/lib/types';
import Image from 'next/image';

export interface ViewPost {
  id: string;
  title: string;
  slug: string;
  featuredImage?: { node: MediaItemNode };
  date: string;
  excerpt?: string;
  category?: string;
}

export interface PostCardProps {
  post: ViewPost & {
    categories?: string[] | { nodes?: Array<{ name?: string }> } | string;
  };
  className?: string;
  variant?: 'default' | 'hero';
}

const FALLBACK_IMAGE = "/full_logo_with_slogan.png";

function getExcerpt(text?: string, words = 10) {
  if (!text) return '';
  const withoutTags = text
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&(amp|quot|#39|apos|lt|gt);/g, (m) =>
      ({
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
        '&lt;': '<',
        '&gt;': '>'
      } as Record<string, string>)[m] ?? m
    )
    .replace(/\s+/g, ' ')
    .trim();

  const arr = withoutTags.split(/\s+/);
  return arr.length > words ? arr.slice(0, words).join(' ') + '…' : withoutTags;
}

function getFirstCategory(post: PostCardProps['post']): string | undefined {
  if (typeof post.category === 'string' && post.category.trim()) {
    return post.category.trim();
  }
  const cats = post.categories as unknown;

  if (Array.isArray(cats)) {
    const first = cats.find((c) => typeof c === 'string' && c.trim());
    return first?.trim();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (cats && typeof cats === 'object' && 'nodes' in (cats as any)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes = (cats as any).nodes as Array<{ name?: string }>;
    const first = nodes?.find((n) => typeof n?.name === 'string' && n.name.trim())?.name;
    return first?.trim();
  }

  if (typeof cats === 'string' && cats.trim()) {
    return cats.trim();
  }

  return undefined;
}

export default function PostCard({ post, className = '', variant = 'default' }: PostCardProps) {
  const featuredImageUrl = post.featuredImage?.node?.sourceUrl || FALLBACK_IMAGE;
  const firstCategory = getFirstCategory(post);

  // HERO VARIANT
  if (variant === 'hero') {
    return (
      <div
        className={`relative w-full overflow-hidden group ${className || 'h-[520px] xl:h-[500px]'}`}
      >
        {/* Image with fallback */}
        <div className="absolute inset-0">
          <Image
            src={featuredImageUrl}
            alt={post.title || 'Post image'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1920px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>

        {/* Gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

        {/* Overlayed text */}
        <div className="absolute left-6 right-6 bottom-16">
          {firstCategory && (
            <span className="inline-block mb-3 text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded bg-white/90 text-gray-900">
              {firstCategory}
            </span>
          )}
          <p className="font-extrabold text-white text-3xl md:text-4xl leading-tight line-clamp-2">
            {post.title}
          </p>
          {post.excerpt && (
            <span className="mt-3 text-white/90 text-sm md:text-base leading-snug line-clamp-2 block">
              {getExcerpt(post.excerpt, 22)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // DEFAULT VARIANT
  return (
    <div className={`flex flex-col w-full overflow-hidden ${className}`}>
      {/* Image with fallback */}
      <div className="relative w-full h-[150px] overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105">
        <Image
          src={featuredImageUrl}
          alt={post.title || 'Post image'}
          fill
          sizes="(max-width: 640px) 100vw,
                 (max-width: 1024px) 50vw,
                 33vw"
          className="w-full h-full"
          priority
        />
      </div>

      {/* Content */}
      <div className="pt-0">
        {firstCategory && (
          <span className="inline-block text-xl text-[11px] font-semibold uppercase tracking-wide text-[#990000]">
            {firstCategory}
          </span>
        )}
        <p className="font-semibold text-lg text-gray-800 leading-snug">
          {post.title}
        </p>
        {post.excerpt && (
          <span className="text-base text-gray-800 leading-snug break-words block">
            {getExcerpt(post.excerpt, 10)}
          </span>
        )}
      </div>
    </div>
  );
}
