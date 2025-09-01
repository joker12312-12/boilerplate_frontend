import "server-only"; 
import { signedFetch } from "../security/signedFetch";

/**
 * 
 * @returns {Promise<Tag[]>} A promise that resolves to an array of tags.
 */

export async function getAllTags() {
  const query = `
    query AllTags {
      tags {
        nodes {
          id
          name
          slug
          description
          count
        }
      }
    }
  `;
  try {
   const res = await signedFetch(process.env.WP_GRAPHQL_URL!, {
    method: 'POST',
    json: { query },
    next: { revalidate: 86400 },
  });

    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data.tags.nodes;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw new Error('Failed to fetch tags');
  }
}






export async function getTagBySlug(slug: string, after?: string) {
  const query = `
    query TagBySlug($slug: ID!, $after: String) {
      tag(id: $slug, idType: SLUG) {
        id
        name
        slug
        description
        count
        posts(first: 6, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            title
            slug
            excerpt
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
            author {
              node {
                id
                name
                slug
                avatar {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await signedFetch(process.env.WP_GRAPHQL_URL!, {
      method: 'POST',
      json: { query, variables: { slug, after } },
      next: { revalidate: 3600, tags: [`tag-${slug}`] },
    });
    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.statusText}`);
    }

    const json = await res.json();


    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'GraphQL error');
    }

    // Check for the right field!
    if (!json.data || typeof json.data.tag === 'undefined') {
      return null;
    }

    return json.data.tag;
  } catch (error) {
    console.error('Error fetching tag:', error);
    throw new Error('Failed to fetch tag');
  }
}



