import Image from 'next/image';
import { Ad } from './adsContent';

function getExcerpt(text?: string, words = 10) {
  if (!text) return '';
  const arr = text.split(/\s+/);
  return arr.length > words ? arr.slice(0, words).join(' ') + '…' : text;
}

function extractHrefFromScript(script?: string): string | null {
  if (!script) return null;
  const m = script.match(/<a\s[^>]*href=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

type ParsedImg = { src: string; width?: number; height?: number; alt?: string };

function extractImgFromScript(script?: string): ParsedImg | null {
  if (!script) return null;
  const imgMatch = script.match(/<img[^>]*>/i);
  if (!imgMatch) return null;

  const tag = imgMatch[0];
  const src = tag.match(/src=["']([^"']+)["']/i)?.[1];
  if (!src) return null;

  const widthStr = tag.match(/width=["'](\d+)["']/i)?.[1];
  const heightStr = tag.match(/height=["'](\d+)["']/i)?.[1];
  const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1];

  const width = widthStr ? parseInt(widthStr, 10) : undefined;
  const height = heightStr ? parseInt(heightStr, 10) : undefined;

  return { src, width, height, alt };
}

export function AdCard({ ad }: { ad: Ad }) {
  const href = extractHrefFromScript(ad.script);
  const parsedImg = extractImgFromScript(ad.script);

  const CardInner = (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Banner — only the image scales on hover */}
      <div className="relative w-full h-[180px] overflow-hidden">
        {parsedImg ? (
          <div className="relative w-full h-full transition-transform duration-200 ease-in-out hover:scale-105">
            <Image
              src={parsedImg.src}
              alt={parsedImg.alt ?? ad.title ?? 'Sponsored banner'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              unoptimized={true}
            />
          </div>
        ) : (
          // Fallback: if parsing fails, render the raw script content
          <div
            className="flex-1 w-full h-full flex items-center justify-center overflow-hidden"
            dangerouslySetInnerHTML={{ __html: ad.script ?? '' }}
          />
        )}
      </div>

      {/* Content — matches PostCard styles */}
      <div className="p-0">
        <span className="inline-block text-xl text-[11px] font-semibold uppercase tracking-wide text-[#990000]">
          Sponsored
        </span>

        {ad.title && (
          <p className="font-semibold text-lg text-gray-800 leading-snug">
            {ad.title}
          </p>
        )}

        {ad.text && (
          <p className="text-base text-gray-800 leading-snug break-words">
            {getExcerpt(ad.text, 10)}
          </p>
        )}
      </div>
    </div>
  );

  // Wrap the entire card in an <a> when we have a URL
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="block w-full h-full"
    >
      {CardInner}
    </a>
  ) : (
    CardInner
  );
}
