// lib/seo-helpers.ts
import type { Metadata } from 'next';
import { getSeo, buildMetadataFromSeo } from '@/lib/seo/seo';

const ensureLeadingTrailingSlash = (p: string) => {
  const s = p.startsWith('/') ? p : `/${p}`;
  return s.endsWith('/') ? s : `${s}/`;
};

type Kind = 'home' | 'post' | 'tag' | 'category' | 'author' | 'auto';

function candidateUris(slugOrPath: string, kind: Kind): string[] {
  // Allow hierarchical slugs like "parent/child"
  const s = slugOrPath.replace(/^\/+|\/+$/g, '');

  switch (kind) {
    case 'home':
      return ['/'];

    case 'post':
      // If you use date-based permalinks, adapt this to also try /yyyy/mm/slug/
      return [ensureLeadingTrailingSlash(s)];

    case 'tag':
      return [ensureLeadingTrailingSlash(`tag/${s}`), ensureLeadingTrailingSlash(s)];

    case 'category':
      return [ensureLeadingTrailingSlash(`category/${s}`), ensureLeadingTrailingSlash(s)];

    case 'author':
      return [ensureLeadingTrailingSlash(`author/${s}`), ensureLeadingTrailingSlash(s)];

    case 'auto':
    default:
      return [
        ensureLeadingTrailingSlash(`category/${s}`),
        ensureLeadingTrailingSlash(`tag/${s}`),
        ensureLeadingTrailingSlash(`author/${s}`),
        ensureLeadingTrailingSlash(s),
        '/',
      ];
  }
}

/**
 * Try multiple candidate URIs and return the first successful metadata.
 * `slug` can be a plain slug (e.g. "markets") or a hierarchical path ("parent/child").
 */
export async function getBestSeoBySlug(
  slug: string,
  kind: Kind,
  opts?: { metadataBase?: string; siteName?: string; defaultOgImage?: string; debug?: boolean }
): Promise<{ meta: Metadata; resolvedUri: string; found: boolean }> {
  const base = process.env.NEXT_PUBLIC_HOST_URL!;
  const candidates = candidateUris(slug, kind);

  for (const uri of candidates) {
    try {
      if (opts?.debug && process.env.NODE_ENV !== 'production') {
        console.log('[seo-helper] try', uri);
      }
      const payload = await getSeo(uri);
      if (payload?.nodeByUri) {
        // Build metadata from Rank Math / WPGraphQL
        let meta = buildMetadataFromSeo(payload, {
          metadataBase: opts?.metadataBase ?? base,
          siteName: opts?.siteName ?? process.env.NEXT_PUBLIC_HOSTNAME,
          defaultOgImage: opts?.defaultOgImage ?? process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE,
        });

        // Normalize OG type for special kinds
        if (kind === 'home') {
          meta = {
            ...meta,
            openGraph: { ...(meta.openGraph || {}), type: 'website' },
          };
        } else if (kind === 'category' || kind === 'tag') {
          meta = {
            ...meta,
            openGraph: { ...(meta.openGraph || {}), type: 'website' },
          };
        }

        // Prefer the WP-resolved URI if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resolved = (payload.nodeByUri as any)?.uri || uri;
        return { meta, resolvedUri: resolved, found: true };
      }
    } catch (err) {
      if (opts?.debug && process.env.NODE_ENV !== 'production') {
        console.warn('[seo-helper] candidate failed', uri, err);
      }
      // continue with next candidate
    }
  }

  // Fallback: last candidate as canonical with noindex
  const last = candidates[candidates.length - 1] || '/';
  const canonical = new URL(last.replace(/^\//, ''), base).toString();
  const site = process.env.NEXT_PUBLIC_HOSTNAME ?? '';
  return {
    meta: {
      title: `Not found - ${site}`,
      description: 'Sorry, this page was not found.',
      alternates: { canonical },
      robots: { index: false, follow: false },
      openGraph: {
        title: `Not found - ${site}`,
        description: 'Sorry, this page was not found.',
        url: canonical,
        images: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE
          ? [{ url: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE }]
          : undefined,
        type: 'website',
      },
      twitter: {
        card: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ? 'summary_large_image' : 'summary',
        title: `Not found - ${site}`,
        description: 'Sorry, this page was not found.',
        images: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE
          ? [process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE]
          : undefined,
      },
    },
    resolvedUri: last,
    found: false,
  };
}

/**
 * Resolve SEO by a full pathname (e.g. "/", "/category/markets/", "/author/jane-doe/").
 * Useful when you already know the route path and just want metadata.
 */
export async function getBestSeoByPath(
  pathname: string,
  opts?: { metadataBase?: string; siteName?: string; defaultOgImage?: string; debug?: boolean }
): Promise<{ meta: Metadata; resolvedUri: string; found: boolean }> {
  const clean = ensureLeadingTrailingSlash(pathname || '/');

  // Infer kind from path for better OG-type defaults
  let kind: Kind = 'auto';
  if (clean === '/') kind = 'home';
  else if (/^\/category\//i.test(clean)) kind = 'category';
  else if (/^\/tag\//i.test(clean)) kind = 'tag';
  else if (/^\/author\//i.test(clean)) kind = 'author';
  else kind = 'post';

  // Reuse slug portion after the base for candidate generation
  const slug = clean.replace(/^\/(category|tag|author)\//i, '').replace(/^\/|\/$/g, '');
  return getBestSeoBySlug(kind === 'home' ? '' : slug, kind, opts);
}

/**
 * Convenience for homepage metadata.
 */
export async function getHomeSeo(
  opts?: { metadataBase?: string; siteName?: string; defaultOgImage?: string; debug?: boolean }
): Promise<{ meta: Metadata; resolvedUri: string; found: boolean }> {
  return getBestSeoBySlug('', 'home', opts);
}
