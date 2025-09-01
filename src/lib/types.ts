export interface ISocial_Media_Props {
  className?: string;
  color?: string;
  width?: number;
  style?: React.CSSProperties;
}
export interface ITOCItem {
  id: string;
  text: string;
  level: number;
}

export interface MediaDetailsSize {
  name: string;
  sourceUrl: string;
  width: number;
  height: number;
}

export interface MediaDetails {
  width: number;
  height: number;
  file: string;
  sizes: MediaDetailsSize[];
}

export interface MediaItemNode {
  id?: string;
  altText?: string;
  sourceUrl: string;
  mimeType?: string;
  mediaDetails?: MediaDetails;
}

export interface PostWithTOC extends Post {
  updatedHtml: string;
  toc: ITOCItem[];
  featuredImage?: { node: MediaItemNode };
}

/** --- Author / User --- */
export interface AuthorAvatar {
  url?: string;
  width?: number;
  height?: number;
}

export interface AuthorNode {
  id: string;
  name: string;
  slug?: string;
  uri?: string;
  avatar?: AuthorAvatar;
  description?: string;
  featuredImage?: string;

  // Optional, and correct plural "nodes"
  posts?: {
    nodes: Post[];
  };
}

/** --- Terms (categories, tags) --- */
export interface TermNode {
  id: string;
  name: string;
  slug?: string;
  uri?: string;
  description?: string;
}

/** --- Comments --- */
export interface CommentAuthorNode {
  name: string;
  url?: string;
}

export interface Comment {
  id: string;
  date: string;
  content: string;
  parentId?: number;
  author?: {
    node: CommentAuthorNode;
  };
}

/** --- SEO / Open Graph --- */
export interface OpenGraphImage {
  secureUrl: string;
}

export interface OpenGraph {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  image?: OpenGraphImage;
}

export interface SEO {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  openGraph?: OpenGraph;
}

/** --- The Post interface --- */
export interface Post {
  id: string;
  databaseId?: number;
  slug: string;
  uri?: string;
  status?: string;
  isSticky?: boolean;
  author_name?: string;
  category?: string;
  title: string; 
  excerpt?: string;
  content?: string;
  date: string;
  modified?: string;
  commentCount?: number;

  featuredImage?: {
    node: MediaItemNode;
  };

  author?: {
    node: AuthorNode;
  };

  categories?: {
    nodes: TermNode[];
  };

  tags?: {
    nodes: TermNode[];
  };

  comments?: {
    nodes: Comment[];
  };

  seo?: SEO;
}


export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

export interface Logo {
  sourceUrl: string;
  altText?: string | null;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
  image?: {
    sourceUrl: string;
    altText?: string | null;
  } | null;
  parent?: {
    node: {
      id: string;
      name: string;
      slug: string;
    }
  } | null;
  posts: {
    nodes: Array<{
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      date: string;
      featuredImage?: {
        node: {
          sourceUrl: string;
          altText?: string | null;
        } | null;
      } | null;
      author?: {
        node?: {
          id: string;
          name: string;
          slug: string;
          avatar?: {
            url?: string;
          };
        };
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}


export type AdItem = {
  type: 'ad';
  adIndex: number; // Index in your ADS array
  id: string | number;
};

// 2. Type for a single post item in the feed:
export type PostItem = Post & {
  type: 'post';
};

// 3. Union type for all possible items:
export type FeedItem = AdItem | PostItem;