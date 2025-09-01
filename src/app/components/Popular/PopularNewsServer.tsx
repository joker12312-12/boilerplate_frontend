// app/components/PopularNewsServer.tsx (Server Component)

import { getSiteTagline } from "@/lib/graph_queries/getSiteTagline";
import PopularNews from "./PopularPostsGrid";

type Props = React.ComponentProps<typeof PopularNews>;

export default async function PopularNewsServer(props: Omit<Props, 'tagline'>) {
  const tagline = await getSiteTagline(); 
  return <PopularNews {...props} tagline={tagline} />;
}
