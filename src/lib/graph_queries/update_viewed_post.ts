import "server-only"; 
import { signedFetch } from "../security/signedFetch";

export async function update_viewed_post(postID: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_HOST_URL}/wp-json/hpv/v1/log-view/${postID}`;
    await signedFetch(url, {
      method: 'POST',
      cache: 'no-store',
    });

  } catch (error) {
    console.error('Error updating viewed post:', error);
  }
}
