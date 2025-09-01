// lib/seo.ts
import type { Metadata } from 'next';

// ----------------- Types -----------------

// Allowed OG types from Next.js Metadata
// OpenGraph type does not have a 'type' property in Next.js Metadata, so define OgType directly
type OgType =
  | 'website'
  | 'article'
  | 'book'
  | 'profile'
  | 'music.song'
  | 'music.album'
  | 'music.playlist'
  | 'music.radio_station'
  | 'video.movie'
  | 'video.episode'
  | 'video.tv_show'
  | 'video.other';

const ALLOWED_OG_TYPES: readonly OgType[] = [
  'website',
  'article',
  'book',
  'profile',
  'music.song',
  'music.album',
  'music.playlist',
  'music.radio_station',
  'video.movie',
  'video.episode',
  'video.tv_show',
  'video.other',
] as const;

function toOgType(input: string | null | undefined, fallback: OgType): OgType {
  return (input && (ALLOWED_OG_TYPES as readonly string[]).includes(input))
    ? (input as OgType)
    : fallback;
}

type GeneralSettings = {
  title: string;
  description: string;
};

type TermNode = {
  name?: string | null;
  slug?: string | null;
};

type RankMathOpenGraph = {
  title?: string | null;
  description?: string | null;
  type?: string | null;
  url?: string | null;
  siteName?: string | null;
  image?: { url?: string | null } | null;
  updatedTime?: string | null;
};

type RankMathBreadcrumb = {
  isHidden: boolean;
  text: string;
  url: string;
};

type RankMathSeo = {
  title?: string | null;
  description?: string | null;
  canonicalUrl?: string | null;
  breadcrumbTitle?: string | null;
  /** RankMath can return either a CSV string or an array depending on config */
  focusKeywords?: string[] | string | null;
  robots?: string[] | null;
  breadcrumbs?: RankMathBreadcrumb[] | null;
  openGraph?: RankMathOpenGraph | null;
};

type NodeFeaturedImage = {
  node?: {
    sourceUrl?: string | null;
    altText?: string | null;
    mediaDetails?: { width?: number | null; height?: number | null } | null;
  } | null;
};

type NodeAuthor = { node?: { name?: string | null; uri?: string | null } | null } | null;

type SeoNodeByUri = {
  __typename?:
    | 'Post'
    | 'Page'
    | 'Category'
    | 'Tag'
    | 'User'
    | 'slug'
    | 'TermNode'
    | string
    | undefined;
  uri?: string | null;
  title?: string | null;
  seo?: RankMathSeo | null;
  terms?: { nodes?: TermNode[] | null } | null;
  featuredImage?: NodeFeaturedImage | null;
  author?: NodeAuthor;
  date?: string | null;
  modified?: string | null;
  slug?: string | null;
  name?: string | null; // for User
};

type SeoResponse = {
  nodeByUri: SeoNodeByUri | null;
  generalSettings: GeneralSettings;
};

// ----------------- WP Fetch -----------------

export async function wpFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 600, tags: ['seo'] },
    ...init,
  });

  if (!res.ok) throw new Error(`WPGraphQL error: ${res.statusText}`);
  const json = (await res.json()) as { data: T; errors?: unknown };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const SEO_BY_URI = /* GraphQL */ `
  query SeoByUri($uri: String!) {
    nodeByUri(uri: $uri) {
      __typename
      ... on UniformResourceIdentifiable { uri }

      ... on NodeWithRankMathSeo {
        seo {
          title
          description
          canonicalUrl
          breadcrumbTitle
          focusKeywords
          robots
          breadcrumbs { isHidden text url }
          openGraph {
            title
            description
            type
            url
            siteName
            image { url }
            updatedTime
          }
        }
      }

      ... on NodeWithTitle { title }
      ... on NodeWithFeaturedImage {
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails { width height }
          }
        }
      }
      ... on NodeWithAuthor {
        author { node { name uri } }
      }
      ... on Post {
        date
        modified
        terms(first: 20) { nodes { __typename name slug } }
      }
      ... on Page { date modified }
      ... on TermNode { databaseId name slug }
      ... on User { name slug }
    }

    generalSettings { title description }
  }
`;

export type SeoQueryResult = Awaited<ReturnType<typeof getSeo>>;

