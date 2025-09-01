import "server-only"; 

import { signedFetch } from "../security/signedFetch";
/**
 * Fetches all authors from the WordPress GraphQL API.
 * @returns {Promise<Array>} A promise that resolves to an array of authors.
 * @throws {Error} If the fetch operation fails or the response is not ok.
*/

export async function getAllAuthors() {
  const query = `
        query AllAuthors {
            users {
                nodes {
                id
                name
                slug
                description
                avatar {
                    url
                }
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
    return data.data.users.nodes;
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw new Error('Failed to fetch authors');
  }
}

/**
 * Fetches a specific author by their slug from the WordPress GraphQL API.
 * @param {string} slug - The slug of the author to fetch.
 * @returns {Promise<Object>} A promise that resolves to the author's data.
 * @throws {Error} If the fetch operation fails or the response is not ok.
*/

export async function getAuthorBySlug(slug: string) {
  const query = `
    query GetAuthorBySlug($slug: ID!) {
      user(id: $slug, idType: SLUG) {
        name
        description
        avatar {
          url
        }
        posts(first: 20) {
          nodes {
            id
            title
            slug
            date
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
    }
  `;

  try {
    const res = await signedFetch(process.env.WP_GRAPHQL_URL!, {
      method: 'POST',
      json: { query, variables: { slug } },
      next: { revalidate: 600, tags: [`author-${slug}`] },
    });

    if (!res.ok) throw new Error(`Network error: ${res.status}`);

    const { data, errors } = await res.json();
    if (errors) throw new Error(JSON.stringify(errors));

    return data.user;
  } catch (error) {
    console.error('Error occurred in getAuthorBySlug:', error);
    throw error;
  }
}
