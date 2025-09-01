import "server-only"; 

import { Post, GraphQLError } from '@/lib/types';
import { normalizeImages } from '../helper_functions/featured_image';
import { wpGraphQLCached, wpRestCached } from "../wpCached";

export async function getAllPosts({
  first = 100,
  after,
  last,
  before,
}: {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
} = {}): Promise<Post[]> {
  const query = `
  query AllPostsFull(
  $first:  Int
  $after:  String
  $last:   Int
  $before: String
) {
  posts(first: $first, after: $after, last: $last, before: $before) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    nodes {
      ...PostFull
    }
  }
}

fragment MediaFields on MediaItem {
  id
  altText
  sourceUrl
  mimeType
  mediaDetails {
    width
    height
    file
    sizes {
      name
      sourceUrl
      width
      height
    }
  }
}

fragment TermFields on TermNode {
  id
  name
  slug
  uri
  description
}

fragment AuthorFields on User {
  id
  name
  slug
  uri
  avatar {
    url
    width
    height
  }
}

fragment PostFull on Post {
  id
  databaseId
  slug
  uri
  status
  isSticky
  title(format: RENDERED)
  excerpt(format: RENDERED)
  content(format: RENDERED)
  date
  modified

  featuredImage {
    node { ...MediaFields }
  }

  author { node { ...AuthorFields } }
  categories { nodes { ...TermFields } }
  tags       { nodes { ...TermFields } }

  # — SEO removed until plugin exposes matching fields —
}

    
  `;

  try {
     const data = await wpGraphQLCached<{
      data?: { posts?: { nodes: Post[] } };
      errors?: GraphQLError[];
    }>(
      query,
      { first, after, last, before },
      { revalidate: 300, tags: ['posts'] }
    );

    if (data?.errors) {
      console.error('getAllPosts errors:', data.errors);
      return [];
    }

    const rawPosts = data?.data?.posts?.nodes ?? [];
    return normalizeImages(rawPosts);
   
  } catch (error) {
    console.error('getAllPosts failed:', error);
    return [];
  }
}

/** ─────────────────────────────
 * Types/guards to avoid `any`
 * ───────────────────────────── */
type WPPostNodes<T> = { data?: { posts?: { nodes?: T[] } } };

interface FeaturedImageObject {
  node?: {
    sourceUrl?: string;
  };
}

interface RawView {
  id: string | number;
  title: string;
  slug: string;
  featuredImage: string | FeaturedImageObject | null | undefined;
  date: string;
  author_name: string;
  excerpt?: string;
}

/** Response for /top-posts?popular: can be array or a {data.posts.nodes} wrapper */
type PopularAPIResponse = RawView[] | WPPostNodes<RawView>;

function isWPPostNodes<T>(v: unknown): v is WPPostNodes<T> {
  return typeof v === 'object' && v !== null && 'data' in v;
}

