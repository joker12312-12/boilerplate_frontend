// app/components/Main-page/HeaderServer.tsx (RSC)
import { getAllCategories } from '@/lib/graph_queries/getCategory';
import Header from './Header';
import { getAllPosts } from '@/lib/graph_queries/getPost';

export default async function HeaderServer() {
  const initialCategories = await getAllCategories();
  const posts = await getAllPosts();
  return <Header initialCategories={initialCategories} posts={posts}/>;
}