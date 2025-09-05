// lib/graph_queries/getSiteTagline.ts
import 'server-only';
import { signedFetch } from '../security/signedFetch';

export async function getSiteTagline(): Promise<string> {
  const endpoint = process.env.WP_GRAPHQL_URL; 
  if (!endpoint) {
    console.error('WP_GRAPHQL_URL is not set');
    return '';
  }

  try {
     const res = await signedFetch(endpoint, {
      method: 'POST',
      json: {
        query: `query { generalSettings { description } }`,
      },
      next: { revalidate: 3000 }, 
    });

    if (!res.ok) return '';
    const json = await res.json();
    return json?.data?.generalSettings?.description ?? '';
  } catch (e) {
    console.error('getSiteTagline error:', e);
    return '';
  }
}
