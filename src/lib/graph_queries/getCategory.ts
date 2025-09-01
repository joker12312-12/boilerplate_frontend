// src/lib/graph_queries/categories.ts
import "server-only";
import { wpGraphQLCached } from "@/lib/wpCached";
import { ICategory } from "../types";

export type Category = { id: string; name: string; slug: string };

const CATEGORY_QUERY = /* GraphQL */ `
  query AllCategories(
    $first: Int!
    $after: String
    $hideEmpty: Boolean!
    $orderby: TermObjectsConnectionOrderbyEnum!
    $order: OrderEnum!
  ) {
    categories(
      first: $first
      after: $after
      where: { hideEmpty: $hideEmpty, orderby: $orderby, order: $order }
    ) {
      nodes {
        id
        name
        slug
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const CATEGORY_QUERY_LEGACY = /* GraphQL */ `
  query AllCategoriesLegacy(
    $first: Int!
    $after: String
    $hideEmpty: Boolean!
    $orderby: TermObjectsConnectionOrderbyEnum!
    $order: OrderEnum!
  ) {
    categories(
      first: $first
      after: $after
      where: { hideEmpty: $hideEmpty, orderby: { field: $orderby, order: $order } }
    ) {
      nodes { id name slug }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

// --- Types for responses (no `any`) ---
type GQLError = { message: string };

type CatsPage = {
  data?: {
    categories?: {
      nodes?: Array<{ id: string; name: string; slug: string | null }>;
      pageInfo?: { hasNextPage: boolean; endCursor?: string | null };
    };
  };
  errors?: GQLError[];
};

// ============================
// All categories (paginated)
// ============================
export async function getAllCategories({
  pageSize = 15,
  hideEmpty = true,
  orderby = "NAME",
  order = "ASC",
}: {
  pageSize?: number;
  hideEmpty?: boolean;
  orderby?: "NAME" | "COUNT" | "TERM_ORDER" | "SLUG";
  order?: "ASC" | "DESC";
} = {}): Promise<Category[]> {
  const size = Math.max(1, Math.min(pageSize, 100));
  let after: string | null = null;
  const all: Category[] = [];
  const seen = new Set<string>();
  let useLegacy = false;

  const runPage = async (query: string): Promise<CatsPage> =>
    wpGraphQLCached<CatsPage>(
      query,
      { first: size, after, hideEmpty, orderby, order },
      { revalidate: 86400, tags: ["categories"] } // 24h + tag for webhook invalidation
    );

  try {
    do {
      let json = await runPage(useLegacy ? CATEGORY_QUERY_LEGACY : CATEGORY_QUERY);

      // Retry once with legacy shape if enum/object mismatch appears
      if (
        !useLegacy &&
        json?.errors?.some(
          (e) =>
            String(e.message).includes("TermObjectsConnectionOrderbyEnum") &&
            String(e.message).includes("cannot represent non-enum value")
        )
      ) {
        useLegacy = true;
        json = await runPage(CATEGORY_QUERY_LEGACY);
      }

      if (json.errors?.length) {
        const msg = json.errors.map((e) => e.message).join(" | ");
        throw new Error(`GraphQL error(s): ${msg}`);
      }

      const nodes = json?.data?.categories?.nodes ?? [];
      const pageInfo = json?.data?.categories?.pageInfo;

      for (const n of nodes) {
        if (n?.id && n?.name && n?.slug && !seen.has(n.id)) {
          seen.add(n.id);
          all.push({ id: n.id, name: n.name, slug: n.slug });
        }
      }
      after = pageInfo?.hasNextPage ? pageInfo?.endCursor ?? null : null;
    } while (after);

    // Optional: stable A–Z
    all.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    return all;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error fetching categories:", message);
    throw new Error("Failed to fetch categories");
  }
}

// ======================================
// Single category (slug) + first posts
// ======================================

type GqlMaybe<T> = T | null | undefined;

type GqlImageNode = {
  sourceUrl: string;
  altText?: string | null;
};

type GqlAuthorNode = {
  id: string;
  name: string;
  slug: string;
  avatar?: { url: string } | null;
};

type GqlPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  date: string;
  featuredImage?: { node?: GqlImageNode | null } | null;
  author?: { node?: GqlAuthorNode | null } | null;
};

type GqlCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  count?: number | null;
  parent?: { node?: { id: string; name: string; slug: string } | null } | null;
  posts?: {
    pageInfo?: { hasNextPage?: boolean | null; endCursor?: string | null } | null;
    nodes?: GqlMaybe<GqlPost[]>; // could be undefined or null
  } | null;
};

type CategoryBySlugResp = {
  data?: { category?: GqlCategory | null } | null;
  errors?: Array<{ message: string }>;
};


function toICategory(raw: GqlCategory): ICategory {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? "",
    count: raw.count ?? 0,

    // ✅ Enforce { node: ... } | null (no optional node)
    parent: raw.parent?.node
      ? { node: { id: raw.parent.node.id, name: raw.parent.node.name, slug: raw.parent.node.slug } }
      : null,

    // ✅ Normalize posts shape
    posts: {
      pageInfo: {
        hasNextPage: Boolean(raw.posts?.pageInfo?.hasNextPage),
        endCursor: raw.posts?.pageInfo?.endCursor ?? null,
      },
      nodes: (raw.posts?.nodes ?? []).map((n) => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt ?? "",
        date: n.date,
        featuredImage: n.featuredImage?.node
          ? { node: { sourceUrl: n.featuredImage.node.sourceUrl, altText: n.featuredImage.node.altText ?? "" } }
          : null,
        author: n.author?.node
          ? { node: { id: n.author.node.id, name: n.author.node.name, slug: n.author.node.slug, avatar: n.author.node.avatar ?? null } }
          : null,
      })),
    },
  };
}


export async function getCategoryBySlug(slug: string, after?: string): Promise<ICategory | null> {
  const query = /* GraphQL */ `
    query CategoryBySlug($slug: ID!, $after: String) {
      category(id: $slug, idType: SLUG) {
        id
        name
        slug
        description
        count
        parent { node { id name slug } }
        posts(first: 6, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            title
            slug
            excerpt
            date
            featuredImage { node { sourceUrl altText } }
            author { node { id name slug avatar { url } } }
          }
        }
      }
    }
  `;

  try {
    const json = await wpGraphQLCached<CategoryBySlugResp>(
      query,
      { slug, after },
      { revalidate: 15 * 60, tags: ["categories", `category-${slug}`] }
    );

    if (json.errors?.length) {
      const msg = json.errors.map((e) => e.message).join(" | ");
      throw new Error(`GraphQL error(s): ${msg}`);
    }

    const category = json.data?.category ?? null;
    if (!category) return null;

    // 🔒 Single source of truth: normalize here
    return toICategory(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error fetching category:", message);
    throw new Error("Failed to fetch category");
  }
}