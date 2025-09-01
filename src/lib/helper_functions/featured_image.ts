// types.ts

import { Post } from '@/lib/types';
import FEATURED_IMAGE from '../../../public/next.svg';
const FEATURED_ALT = 'Default featured image';

export function normalizeFlatImages(posts: Post[]): Post[] {
  return posts.map(normalizeFlatFeaturedImage);
}

export function normalizeFlatFeaturedImage(post: Post): Post {
  const updated = { ...post };

  // If featuredImage is missing, empty, or has a fallback url, patch with default object
  if (
    !updated.featuredImage ||
    typeof updated.featuredImage !== 'object' ||
    !('node' in updated.featuredImage) ||
    !updated.featuredImage.node ||
    typeof updated.featuredImage.node.sourceUrl !== 'string' ||
    updated.featuredImage.node.sourceUrl === '' ||
    updated.featuredImage.node.sourceUrl.includes('fallback')
  ) {
    return {
      ...updated,
      featuredImage: {
        node: {
          sourceUrl: FEATURED_IMAGE as string,
          altText: FEATURED_ALT,
        },
      },
    };
  }

  // Patch missing altText for image objects (optional)
  if (!updated.featuredImage.node.altText) {
    return {
      ...updated,
      featuredImage: {
        node: {
          ...updated.featuredImage.node,
          altText: FEATURED_ALT,
        },
      },
    };
  }

  return updated;
}

export function normalizeFeaturedImage(post: Post): Post {
  const updated: Post = { ...post };

  const fi = updated.featuredImage;

  if (
    !fi ||
    typeof fi !== 'object' ||
    !('node' in fi) ||
    !fi.node ||
    typeof fi.node !== 'object' ||
    !fi.node.sourceUrl ||
    fi.node.sourceUrl === '' ||
    fi.node.sourceUrl.includes('fallback')
  ) {
    // Set to default
    updated.featuredImage = {
      node: {
        sourceUrl: FEATURED_IMAGE as string,
        altText: FEATURED_ALT,
      },
    };
  } else {
    // If altText is missing, patch it too (optional)
    updated.featuredImage = {
      node: {
        ...fi.node,
        altText: fi.node.altText || FEATURED_ALT,
      },
    };
  }

  return updated;
}

/**
 * Normalize an array or single post with nested featuredImage.node
 */
export function normalizeImages<T extends Post | Post[]>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(normalizeFeaturedImage) as T;
  }
  return normalizeFeaturedImage(input) as T;
}
