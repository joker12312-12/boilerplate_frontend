import "server-only"; 
import { signedFetch } from "../security/signedFetch";


export async function getTagLine(): Promise<string> {
  try {
    const host = process.env.NEXT_PUBLIC_HOST_URL;
    if (!host) {
      console.error("getTagLine: NEXT_PUBLIC_HOST_URL is not set");
      return "";
    }

    const graphqlEndpoint = `${host.replace(/\/+$/, "")}/graphql`;

    const res = await signedFetch(graphqlEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "{ generalSettings { description } }",
      }),
    });

    if (!res.ok) {
      console.error("getTagLine: GraphQL HTTP error", res.status, await res.text());
      return "";
    }

    const json = await res.json();
    if (json?.errors?.length) {
      console.error("getTagLine: GraphQL errors", json.errors);
      return "";
    }

    return json?.data?.generalSettings?.description ?? "";
  } catch (err) {
    console.error("getTagLine: unexpected error", err);
    return "";
  }
}

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