export async function get_popular_post(): Promise<Post[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_HOST_URL}/wp-json/hpv/v1/top-posts?popular`;

    const json = await wpRestCached<PopularAPIResponse>(
      url,
      { revalidate: 300, tags: ['popular'] }
    );

    const rawPosts: RawView[] = Array.isArray(json)
      ? json
      : (isWPPostNodes<RawView>(json) ? (json.data?.posts?.nodes ?? []) : []);

    // Convert RawView[] to Post[] and ensure id is string and featuredImage is normalized
    return normalizeImages(
      rawPosts.map((item) => {
        let normalizedImage;
        if (typeof item.featuredImage === 'string' && item.featuredImage) {
          normalizedImage = { node: { sourceUrl: item.featuredImage } };
        } else if (
          typeof item.featuredImage === 'object' &&
          item.featuredImage?.node?.sourceUrl
        ) {
          normalizedImage = { node: { sourceUrl: item.featuredImage.node.sourceUrl } };
        } else {
          normalizedImage = undefined;
        }

        return {
          ...item,
          id: String(item.id),
          featuredImage: normalizedImage,
        };
      })
    );
  } catch (error) {
    console.log('An error occured', error);
    return [];
  }
}

type PostByPeriod = Array<{
  id: string;
  title: string;
  slug: string;
  category?: string;
  featuredImage?: { node: { sourceUrl: string } };
  date: string;
  excerpt?: string;
}>;

/** Shape used to derive category when present */
type Categoryish = {
  category?: string;
  categories?: { nodes?: Array<{ name?: string }> };
};

/** Union the view with optional category/cats for safe access */
type ViewLike = RawView & Categoryish;

export async function getPostByPeriod(
  period: "week" | "month"
): Promise<PostByPeriod> {
  try {
    const url = `${process.env.NEXT_PUBLIC_HOST_URL}/wp-json/hpv/v1/top-posts?period=${period}`;

    const data = await wpRestCached<unknown>(url, { revalidate: 400, tags: ['views'] });

    if (!Array.isArray(data)) {
      console.error('[getViews] payload is not an array:', data);
      return [];
    }

    const raw = data as ViewLike[];

    const getCategory = (item: ViewLike): string | undefined => {
      if (typeof item.category === 'string' && item.category.trim()) return item.category.trim();
      const nodes = item.categories?.nodes;
      if (Array.isArray(nodes) && nodes.length > 0) {
        const first = nodes[0]?.name;
        if (typeof first === 'string' && first.trim()) return first.trim();
      }
      return undefined;
    };

    return raw.map((item) => {
      let normalizedImage: string | undefined;
      if (typeof item.featuredImage === 'string' && item.featuredImage) {
        normalizedImage = item.featuredImage;
      } else if (
        typeof item.featuredImage !== 'string' &&
        item.featuredImage?.node?.sourceUrl
      ) {
        normalizedImage = item.featuredImage.node.sourceUrl as string;
      }

      return {
        id: String(item.id),
        title: item.title?.trim() ?? '',
        slug: item.slug,
        category: getCategory(item),
        featuredImage: normalizedImage ? { node: { sourceUrl: normalizedImage } } : undefined,
        date: item.date,
        excerpt: item.excerpt ?? '',
        // extra field kept as-is in your mapping:
        // type: 'post',
      };
    });
  } catch (err) {
    console.error('[getViews] fetch failed:', err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const query = `
    query GetPostBySlug($slug: String!) {
      postBy(slug: $slug) {
        databaseId
        title
        content
        excerpt
        slug
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        author {
      node {
        name
        description
        avatar {
          url
        }
      }
}
        categories {
          nodes {
            name
          }
        }
        tags {
          nodes {
            name
          }
        }
      }
    }
  `;

  try {
    const json = await wpGraphQLCached<{
      data?: { postBy?: Post };
      errors?: GraphQLError;
    }>(
      query,
      { slug },
      { revalidate: 300, tags: [`post-${slug}`] }
    );

    const post = json?.data?.postBy;
    if (!post) return null;

    const normalized = normalizeImages(post);
    if (Array.isArray(normalized)) return null;

    return normalized;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export async function getRecommendation(): Promise<Post[]> {  
  const query = `
    {
      posts(first: 100) {
        nodes {
          id
          title
          slug
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `;

  try {
    
   const json = await wpGraphQLCached<{
      data?: { posts?: { nodes: Post[] } };
      errors?: GraphQLError;
    }>(
      query,
      {},
      { revalidate: 604800, tags: ['recommendation'] } // 7 days
    );

    return json?.data?.posts?.nodes ?? [];
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}

type TodayPost = Record<string, unknown>;

export async function getTodaysPosts(limit: number = 5) {
  const url = `${process.env.NEXT_PUBLIC_HOST_URL}/wp-json/hpv/v1/today-posts`;
  const data = await wpRestCached<TodayPost[]>(url, { revalidate: 60 * 60, tags: ['today-posts'] });
  return Array.isArray(data) ? data.slice(0, limit) : [];
}