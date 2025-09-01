import { getPostBySlug } from '@/lib/graph_queries/getPost';
import { load } from 'cheerio';
import type { ITOCItem, Post } from '@/lib/types';
import { SinglePost } from './_components/SinglePost';
import NotFound from '../NotFound';
import type { Metadata } from 'next';
import { buildMetadataFromSeo, getSeo } from '@/lib/seo/seo';

type Params = Promise<{ slug: string | string[] }>;

async function extractHeadings(html: string): Promise<{ updatedHtml: string; toc: ITOCItem[] }> {
  const $ = load(html);
  const toc: ITOCItem[] = [];

  $('h2, h3, h4, h5, h6').each((_, el) => {
    const $el = $(el);
    const tag = el.tagName.toLowerCase();
    const level = parseInt(tag.charAt(1), 10);
    const text = $el.text().trim();

    const id =
      $el.attr('id') ||
      text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

    $el.attr('id', id);
    toc.push({ text, id, level });
  });

  const updatedHtml = $('body').html() ?? $.root().html() ?? '';
  return { updatedHtml, toc };
}

interface TwitterMeta {
  description?: string;
  [key: string]: unknown;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;

  // build a clean WP uri regardless of catch-all or single segment
  const segments = Array.isArray(slug) ? slug : [slug];
  const uri = `/${segments.join('/')}/`;

  const seoPayload = await getSeo(uri);

  const last = Array.isArray(slug) ? slug.at(-1)! : slug;
  const post = await getPostBySlug(last);

  if (!seoPayload?.nodeByUri && !post) {
    const siteUrl = process.env.NEXT_PUBLIC_HOST_URL!;
    const canonical = new URL(uri.replace(/^\//, ''), siteUrl).toString();
    return {
      title: `Not found - ${process.env.NEXT_PUBLIC_HOSTNAME}`,
      description: 'Sorry, this page was not found.',
      alternates: { canonical },
      robots: { index: false, follow: false },
      openGraph: {
        title: `Not found - ${process.env.NEXT_PUBLIC_HOSTNAME}`,
        description: 'Sorry, this page was not found.',
        url: canonical,
        images: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE
          ? [{ url: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE }]
          : undefined,
        type: 'website',
      },
      twitter: {
        card: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ? 'summary_large_image' : 'summary',
        title: `Not found - ${process.env.NEXT_PUBLIC_HOSTNAME}`,
        description: 'Sorry, this page was not found.',
        images: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE
          ? [process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE]
          : undefined,
      },
    };
  }

  const meta = buildMetadataFromSeo(seoPayload, {
    metadataBase: process.env.NEXT_PUBLIC_HOST_URL,
    siteName: process.env.NEXT_PUBLIC_HOSTNAME,
    defaultOgImage: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE,
  });

  // fallback description from WP excerpt if RankMath description missing
  if ((!meta.description || !meta.description.trim()) && post?.excerpt) {
    const plain = post.excerpt.replace(/<[^>]+>/g, '').trim();
    if (plain) {
      meta.description = plain;
      meta.openGraph = { ...meta.openGraph, description: meta.openGraph?.description ?? plain };
      const twitter = meta.twitter as TwitterMeta | undefined;
      meta.twitter = { ...twitter, description: twitter?.description ?? plain };
    }
  }

  return meta;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  try {
    const { slug } = await params;
    const last = Array.isArray(slug) ? slug.at(-1)! : slug;

    const post: Post | null = await getPostBySlug(last);
    if (!post) return <NotFound />;

    const { updatedHtml, toc } = await extractHeadings(String(post.content));

    // Inject JSON-LD for crawlers (rebuild from seo to read jsonLd string)
    const segments = Array.isArray(slug) ? slug : [slug];
    const uri = `/${segments.join('/')}/`;
    const seoPayload = await getSeo(uri);
    const metaForScript = buildMetadataFromSeo(seoPayload, {
      metadataBase: process.env.NEXT_PUBLIC_HOST_URL,
      siteName: process.env.NEXT_PUBLIC_HOSTNAME,
      defaultOgImage: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonLdRaw = (metaForScript.other as any)?.jsonLd as string | undefined;

    return (
      <>
        {jsonLdRaw ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdRaw }}
          />
        ) : null}
        <SinglePost initialPost={{ ...post, updatedHtml, toc }} />
      </>
    );
  } catch (e) {
    console.error('Error in PostPage:', e);
    return <NotFound />;
  }
}
