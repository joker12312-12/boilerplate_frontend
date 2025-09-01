// app/page.tsx
import type { Metadata } from 'next';
import { getSeo, buildMetadataFromSeo } from '@/lib/seo/seo';

import PostsList from './components/Main-page/PostsList';
import PopularPosts from './components/Popular/PopularPosts';
// import AdPopup from './components/ads/adsPopup';
import CatsPage from './[slug]/_components/categoryWrapper';
import TradingViewScreener from './components/tickers/TradingViewScreener';
import FinanstidningSeoText from './seoTextMainPage';
// import { getLogo } from '@/lib/graph_queries/getLogo';
import { getAllPosts } from '@/lib/graph_queries/getPost';
// import AdsSection from './components/ads/AdsSection';

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getSeo('/');

  if (!payload?.nodeByUri) {
    return {
      title: process.env.NEXT_PUBLIC_HOSTNAME || 'Home',
      description: process.env.NEXT_PUBLIC_HOSTNAME || 'Welcome to our site.',
      robots: { index: true, follow: true },
    };
  }
  
  const meta = buildMetadataFromSeo(payload, {
    metadataBase: process.env.NEXT_PUBLIC_HOST_URL,
    siteName: process.env.NEXT_PUBLIC_HOSTNAME,
  });
  
  if (!meta.description) {
    meta.description = 'Latest news, insights and updates from our site.';
  }
  
  return {
    ...meta
  };
}

export default async function Page() {
  // const logo = await getLogo();
  const posts = await getAllPosts();

  return (
    <div>
      {/* <AdsSection /> */}
      <PopularPosts />
      {/* <AdsSection /> */}
      <TradingViewScreener />
      {/* <AdsSection /> */}
      <CatsPage />
      {/* <AdsSection /> */}
      <PostsList posts={posts}/>
      {/* <AdsSection /> */}
      <FinanstidningSeoText />
      {/* <AdPopup logo={logo}/> */}
    </div>
  );
}