export async function getSeo(uri: string) {
  // FIX: the generic should be the full response shape, not nested
  const data = await wpFetch<SeoResponse>(SEO_BY_URI, { uri });
  return { ...data, __requestedUri: uri };
}

// ----------------- Build Metadata -----------------

export function buildMetadataFromSeo(
  payload: SeoQueryResult & { __requestedUri?: string },
  opts?: { metadataBase?: string; siteName?: string; defaultOgImage?: string }
): Metadata {
  const node = payload?.nodeByUri ?? null;
  const seo = node?.seo ?? null;

  const base = new URL(
    opts?.metadataBase || process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost'
  );

  // detect taxonomy pages
  const isTerm = node?.__typename === 'Tag' || node?.__typename === 'Category';

  // ---- TITLE ----
  const title =
    seo?.title ??
    node?.title ??
    payload?.generalSettings?.title ??
    process.env.NEXT_PUBLIC_HOSTNAME ??
    '';

  // ---- DESCRIPTION ----
  const description =
    seo?.description ??
    payload?.generalSettings?.description ??
    '';

  // ---- CANONICAL ----
  let canonicalUrl: string | undefined = seo?.canonicalUrl ?? undefined;
  if (!canonicalUrl) {
    const uri = node?.uri ?? payload.__requestedUri ?? '';
    if (uri) canonicalUrl = new URL(uri.replace(/^\//, ''), base).toString();
  }

  // ---- KEYWORDS ----
  const focusKeywords: string[] =
    Array.isArray(seo?.focusKeywords)
      ? (seo!.focusKeywords!.filter(Boolean) as string[])
      : typeof seo?.focusKeywords === 'string' && seo.focusKeywords
      ? seo.focusKeywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

  const termKeywords: string[] =
    node?.terms?.nodes?.map((t) => t?.name ?? '').filter(Boolean) ?? [];

  // taxonomy fallback for Tag/Category pages
  const taxonomyFallback: string[] =
    isTerm ? [node?.name ?? '', node?.slug ?? ''].filter(Boolean) : [];

  const keywords = Array.from(new Set([...focusKeywords, ...termKeywords, ...taxonomyFallback]))
    .filter(Boolean);

  // ---- ROBOTS ----
  const robotsArr: string[] = Array.isArray(seo?.robots) ? (seo!.robots as string[]) : [];
  const robotsSet = new Set(robotsArr.map((s) => (s || '').toLowerCase()));
  const robots: Metadata['robots'] = {
    index: robotsSet.has('index') ? true : robotsSet.has('noindex') ? false : true,
    follow: robotsSet.has('follow') ? true : robotsSet.has('nofollow') ? false : true,
    noarchive: (robotsSet.has('noarchive') || undefined) as true | undefined,
    nosnippet: (robotsSet.has('nosnippet') || undefined) as true | undefined,
    googleBot: {
      index: robotsSet.has('index') ? true : robotsSet.has('noindex') ? false : true,
      follow: robotsSet.has('follow') ? true : robotsSet.has('nofollow') ? false : true,
      noimageindex: (robotsSet.has('noimageindex') || undefined) as true | undefined,
    },
  };

  // ---- FEATURED IMAGE ----
  const featured =
    node?.featuredImage?.node && node.featuredImage.node.sourceUrl
      ? {
          url: node.featuredImage.node.sourceUrl,
          width: node.featuredImage.node.mediaDetails?.width ?? undefined,
          height: node.featuredImage.node.mediaDetails?.height ?? undefined,
          alt: node.featuredImage.node.altText ?? undefined,
        }
      : undefined;

  const ogImageUrl: string | undefined =
    seo?.openGraph?.image?.url ??
    featured?.url ??
    opts?.defaultOgImage ??
    process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE;

  // ---- DATES / AUTHOR ----
  const publishedTime = node?.date ? new Date(node.date).toISOString() : undefined;
  const modifiedTime = node?.modified ? new Date(node.modified).toISOString() : undefined;
  const authorName =
    node?.author?.node?.name ?? (node?.__typename === 'User' ? node?.name ?? undefined : undefined);

  // ---- SITE NAME ----
  const siteName =
    seo?.openGraph?.siteName ??
    opts?.siteName ??
    payload?.generalSettings?.title ??
    process.env.NEXT_PUBLIC_HOSTNAME;

  // ---- OPEN GRAPH ----
  const fallbackType: OgType =
    node?.__typename === 'User' ? 'profile'
    : isTerm ? 'website'
    : 'article';

  const openGraph: NonNullable<Metadata['openGraph']> = {
    title: seo?.openGraph?.title ?? title ?? undefined,
    description: seo?.openGraph?.description ?? description ?? undefined,
    url: canonicalUrl ?? seo?.openGraph?.url ?? undefined,
    siteName: siteName ?? undefined,
    // Force "website" for Tag/Category; otherwise clamp RankMath type to allowed list.
    type: isTerm ? 'website' : toOgType(seo?.openGraph?.type ?? undefined, fallbackType),
    images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    ...(publishedTime ? { publishedTime } : {}),
    ...(modifiedTime ? { modifiedTime } : {}),
  };

  // ---- TWITTER ----
  const twitter: NonNullable<Metadata['twitter']> = {
    card: ogImageUrl ? 'summary_large_image' : 'summary',
    title: title ?? undefined,
    description: description ?? undefined,
    images: ogImageUrl ? [ogImageUrl] : undefined,
  };

  // ---- BREADCRUMBS (filter hidden) ----
  const breadcrumbs: RankMathBreadcrumb[] =
    (seo?.breadcrumbs?.filter((b): b is RankMathBreadcrumb => !!b && !b.isHidden)) ?? [];

  // ----------------- JSON-LD -----------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLd: any[] = [];

  // Identify homepage
  const isHomepage =
    (node?.__typename === 'Page' && ((node?.uri ?? '') === '/' || (payload.__requestedUri ?? '') === '/')) ||
    (!node && (payload.__requestedUri ?? '') === '/');

  // Organization (homepage only)
  if (isHomepage) {
    const sameAs =
      (process.env.NEXT_PUBLIC_ORG_SAME_AS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: new URL('/', base).toString(),
      ...(process.env.NEXT_PUBLIC_ORG_LOGO ? { logo: process.env.NEXT_PUBLIC_ORG_LOGO } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    });

    // Optional: WebSite + SiteLinks Search
    if (process.env.NEXT_PUBLIC_SEARCH_URL) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: new URL('/', base).toString(),
        name: siteName,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${process.env.NEXT_PUBLIC_SEARCH_URL}?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      });
    }
  }

  // BreadcrumbList (when available)
  if (breadcrumbs.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.text,
        item: new URL((b.url || '').replace(/^\//, ''), base).toString(),
      })),
    });
  }

  // Article / WebPage per route type
  if (node?.__typename === 'Post') {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      mainEntityOfPage: canonicalUrl,
      ...(ogImageUrl ? { image: [ogImageUrl] } : {}),
      ...(publishedTime ? { datePublished: publishedTime } : {}),
      ...(modifiedTime ? { dateModified: modifiedTime } : {}),
      ...(authorName ? { author: { '@type': 'Person', name: authorName } } : {}),
      publisher: {
        '@type': 'Organization',
        name: siteName,
        ...(process.env.NEXT_PUBLIC_ORG_LOGO
          ? { logo: { '@type': 'ImageObject', url: process.env.NEXT_PUBLIC_ORG_LOGO } }
          : {}),
      },
    });
  } else if (node?.__typename === 'Page' || node?.__typename === 'TermNode' || isTerm) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonicalUrl,
    });
  }

  // Person (author profile page)
if (node?.__typename === 'User') {
  jsonLd.push({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorName || title,
    url: canonicalUrl,
    // If you later expose avatar or social links for users in WPGraphQL,
    // you can add: image, sameAs, jobTitle, description, etc.
  });
}

  // ---- FINAL ----
  const metadata: Metadata = {
    metadataBase: base,
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    robots,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph,
    twitter,
    other: {
      // keep breadcrumbs available to the app if you want them
      rankMathBreadcrumbs: JSON.stringify(breadcrumbs),
      rankMathBreadcrumbTitle: seo?.breadcrumbTitle ?? undefined,
      // expose JSON-LD to render via a script tag in your layout/page
      jsonLd: jsonLd.length ? JSON.stringify(jsonLd) : undefined,
    },
    ...(authorName ? { authors: [{ name: authorName }] } : {}),
  };

  return metadata;
}